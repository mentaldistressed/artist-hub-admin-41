import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Verification token types
 */
export enum TokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

/**
 * Verification token interface
 */
export interface IVerificationToken {
  id: string;
  user_id: string;
  token: string;
  type: TokenType;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

/**
 * Verification token model
 */
export class VerificationToken {
  /**
   * Create a new verification token
   */
  static async create(
    userId: string,
    type: TokenType,
    expiresInMinutes: number = 60
  ): Promise<IVerificationToken> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    // Invalidate existing tokens of the same type for this user
    await this.invalidateUserTokens(userId, type);
    
    const [verificationToken] = await db('verification_tokens')
      .insert({
        user_id: userId,
        token,
        type,
        expires_at: expiresAt,
        used: false,
      })
      .returning('*');
    
    return verificationToken;
  }
  
  /**
   * Find token by token string
   */
  static async findByToken(token: string): Promise<IVerificationToken | null> {
    const verificationToken = await db('verification_tokens')
      .where('token', token)
      .where('used', false)
      .where('expires_at', '>', new Date())
      .first();
    
    return verificationToken || null;
  }
  
  /**
   * Mark token as used
   */
  static async markAsUsed(id: string): Promise<void> {
    await db('verification_tokens')
      .where('id', id)
      .update({ used: true });
  }
  
  /**
   * Invalidate all tokens of a specific type for a user
   */
  static async invalidateUserTokens(userId: string, type: TokenType): Promise<void> {
    await db('verification_tokens')
      .where('user_id', userId)
      .where('type', type)
      .update({ used: true });
  }
  
  /**
   * Clean up expired tokens
   */
  static async cleanupExpired(): Promise<void> {
    await db('verification_tokens')
      .where('expires_at', '<', new Date())
      .del();
  }
  
  /**
   * Validate token
   */
  static async validateToken(token: string, type: TokenType): Promise<IVerificationToken | null> {
    const verificationToken = await db('verification_tokens')
      .where('token', token)
      .where('type', type)
      .where('used', false)
      .where('expires_at', '>', new Date())
      .first();
    
    return verificationToken || null;
  }
}