import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';
import { EmailService } from '../services/EmailService';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Authentication controller
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }
      
      const { email, password, first_name, last_name } = req.body;
      
      const result = await AuthService.register({
        email,
        password,
        first_name,
        last_name,
      });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            first_name: result.user.first_name,
            last_name: result.user.last_name,
            is_verified: result.user.is_verified,
          },
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }
  
  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }
      
      const { email, password, remember_me, two_factor_code } = req.body;
      
      const result = await AuthService.login(
        email,
        password,
        remember_me || false,
        two_factor_code
      );
      
      // If two-factor authentication is required
      if (result.requiresTwoFactor) {
        res.status(200).json({
          success: true,
          message: 'Two-factor authentication required',
          requires_two_factor: true,
        });
        return;
      }
      
      // Send login notification
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || 'Unknown';
      
      EmailService.sendLoginNotification(
        result.user.email,
        ipAddress,
        userAgent
      ).catch(error => {
        logger.error('Failed to send login notification:', error);
      });
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: {
            access_token: result.tokens.accessToken,
            refresh_token: result.tokens.refreshToken,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }
  
  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        res.status(400).json({
          success: false,
          message: 'Refresh token required',
        });
        return;
      }
      
      const tokens = await AuthService.refreshToken(refresh_token);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
          },
        },
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  }
  
  /**
   * Logout user
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }
      
      await AuthService.logout(req.user.sessionId, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }
  
  /**
   * Logout from all devices
   */
  static async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }
      
      await AuthService.logoutAll(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      logger.error('Logout all error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }
  
  /**
   * Verify email
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Verification token required',
        });
        return;
      }
      
      await AuthService.verifyEmail(token);
      
      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Email verification failed',
      });
    }
  }
  
  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }
      
      const { email } = req.body;
      
      await AuthService.requestPasswordReset(email);
      
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Password reset request error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
      });
    }
  }
  
  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }
      
      const { token, password } = req.body;
      
      await AuthService.resetPassword(token, password);
      
      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Password reset error:', error);
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed',
      });
    }
  }
  
  /**
   * Get current user profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }
      
      const user = await User.getProfile(req.user.id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
      });
    }
  }
  
  /**
   * Setup two-factor authentication
   */
  static async setupTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }
      
      const result = await AuthService.setupTwoFactor(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Two-factor authentication setup initiated',
        data: {
          secret: result.secret,
          qr_code: result.qrCode,
        },
      });
    } catch (error) {
      logger.error('Two-factor setup error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Two-factor authentication setup failed',
      });
    }
  }
  
  /**
   * Enable two-factor authentication
   */
  static async enableTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }
      
      const { secret, token } = req.body;
      
      if (!secret || !token) {
        res.status(400).json({
          success: false,
          message: 'Secret and token are required',
        });
        return;
      }
      
      await AuthService.enableTwoFactor(req.user.id, secret, token);
      
      res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled successfully',
      });
    } catch (error) {
      logger.error('Enable two-factor error:', error);
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to enable two-factor authentication',
      });
    }
  }
  
  /**
   * Disable two-factor authentication
   */
  static async disableTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }
      
      const { password } = req.body;
      
      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password is required',
        });
        return;
      }
      
      await AuthService.disableTwoFactor(req.user.id, password);
      
      res.status(200).json({
        success: true,
        message: 'Two-factor authentication disabled successfully',
      });
    } catch (error) {
      logger.error('Disable two-factor error:', error);
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to disable two-factor authentication',
      });
    }
  }
}