import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User, IUser } from '../models/User';
import { VerificationToken, TokenType } from '../models/VerificationToken';
import { SessionManager } from '../config/redis';
import { EmailService } from './EmailService';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * JWT payload interface
 */
interface IJWTPayload {
  userId: string;
  email: string;
  sessionId: string;
  type: 'access' | 'refresh';
}

/**
 * Authentication tokens interface
 */
interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

/**
 * Login result interface
 */
interface ILoginResult {
  user: Omit<IUser, 'password_hash' | 'two_factor_secret'>;
  tokens: IAuthTokens;
  requiresTwoFactor?: boolean;
}

/**
 * Authentication service
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<{ user: IUser; verificationToken: string }> {
    // Check if user already exists
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Validate password strength
    this.validatePassword(userData.password);
    
    // Create user
    const user = await User.create(userData);
    
    // Create email verification token
    const token = await VerificationToken.create(
      user.id,
      TokenType.EMAIL_VERIFICATION,
      24 * 60 // 24 hours
    );
    
    // Send verification email
    await EmailService.sendVerificationEmail(user.email, token.token);
    
    logger.info(`User registered: ${user.email}`);
    
    return {
      user,
      verificationToken: token.token,
    };
  }
  
  /**
   * Login user
   */
  static async login(
    email: string,
    password: string,
    rememberMe: boolean = false,
    twoFactorCode?: string
  ): Promise<ILoginResult> {
    const user = await User.findByEmail(email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check if account is locked
    if (User.isLocked(user)) {
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }
    
    // Check if account is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(user, password);
    if (!isPasswordValid) {
      await User.incrementFailedAttempts(user.id);
      throw new Error('Invalid credentials');
    }
    
    // Check two-factor authentication
    if (user.two_factor_enabled) {
      if (!twoFactorCode) {
        return {
          user: await User.getProfile(user.id) as any,
          tokens: {} as IAuthTokens,
          requiresTwoFactor: true,
        };
      }
      
      const isValidTwoFactor = speakeasy.totp.verify({
        secret: user.two_factor_secret!,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2,
      });
      
      if (!isValidTwoFactor) {
        throw new Error('Invalid two-factor authentication code');
      }
    }
    
    // Reset failed attempts
    await User.resetFailedAttempts(user.id);
    
    // Generate tokens
    const tokens = await this.generateTokens(user, rememberMe);
    
    // Store session
    await this.createSession(user.id, tokens.sessionId, rememberMe);
    
    logger.info(`User logged in: ${user.email}`);
    
    return {
      user: await User.getProfile(user.id) as any,
      tokens,
    };
  }
  
  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as IJWTPayload;
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      // Check if session exists
      const session = await SessionManager.getSession(payload.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      // Get user
      const user = await User.findById(payload.userId);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }
      
      // Generate new tokens
      const tokens = await this.generateTokens(user, session.rememberMe, payload.sessionId);
      
      // Update session
      await this.updateSession(payload.sessionId, session.rememberMe);
      
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  /**
   * Logout user
   */
  static async logout(sessionId: string, userId: string): Promise<void> {
    await SessionManager.deleteSession(sessionId);
    await SessionManager.removeUserSession(userId, sessionId);
    
    logger.info(`User logged out: ${userId}`);
  }
  
  /**
   * Logout from all devices
   */
  static async logoutAll(userId: string): Promise<void> {
    await SessionManager.terminateAllUserSessions(userId);
    
    logger.info(`User logged out from all devices: ${userId}`);
  }
  
  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<void> {
    const verificationToken = await VerificationToken.validateToken(
      token,
      TokenType.EMAIL_VERIFICATION
    );
    
    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }
    
    await User.verifyEmail(verificationToken.user_id);
    await VerificationToken.markAsUsed(verificationToken.id);
    
    logger.info(`Email verified for user: ${verificationToken.user_id}`);
  }
  
  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await User.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists
      return;
    }
    
    const token = await VerificationToken.create(
      user.id,
      TokenType.PASSWORD_RESET,
      60 // 1 hour
    );
    
    await EmailService.sendPasswordResetEmail(user.email, token.token);
    
    logger.info(`Password reset requested for user: ${user.email}`);
  }
  
  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const verificationToken = await VerificationToken.validateToken(
      token,
      TokenType.PASSWORD_RESET
    );
    
    if (!verificationToken) {
      throw new Error('Invalid or expired reset token');
    }
    
    this.validatePassword(newPassword);
    
    await User.updatePassword(verificationToken.user_id, newPassword);
    await VerificationToken.markAsUsed(verificationToken.id);
    
    // Terminate all sessions for security
    await SessionManager.terminateAllUserSessions(verificationToken.user_id);
    
    logger.info(`Password reset for user: ${verificationToken.user_id}`);
  }
  
  /**
   * Setup two-factor authentication
   */
  static async setupTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const secret = speakeasy.generateSecret({
      name: `YourApp (${user.email})`,
      issuer: 'YourApp',
    });
    
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    
    return {
      secret: secret.base32!,
      qrCode,
    };
  }
  
  /**
   * Enable two-factor authentication
   */
  static async enableTwoFactor(userId: string, secret: string, token: string): Promise<void> {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });
    
    if (!isValid) {
      throw new Error('Invalid two-factor authentication code');
    }
    
    await User.enableTwoFactor(userId, secret);
    
    logger.info(`Two-factor authentication enabled for user: ${userId}`);
  }
  
  /**
   * Disable two-factor authentication
   */
  static async disableTwoFactor(userId: string, password: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const isPasswordValid = await User.verifyPassword(user, password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    
    await User.disableTwoFactor(userId);
    
    logger.info(`Two-factor authentication disabled for user: ${userId}`);
  }
  
  /**
   * Generate JWT tokens
   */
  private static async generateTokens(
    user: IUser,
    rememberMe: boolean,
    existingSessionId?: string
  ): Promise<IAuthTokens> {
    const sessionId = existingSessionId || uuidv4();
    
    const payload: Omit<IJWTPayload, 'type'> = {
      userId: user.id,
      email: user.email,
      sessionId,
    };
    
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
    
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: rememberMe ? '30d' : config.jwt.refreshExpiresIn }
    );
    
    return {
      accessToken,
      refreshToken,
      sessionId,
    };
  }
  
  /**
   * Create session
   */
  private static async createSession(
    userId: string,
    sessionId: string,
    rememberMe: boolean
  ): Promise<void> {
    const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
    
    const sessionData = {
      userId,
      rememberMe,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
    
    await SessionManager.setSession(sessionId, sessionData, expiresIn);
    await SessionManager.addUserSession(userId, sessionId);
    
    // Enforce max sessions
    await SessionManager.enforceMaxSessions(userId, config.security.maxSessions);
  }
  
  /**
   * Update session activity
   */
  private static async updateSession(sessionId: string, rememberMe: boolean): Promise<void> {
    const session = await SessionManager.getSession(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
      const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
      await SessionManager.setSession(sessionId, session, expiresIn);
    }
  }
  
  /**
   * Validate password strength
   */
  private static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }
}