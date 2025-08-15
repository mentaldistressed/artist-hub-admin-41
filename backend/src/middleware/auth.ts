import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models/User';
import { SessionManager } from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Extended Request interface with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    sessionId: string;
  };
}

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
 * Authentication middleware
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT token
    const payload = jwt.verify(token, config.jwt.accessSecret) as IJWTPayload;
    
    if (payload.type !== 'access') {
      res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
      return;
    }
    
    // Check if session exists
    const session = await SessionManager.getSession(payload.sessionId);
    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Session expired',
      });
      return;
    }
    
    // Check if user exists and is active
    const user = await User.findById(payload.userId);
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }
    
    // Update session activity
    session.lastActivity = new Date().toISOString();
    const expiresIn = session.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    await SessionManager.setSession(payload.sessionId, session, expiresIn);
    
    // Add user data to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      sessionId: payload.sessionId,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }
    
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user data to request if token is valid, but doesn't require authentication
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, config.jwt.accessSecret) as IJWTPayload;
    
    if (payload.type === 'access') {
      const session = await SessionManager.getSession(payload.sessionId);
      if (session) {
        const user = await User.findById(payload.userId);
        if (user && user.is_active) {
          req.user = {
            id: payload.userId,
            email: payload.email,
            sessionId: payload.sessionId,
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // Ignore errors in optional authentication
    next();
  }
};

/**
 * Require email verification middleware
 */
export const requireEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }
  
  const user = await User.findById(req.user.id);
  
  if (!user || !user.is_verified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED',
    });
    return;
  }
  
  next();
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const userAttempts = attempts.get(key);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (userAttempts.count >= maxAttempts) {
      res.status(429).json({
        success: false,
        message: 'Too many attempts, please try again later',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000),
      });
      return;
    }
    
    userAttempts.count++;
    next();
  };
};