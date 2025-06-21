import { Request } from 'express';

// Security configuration constants
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_REQUESTS: 5,
    UPLOAD_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    UPLOAD_MAX_REQUESTS: 10,
  },

  // File upload limits
  FILE_UPLOAD: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx').split(','),
    ALLOWED_MIME_TYPES: [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },

  // Request size limits
  REQUEST_SIZE: {
    JSON_LIMIT: '10mb',
    URL_ENCODED_LIMIT: '10mb',
    MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  },

  // Session and token settings
  SESSION: {
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
  },

  // CORS settings
  CORS: {
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    CREDENTIALS: true,
    MAX_AGE: 86400, // 24 hours
  },

  // Content Security Policy
  CSP: {
    DEFAULT_SRC: ["'self'"],
    STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
    IMG_SRC: ["'self'", "data:", "https:"],
    SCRIPT_SRC: ["'self'"],
    CONNECT_SRC: ["'self'", process.env.SUPABASE_URL || ""],
    MEDIA_SRC: ["'self'", "blob:"],
    FRAME_SRC: ["'none'"],
    OBJECT_SRC: ["'none'"],
    BASE_URI: ["'self'"],
    FORM_ACTION: ["'self'"],
  },

  // Input validation
  VALIDATION: {
    MAX_STRING_LENGTH: 5000,
    MAX_ARRAY_LENGTH: 100,
    MAX_OBJECT_DEPTH: 10,
    ALLOWED_HTML_TAGS: [], // No HTML allowed by default
  },

  // Audit logging
  AUDIT: {
    ENABLED: process.env.ENABLE_AUDIT_LOGS === 'true',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key', 'authorization'],
  },

  // IP restrictions
  IP_RESTRICTIONS: {
    ADMIN_WHITELIST: (process.env.ADMIN_IP_WHITELIST || '').split(',').filter(Boolean),
    BLOCKED_IPS: (process.env.BLOCKED_IPS || '').split(',').filter(Boolean),
    MAX_FAILED_ATTEMPTS: parseInt(process.env.MAX_FAILED_ATTEMPTS || '5'),
    LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes
  },
};

// Security patterns for detection
export const SECURITY_PATTERNS = {
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(;|\||&)/g,
    /('|(\\')|('')|(%27)|(%2527))/gi,
    /(--|\#|\/\*|\*\/)/g,
  ],

  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi,
    /<[^>]*style[\\s]*=[\\s]*["\'][^"\']*expression[\\s]*\(/gi,
  ],

  DIRECTORY_TRAVERSAL: [
    /\.\./g,
    /\/etc\/passwd/gi,
    /\/proc\/self\/environ/gi,
    /\\windows\\system32/gi,
  ],

  COMMAND_INJECTION: [
    /cmd\.exe/gi,
    /powershell/gi,
    /bash/gi,
    /sh\s/gi,
    /exec\(/gi,
    /system\(/gi,
  ],

  SUSPICIOUS_USER_AGENTS: [
    /sqlmap/gi,
    /nikto/gi,
    /nessus/gi,
    /burp/gi,
    /nmap/gi,
    /masscan/gi,
  ],
};

// Security utility functions
export const SecurityUtils = {
  // Check if IP is in whitelist
  isIPWhitelisted: (ip: string, whitelist: string[]): boolean => {
    if (whitelist.length === 0) return true;
    return whitelist.includes(ip);
  },

  // Check if IP is blocked
  isIPBlocked: (ip: string, blocklist: string[]): boolean => {
    return blocklist.includes(ip);
  },

  // Sanitize filename
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 255);
  },

  // Check password strength
  isPasswordStrong: (password: string): boolean => {
    const config = SECURITY_CONFIG.PASSWORD;
    
    if (password.length < config.MIN_LENGTH || password.length > config.MAX_LENGTH) {
      return false;
    }

    if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      return false;
    }

    if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      return false;
    }

    if (config.REQUIRE_NUMBERS && !/\d/.test(password)) {
      return false;
    }

    if (config.REQUIRE_SPECIAL_CHARS && !/[@$!%*?&]/.test(password)) {
      return false;
    }

    return true;
  },

  // Extract client IP
  getClientIP: (req: Request): string => {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown'
    );
  },

  // Check for suspicious patterns
  containsSuspiciousPattern: (value: string, patterns: RegExp[]): boolean => {
    return patterns.some(pattern => pattern.test(value));
  },

  // Sanitize object recursively
  sanitizeObject: (obj: any, depth: number = 0): any => {
    if (depth > SECURITY_CONFIG.VALIDATION.MAX_OBJECT_DEPTH) {
      throw new Error('Object depth exceeds maximum allowed');
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return SecurityUtils.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length > SECURITY_CONFIG.VALIDATION.MAX_ARRAY_LENGTH) {
        throw new Error('Array length exceeds maximum allowed');
      }
      return obj.map(item => SecurityUtils.sanitizeObject(item, depth + 1));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = SecurityUtils.sanitizeObject(obj[key], depth + 1);
        }
      }
      return sanitized;
    }

    return obj;
  },

  // Sanitize string
  sanitizeString: (str: string): string => {
    if (typeof str !== 'string') {
      return str;
    }

    if (str.length > SECURITY_CONFIG.VALIDATION.MAX_STRING_LENGTH) {
      throw new Error('String length exceeds maximum allowed');
    }

    // Remove potentially dangerous characters
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  // Mask sensitive data for logging
  maskSensitiveData: (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => SecurityUtils.maskSensitiveData(item));
    }

    if (typeof obj === 'object') {
      const masked: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const lowerKey = key.toLowerCase();
          if (SECURITY_CONFIG.AUDIT.SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
            masked[key] = '***MASKED***';
          } else {
            masked[key] = SecurityUtils.maskSensitiveData(obj[key]);
          }
        }
      }
      return masked;
    }

    return obj;
  },
};

// Export default configuration
export default SECURITY_CONFIG;
