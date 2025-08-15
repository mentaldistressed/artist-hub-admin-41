import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../utils/logger';

/**
 * Email service for sending various types of emails
 */
export class EmailService {
  private static transporter = nodemailer.createTransporter({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
  
  /**
   * Send email verification
   */
  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.urls.frontend}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering! Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
  
  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.urls.frontend}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
  
  /**
   * Send login notification email
   */
  static async sendLoginNotification(
    email: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'New Login to Your Account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2>New Login Detected</h2>
          <p>We detected a new login to your account:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${ipAddress}</p>
            <p><strong>Device:</strong> ${userAgent}</p>
          </div>
          <p>If this was you, you can ignore this email.</p>
          <p>If this wasn't you, please secure your account immediately by changing your password.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated security notification.
          </p>
        </div>
      `,
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Login notification sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send login notification:', error);
      // Don't throw error for notifications
    }
  }
}