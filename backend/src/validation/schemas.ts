import { body, param, query } from 'express-validator';

// Common validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+63|0)?9\d{9}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Authentication validation schemas
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .matches(emailPattern)
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(strongPasswordPattern)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name must be between 2 and 50 characters and contain only letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name must be between 2 and 50 characters and contain only letters, spaces, hyphens, and apostrophes'),
  
  body('middleName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .matches(/^[a-zA-Z\s'-]*$/)
    .withMessage('Middle name must be less than 50 characters and contain only letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .optional()
    .matches(phonePattern)
    .withMessage('Please provide a valid Philippine phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must be less than 255 characters'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(strongPasswordPattern)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .isLength({ min: 32, max: 256 })
    .withMessage('Invalid reset token'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(strongPasswordPattern)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

// Announcement validation schemas
export const createAnnouncementValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Summary must be less than 500 characters'),
  
  body('category')
    .isIn(['General', 'Health', 'Education', 'Infrastructure', 'Safety', 'Events', 'Emergency'])
    .withMessage('Invalid category'),
  
  body('priority')
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),
  
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
];

export const updateAnnouncementValidation = [
  param('id')
    .matches(uuidPattern)
    .withMessage('Invalid announcement ID'),
  
  ...createAnnouncementValidation.map(validation => validation.optional()),
];

// Document request validation schemas
export const createDocumentRequestValidation = [
  body('documentTypeId')
    .matches(uuidPattern)
    .withMessage('Invalid document type ID'),
  
  body('purpose')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Purpose must be between 5 and 500 characters'),
  
  body('urgency')
    .optional()
    .isIn(['normal', 'urgent'])
    .withMessage('Invalid urgency level'),
  
  body('deliveryMethod')
    .optional()
    .isIn(['pickup', 'delivery', 'email'])
    .withMessage('Invalid delivery method'),
  
  body('deliveryAddress')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Delivery address must be less than 255 characters'),
];

export const updateDocumentRequestValidation = [
  param('id')
    .matches(uuidPattern)
    .withMessage('Invalid document request ID'),
  
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  
  body('processedBy')
    .optional()
    .matches(uuidPattern)
    .withMessage('Invalid processor ID'),
];

// Stream validation schemas
export const createStreamValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('category')
    .isIn(['meeting', 'event', 'announcement', 'emergency', 'education', 'health'])
    .withMessage('Invalid stream category'),
  
  body('scheduledAt')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    }),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('recordingEnabled')
    .optional()
    .isBoolean()
    .withMessage('recordingEnabled must be a boolean'),
];

export const updateStreamValidation = [
  param('id')
    .matches(uuidPattern)
    .withMessage('Invalid stream ID'),
  
  ...createStreamValidation.map(validation => validation.optional()),
  
  body('status')
    .optional()
    .isIn(['scheduled', 'live', 'ended', 'cancelled'])
    .withMessage('Invalid stream status'),
];

// Common parameter validations
export const uuidParamValidation = [
  param('id')
    .matches(uuidPattern)
    .withMessage('Invalid ID format'),
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer between 1 and 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isAlpha()
    .withMessage('Sort field must contain only letters'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];

// Search validation
export const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isAlpha()
    .withMessage('Category must contain only letters'),
  
  query('status')
    .optional()
    .isAlpha()
    .withMessage('Status must contain only letters'),
];

// Date range validation
export const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

// File upload validation
export const fileUploadValidation = [
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('category')
    .optional()
    .isIn(['document', 'image', 'video', 'audio', 'other'])
    .withMessage('Invalid file category'),
];

// Contact form validation
export const contactFormValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name must be between 2 and 100 characters and contain only letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .matches(phonePattern)
    .withMessage('Please provide a valid Philippine phone number'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  body('category')
    .isIn(['inquiry', 'complaint', 'request', 'feedback', 'emergency'])
    .withMessage('Invalid category'),
];
