import express from 'express';
import { body } from 'express-validator';
import { authRateLimit } from '@/config/rateLimit';
import { validate } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import { preventXSS, preventSQLInjection, sanitizeInput } from '@/middleware/security';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '@/validation/schemas';
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

// Apply security middleware to all auth routes
router.use(authRateLimit);
router.use(sanitizeInput);
router.use(preventXSS);
router.use(preventSQLInjection);

// Using imported validation schemas from @/validation/schemas

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
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
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
