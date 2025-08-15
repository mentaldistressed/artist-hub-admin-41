import { db } from '../config/database';
import bcrypt from 'bcryptjs';
import { config } from '../config/config';

/**
 * User interface definition
 */
export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  is_verified: boolean;
  is_active: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  failed_login_attempts: number;
  locked_until?: Date;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * User creation interface
 */
export interface ICreateUser {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/**
 * User model with database operations
 */
export class User {
  /**
   * Create a new user
   */
  static async create(userData: ICreateUser): Promise<IUser> {
    const passwordHash = await bcrypt.hash(userData.password, config.security.bcryptRounds);
    
    const [user] = await db('users')
      .insert({
        email: userData.email.toLowerCase(),
        password_hash: passwordHash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_verified: false,
        is_active: true,
        two_factor_enabled: false,
        failed_login_attempts: 0,
      })
      .returning('*');
    
    return user;
  }
  
  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    const user = await db('users')
      .where('email', email.toLowerCase())
      .first();
    
    return user || null;
  }
  
  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<IUser | null> {
    const user = await db('users')
      .where('id', id)
      .first();
    
    return user || null;
  }
  
  /**
   * Update user
   */
  static async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const [user] = await db('users')
      .where('id', id)
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');
    
    return user || null;
  }
  
  /**
   * Verify password
   */
  static async verifyPassword(user: IUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }
  
  /**
   * Update password
   */
  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    
    await db('users')
      .where('id', id)
      .update({
        password_hash: passwordHash,
        updated_at: new Date(),
      });
  }
  
  /**
   * Check if user is locked
   */
  static isLocked(user: IUser): boolean {
    return user.locked_until ? new Date() < user.locked_until : false;
  }
  
  /**
   * Increment failed login attempts
   */
  static async incrementFailedAttempts(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;
    
    const attempts = user.failed_login_attempts + 1;
    const updates: Partial<IUser> = {
      failed_login_attempts: attempts,
    };
    
    // Lock account if max attempts reached
    if (attempts >= config.security.maxLoginAttempts) {
      updates.locked_until = new Date(Date.now() + config.security.lockoutDuration);
    }
    
    await this.update(id, updates);
  }
  
  /**
   * Reset failed login attempts
   */
  static async resetFailedAttempts(id: string): Promise<void> {
    await this.update(id, {
      failed_login_attempts: 0,
      locked_until: undefined,
      last_login: new Date(),
    });
  }
  
  /**
   * Enable two-factor authentication
   */
  static async enableTwoFactor(id: string, secret: string): Promise<void> {
    await this.update(id, {
      two_factor_enabled: true,
      two_factor_secret: secret,
    });
  }
  
  /**
   * Disable two-factor authentication
   */
  static async disableTwoFactor(id: string): Promise<void> {
    await this.update(id, {
      two_factor_enabled: false,
      two_factor_secret: undefined,
    });
  }
  
  /**
   * Verify email
   */
  static async verifyEmail(id: string): Promise<void> {
    await this.update(id, {
      is_verified: true,
    });
  }
  
  /**
   * Deactivate user
   */
  static async deactivate(id: string): Promise<void> {
    await this.update(id, {
      is_active: false,
    });
  }
  
  /**
   * Get user profile (without sensitive data)
   */
  static async getProfile(id: string): Promise<Omit<IUser, 'password_hash' | 'two_factor_secret'> | null> {
    const user = await db('users')
      .select([
        'id',
        'email',
        'first_name',
        'last_name',
        'is_verified',
        'is_active',
        'two_factor_enabled',
        'last_login',
        'created_at',
        'updated_at',
      ])
      .where('id', id)
      .first();
    
    return user || null;
  }
}