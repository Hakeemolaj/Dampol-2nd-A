import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';

// Security headers middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS header for HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Recursive object sanitization
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// String sanitization
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Remove potentially dangerous characters
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// File upload security middleware
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (req.file || req.files) {
    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
    
    for (const file of files) {
      if (!file) continue;
      
      // Check file size
      const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
      if (file.size > maxSize) {
        return next(new CustomError(`File size exceeds maximum allowed size of ${maxSize} bytes`, 400));
      }
      
      // Check file type
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx').split(',');
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        return next(new CustomError(`File type .${fileExtension} is not allowed`, 400));
      }
      
      // Check MIME type
      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return next(new CustomError(`MIME type ${file.mimetype} is not allowed`, 400));
      }
      
      // Sanitize filename
      file.originalname = sanitizeFilename(file.originalname);
    }
  }
  
  next();
};

// Filename sanitization
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 255); // Limit length
}

// SQL injection prevention middleware
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(;|\||&)/g,
    /('|(\\')|('')|(%27)|(%2527))/gi,
    /(--|\#|\/\*|\*\/)/g
  ];
  
  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj: any): boolean => {
    if (obj === null || obj === undefined) {
      return false;
    }
    
    if (typeof obj === 'string') {
      return checkForSQLInjection(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item));
    }
    
    if (typeof obj === 'object') {
      return Object.values(obj).some(value => checkObject(value));
    }
    
    return false;
  };
  
  // Check request body, query, and params
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return next(new CustomError('Potentially malicious input detected', 400));
  }
  
  next();
};

// XSS prevention middleware
export const preventXSS = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi,
    /<[^>]*style[\\s]*=[\\s]*["\'][^"\']*expression[\\s]*\(/gi
  ];
  
  const checkForXSS = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj: any): boolean => {
    if (obj === null || obj === undefined) {
      return false;
    }
    
    if (typeof obj === 'string') {
      return checkForXSS(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item));
    }
    
    if (typeof obj === 'object') {
      return Object.values(obj).some(value => checkObject(value));
    }
    
    return false;
  };
  
  // Check request body, query, and params
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return next(new CustomError('Potentially malicious script detected', 400));
  }
  
  next();
};

// Request size limiting middleware
export const limitRequestSize = (maxSize: number = 10 * 1024 * 1024) => { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return next(new CustomError(`Request size exceeds maximum allowed size of ${maxSize} bytes`, 413));
    }
    
    next();
  };
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return next(new CustomError('Access denied from this IP address', 403));
    }
    
    next();
  };
};

// Request logging for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
  };
  
  // Log suspicious activity
  const suspiciousPatterns = [
    /\.\./g, // Directory traversal
    /\/etc\/passwd/gi,
    /\/proc\/self\/environ/gi,
    /cmd\.exe/gi,
    /powershell/gi,
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || 
    pattern.test(JSON.stringify(req.body)) ||
    pattern.test(JSON.stringify(req.query))
  );
  
  if (isSuspicious) {
    console.warn('SECURITY WARNING: Suspicious request detected', logData);
  }
  
  // Log to audit trail in production
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_AUDIT_LOGS === 'true') {
    // Here you would typically log to a security monitoring service
    console.log('SECURITY AUDIT:', logData);
  }
  
  next();
};
