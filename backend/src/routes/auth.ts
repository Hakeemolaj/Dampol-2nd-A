import express from 'express';
import { body } from 'express-validator';
import { authRateLimit } from '@/config/rateLimit';
import { validate } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getProfile,
  updateProfile,
} from '@/controllers/authController';

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authRateLimit);

// Registration validation
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^(\+63|0)?9\d{9}$/)
    .withMessage('Please provide a valid Philippine mobile number'),
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Password reset validation
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

// Profile update validation
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^(\+63|0)?9\d{9}$/)
    .withMessage('Please provide a valid Philippine mobile number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
];

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/forgot-password', 
  validate([body('email').isEmail().normalizeEmail()]), 
  forgotPassword
);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);
router.post('/verify-email', 
  validate([body('token').notEmpty()]), 
  verifyEmail
);
router.post('/resend-verification', 
  validate([body('email').isEmail().normalizeEmail()]), 
  resendVerification
);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/change-password', validate(changePasswordValidation), changePassword);
router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileValidation), updateProfile);

export default router;
