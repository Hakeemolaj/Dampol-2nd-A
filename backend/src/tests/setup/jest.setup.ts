// Jest setup file for Supabase testing
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock request objects
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),

  // Helper to create mock response objects
  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },

  // Helper to create mock next function
  createMockNext: () => jest.fn(),

  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate test UUIDs
  generateTestUUID: () => `test-${Math.random().toString(36).substr(2, 9)}`,
};

// Extend Jest matchers
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeValidPhoneNumber(received) {
    const phoneRegex = /^\+63\d{10}$/;
    const pass = typeof received === 'string' && phoneRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Philippine phone number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Philippine phone number`,
        pass: false,
      };
    }
  },
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
      toBeValidPhoneNumber(): R;
    }
  }

  var testUtils: {
    createMockRequest: (overrides?: any) => any;
    createMockResponse: () => any;
    createMockNext: () => jest.Mock;
    waitFor: (ms: number) => Promise<void>;
    generateTestUUID: () => string;
  };
}
