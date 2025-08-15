import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { authenticate, requireEmailVerification, authRateLimit } from '../middleware/auth';

const router = Router();

/**
 * Validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('two_factor_code')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Two-factor code must be 6 digits'),
];

const passwordResetRequestValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

const passwordResetValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

/**
 * Authentication routes
 */

// Public routes
router.post('/register', 
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  registerValidation,
  AuthController.register
);

router.post('/login',
  authRateLimit(10, 15 * 60 * 1000), // 10 attempts per 15 minutes
  loginValidation,
  AuthController.login
);

router.post('/refresh-token', AuthController.refreshToken);

router.post('/verify-email', AuthController.verifyEmail);

router.post('/request-password-reset',
  authRateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  passwordResetRequestValidation,
  AuthController.requestPasswordReset
);

router.post('/reset-password',
  authRateLimit(5, 60 * 60 * 1000), // 5 attempts per hour
  passwordResetValidation,
  AuthController.resetPassword
);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);

router.post('/logout-all', authenticate, AuthController.logoutAll);

router.get('/profile', authenticate, AuthController.getProfile);

// Two-factor authentication routes
router.post('/setup-2fa', authenticate, requireEmailVerification, AuthController.setupTwoFactor);

router.post('/enable-2fa', authenticate, requireEmailVerification, AuthController.enableTwoFactor);

router.post('/disable-2fa', authenticate, requireEmailVerification, AuthController.disableTwoFactor);

export default router;