import { createClient } from 'redis';
import { config } from './config';
import { logger } from '../utils/logger';

/**
 * Redis client configuration
 * Used for session storage, rate limiting, and caching
 */
export const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  password: config.redis.password,
});

/**
 * Initialize Redis connection
 */
export const initRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis connection successful');
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};

/**
 * Redis error handling
 */
redisClient.on('error', (error) => {
  logger.error('Redis error:', error);
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

redisClient.on('disconnect', () => {
  logger.warn('Redis disconnected');
});

/**
 * Session management utilities
 */
export class SessionManager {
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  
  /**
   * Store session data
   */
  static async setSession(sessionId: string, data: any, expiresIn: number): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await redisClient.setEx(key, expiresIn, JSON.stringify(data));
  }
  
  /**
   * Get session data
   */
  static async getSession(sessionId: string): Promise<any | null> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  /**
   * Delete session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await redisClient.del(key);
  }
  
  /**
   * Add session to user's active sessions
   */
  static async addUserSession(userId: string, sessionId: string): Promise<void> {
    const key = `${this.USER_SESSIONS_PREFIX}${userId}`;
    await redisClient.sAdd(key, sessionId);
    await redisClient.expire(key, 7 * 24 * 60 * 60); // 7 days
  }
  
  /**
   * Remove session from user's active sessions
   */
  static async removeUserSession(userId: string, sessionId: string): Promise<void> {
    const key = `${this.USER_SESSIONS_PREFIX}${userId}`;
    await redisClient.sRem(key, sessionId);
  }
  
  /**
   * Get all user sessions
   */
  static async getUserSessions(userId: string): Promise<string[]> {
    const key = `${this.USER_SESSIONS_PREFIX}${userId}`;
    return await redisClient.sMembers(key);
  }
  
  /**
   * Terminate all user sessions
   */
  static async terminateAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    
    // Delete all session data
    const pipeline = redisClient.multi();
    sessions.forEach(sessionId => {
      pipeline.del(`${this.SESSION_PREFIX}${sessionId}`);
    });
    
    // Clear user sessions set
    pipeline.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
    
    await pipeline.exec();
  }
  
  /**
   * Enforce maximum sessions per user
   */
  static async enforceMaxSessions(userId: string, maxSessions: number): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    
    if (sessions.length >= maxSessions) {
      // Remove oldest sessions
      const sessionsToRemove = sessions.slice(0, sessions.length - maxSessions + 1);
      
      const pipeline = redisClient.multi();
      sessionsToRemove.forEach(sessionId => {
        pipeline.del(`${this.SESSION_PREFIX}${sessionId}`);
        pipeline.sRem(`${this.USER_SESSIONS_PREFIX}${userId}`, sessionId);
      });
      
      await pipeline.exec();
    }
  }
}