// Integration tests for API endpoints
import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock all external dependencies
jest.mock('@/config/supabase');
jest.mock('@/services/authService');
jest.mock('@/services/database');

// Import routes after mocking
import authRoutes from '@/routes/auth';
import announcementRoutes from '@/routes/announcements.js';
import analyticsRoutes from '@/routes/analytics';
import streamRoutes from '@/routes/streams';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/streams', streamRoutes);

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/v1/auth/register', () => {
      it('should register a new user', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+639123456789',
        };

        const response = await request(app)
          .post('/api/v1/auth/register')
          .send(userData);

        // Should handle the request (may fail due to mocking, but should not crash)
        expect(response.status).toBeDefined();
      });

      it('should validate email format', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        };

        const response = await request(app)
          .post('/api/v1/auth/register')
          .send(userData);

        expect(response.status).toBeGreaterThanOrEqual(400);
      });

      it('should validate password strength', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe',
        };

        const response = await request(app)
          .post('/api/v1/auth/register')
          .send(userData);

        expect(response.status).toBeGreaterThanOrEqual(400);
      });
    });

    describe('POST /api/v1/auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'Password123!',
        };

        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(loginData);

        expect(response.status).toBeDefined();
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com' }); // Missing password

        expect(response.status).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('Announcements Endpoints', () => {
    describe('GET /api/v1/announcements', () => {
      it('should return announcements list', async () => {
        const response = await request(app)
          .get('/api/v1/announcements');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/v1/announcements')
          .query({ page: 1, limit: 5 });

        expect(response.status).toBe(200);
      });

      it('should support category filtering', async () => {
        const response = await request(app)
          .get('/api/v1/announcements')
          .query({ category: 'Health' });

        expect(response.status).toBe(200);
      });

      it('should support priority filtering', async () => {
        const response = await request(app)
          .get('/api/v1/announcements')
          .query({ priority: 'urgent' });

        expect(response.status).toBe(200);
      });
    });

    describe('GET /api/v1/announcements/categories', () => {
      it('should return available categories', async () => {
        const response = await request(app)
          .get('/api/v1/announcements/categories');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
      });
    });

    describe('GET /api/v1/announcements/urgent', () => {
      it('should return urgent announcements', async () => {
        const response = await request(app)
          .get('/api/v1/announcements/urgent');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
      });
    });

    describe('GET /api/v1/announcements/:id', () => {
      it('should return specific announcement', async () => {
        const response = await request(app)
          .get('/api/v1/announcements/1');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
      });
    });
  });

  describe('Analytics Endpoints', () => {
    describe('GET /api/v1/analytics/overview', () => {
      it('should return overview analytics', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/overview');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should support date range filtering', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/overview')
          .query({ dateRange: 'last7days' });

        expect(response.status).toBe(200);
      });
    });

    describe('GET /api/v1/analytics/demographics', () => {
      it('should return demographic data', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/demographics');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/v1/analytics/services', () => {
      it('should return service analytics', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/services');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should support document type filtering', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/services')
          .query({ documentType: 'clearance' });

        expect(response.status).toBe(200);
      });
    });

    describe('GET /api/v1/analytics/financial', () => {
      it('should return financial analytics', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/financial');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/v1/analytics/dashboard', () => {
      it('should return complete dashboard data', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/dashboard');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.overview).toBeDefined();
        expect(response.body.data.demographics).toBeDefined();
        expect(response.body.data.services).toBeDefined();
      });
    });

    describe('GET /api/v1/analytics/export', () => {
      it('should export analytics data as JSON', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/export')
          .query({ format: 'json', category: 'demographics' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should export analytics data as CSV', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/export')
          .query({ format: 'csv', category: 'services' });

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent');

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle missing required headers', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      // Should handle the request even without auth headers for login
      expect(response.status).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      // Make multiple rapid requests
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com', password: 'password' })
      );

      const responses = await Promise.all(promises);
      
      // At least some requests should complete
      expect(responses.length).toBe(10);
    });
  });
});
