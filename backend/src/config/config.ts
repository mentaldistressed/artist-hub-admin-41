import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration
 * All environment variables are centralized here
 */
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.DB_NAME || 'user_management',
  },
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  
  // JWT configuration
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
  },
  
  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes
    maxSessions: parseInt(process.env.MAX_SESSIONS || '5'),
  },
  
  // Application URLs
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    backend: process.env.BACKEND_URL || 'http://localhost:3001',
  },
};

/**
 * Validate required environment variables
 */
export const validateConfig = (): void => {
  const required = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};