// Security tests for the Barangay Web Application
import request from 'supertest';
import express from 'express';
import { SecurityUtils, SECURITY_PATTERNS } from '@/config/security';
import { 
  sanitizeInput, 
  preventXSS, 
  preventSQLInjection, 
  fileUploadSecurity,
  securityMiddleware 
} from '@/middleware/security';

// Create test app
const app = express();
app.use(express.json());
app.use(securityMiddleware);
app.use(sanitizeInput);
app.use(preventXSS);
app.use(preventSQLInjection);

// Test routes
app.post('/test-input', (req, res) => {
  res.json({ received: req.body });
});

app.get('/test-query', (req, res) => {
  res.json({ received: req.query });
});

app.post('/test-file', fileUploadSecurity, (req, res) => {
  res.json({ success: true });
});

describe('Security Tests', () => {
  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts in request body', async () => {
      const maliciousInput = {
        name: '<script>alert("xss")</script>John',
        message: 'Hello <iframe src="javascript:alert(1)"></iframe>',
      };

      const response = await request(app)
        .post('/test-input')
        .send(maliciousInput);

      expect(response.status).toBe(200);
      expect(response.body.received.name).not.toContain('<script>');
      expect(response.body.received.message).not.toContain('<iframe>');
    });

    it('should sanitize SQL injection attempts', async () => {
      const maliciousInput = {
        email: "admin@test.com'; DROP TABLE users; --",
        search: "1' OR '1'='1",
      };

      const response = await request(app)
        .post('/test-input')
        .send(maliciousInput);

      expect(response.status).toBe(400); // Should be blocked
    });

    it('should handle nested object sanitization', async () => {
      const nestedInput = {
        user: {
          profile: {
            bio: '<script>alert("nested xss")</script>Safe content',
          },
        },
        tags: ['<script>tag1</script>', 'safe-tag'],
      };

      const response = await request(app)
        .post('/test-input')
        .send(nestedInput);

      expect(response.status).toBe(200);
      expect(response.body.received.user.profile.bio).not.toContain('<script>');
      expect(response.body.received.tags[0]).not.toContain('<script>');
    });
  });

  describe('XSS Prevention', () => {
    it('should block script tags', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)"></iframe>',
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/test-input')
          .send({ content: payload });

        expect(response.status).toBe(400);
      }
    });

    it('should allow safe HTML-like content', async () => {
      const safeContent = {
        content: 'This is safe content with <brackets> but no scripts',
        email: 'user@example.com',
      };

      const response = await request(app)
        .post('/test-input')
        .send(safeContent);

      expect(response.status).toBe(200);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should block SQL injection patterns', async () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM users",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      ];

      for (const payload of sqlPayloads) {
        const response = await request(app)
          .post('/test-input')
          .send({ query: payload });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types', () => {
      const validFiles = ['document.pdf', 'image.jpg', 'photo.png'];
      const invalidFiles = ['script.exe', 'malware.bat', 'virus.scr'];

      validFiles.forEach(filename => {
        const sanitized = SecurityUtils.sanitizeFilename(filename);
        expect(sanitized).toBe(filename);
      });

      invalidFiles.forEach(filename => {
        const sanitized = SecurityUtils.sanitizeFilename(filename);
        expect(sanitized).not.toContain('.exe');
        expect(sanitized).not.toContain('.bat');
        expect(sanitized).not.toContain('.scr');
      });
    });

    it('should sanitize filenames', () => {
      const dangerousFilenames = [
        '../../../etc/passwd',
        'file with spaces.pdf',
        'file@#$%^&*().doc',
        'very_long_filename_that_exceeds_normal_limits_and_should_be_truncated.pdf',
      ];

      dangerousFilenames.forEach(filename => {
        const sanitized = SecurityUtils.sanitizeFilename(filename);
        expect(sanitized).not.toContain('../');
        expect(sanitized).not.toContain('@#$%^&*()');
        expect(sanitized.length).toBeLessThanOrEqual(255);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to endpoints', async () => {
      // Make multiple rapid requests
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/test-input')
          .send({ test: 'data' })
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/test-query');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should remove server information', async () => {
      const response = await request(app)
        .get('/test-query');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Input Validation', () => {
    it('should validate email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user space@domain.com',
      ];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should validate phone numbers', () => {
      const validPhones = [
        '+639123456789',
        '09123456789',
        '9123456789',
      ];

      const invalidPhones = [
        '123456789',
        '+1234567890',
        'not-a-phone',
        '091234567890', // too long
      ];

      const phonePattern = /^(\+63|0)?9\d{9}$/;

      validPhones.forEach(phone => {
        expect(phone).toMatch(phonePattern);
      });

      invalidPhones.forEach(phone => {
        expect(phone).not.toMatch(phonePattern);
      });
    });

    it('should validate password strength', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MySecure@Password1',
        'Complex#Pass2024',
      ];

      const weakPasswords = [
        'password',
        '12345678',
        'Password', // no special char
        'password123', // no uppercase
        'PASSWORD123!', // no lowercase
      ];

      strongPasswords.forEach(password => {
        expect(SecurityUtils.isPasswordStrong(password)).toBe(true);
      });

      weakPasswords.forEach(password => {
        expect(SecurityUtils.isPasswordStrong(password)).toBe(false);
      });
    });
  });

  describe('Security Utilities', () => {
    it('should detect suspicious patterns', () => {
      const suspiciousInputs = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE users; --",
        '../../../etc/passwd',
        'cmd.exe',
      ];

      suspiciousInputs.forEach(input => {
        const hasXSS = SecurityUtils.containsSuspiciousPattern(input, SECURITY_PATTERNS.XSS);
        const hasSQL = SecurityUtils.containsSuspiciousPattern(input, SECURITY_PATTERNS.SQL_INJECTION);
        const hasTraversal = SecurityUtils.containsSuspiciousPattern(input, SECURITY_PATTERNS.DIRECTORY_TRAVERSAL);
        const hasCommand = SecurityUtils.containsSuspiciousPattern(input, SECURITY_PATTERNS.COMMAND_INJECTION);

        expect(hasXSS || hasSQL || hasTraversal || hasCommand).toBe(true);
      });
    });

    it('should mask sensitive data', () => {
      const sensitiveData = {
        username: 'john_doe',
        password: 'secret123',
        token: 'abc123xyz',
        email: 'john@example.com',
        authorization: 'Bearer token123',
      };

      const masked = SecurityUtils.maskSensitiveData(sensitiveData);

      expect(masked.username).toBe('john_doe');
      expect(masked.email).toBe('john@example.com');
      expect(masked.password).toBe('***MASKED***');
      expect(masked.token).toBe('***MASKED***');
      expect(masked.authorization).toBe('***MASKED***');
    });

    it('should extract client IP correctly', () => {
      const mockReq = {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
        connection: { remoteAddress: '127.0.0.1' },
        ip: '192.168.1.100',
      } as any;

      const ip = SecurityUtils.getClientIP(mockReq);
      expect(ip).toBe('192.168.1.1');
    });
  });

  describe('CORS Security', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/test-input')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(200);
    });

    it('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .post('/test-input')
        .set('Origin', 'http://malicious-site.com')
        .send({ test: 'data' });

      // Should be handled by CORS middleware
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Content Security Policy', () => {
    it('should set CSP headers', async () => {
      const response = await request(app)
        .get('/test-query');

      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });
});
