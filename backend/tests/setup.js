// Test setup and configuration
const { beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.API_VERSION = 'v1';
process.env.UPLOAD_DIR = './test-uploads';
process.env.MAX_FILE_SIZE = '5242880'; // 5MB

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting test suite...');
  
  // Create test upload directory
  const fs = require('fs');
  const path = require('path');
  
  const uploadDir = path.join(__dirname, '../test-uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.mkdirSync(path.join(uploadDir, 'documents'), { recursive: true });
    fs.mkdirSync(path.join(uploadDir, 'temp'), { recursive: true });
  }
});

afterAll(async () => {
  console.log('🧹 Cleaning up test suite...');
  
  // Clean up test upload directory
  const fs = require('fs');
  const path = require('path');
  
  const uploadDir = path.join(__dirname, '../test-uploads');
  if (fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  }
});

beforeEach(() => {
  // Reset any global state before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  // Create a valid document request payload
  createValidDocumentRequest: (overrides = {}) => ({
    type: 'barangay-clearance',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    middleName: 'Santos',
    dateOfBirth: '1990-01-01',
    civilStatus: 'Single',
    address: '123 Main Street, Dampol 2nd A, Pulilan, Bulacan',
    contactNumber: '+63 912 345 6789',
    email: 'juan@email.com',
    purpose: 'Employment',
    ...overrides
  }),

  // Create a test file
  createTestFile: (name = 'test.pdf', content = 'test content', type = 'application/pdf') => {
    if (typeof File !== 'undefined') {
      return new File([content], name, { type });
    }
    // For Node.js environment
    return {
      name,
      content,
      type,
      size: content.length
    };
  },

  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random test data
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  randomEmail: () => {
    return `test${Math.random().toString(36).substr(2, 9)}@example.com`;
  },

  randomPhoneNumber: () => {
    return `+63 9${Math.floor(Math.random() * 900000000 + 100000000)}`;
  }
};

// Mock console methods for cleaner test output
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Restore console for specific tests that need it
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Custom matchers
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

  toBeValidRequestNumber(received) {
    const requestNumberRegex = /^BR\d{6}\d{4}$/;
    const pass = typeof received === 'string' && requestNumberRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid request number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid request number`,
        pass: false,
      };
    }
  },

  toBeValidTrackingNumber(received) {
    const trackingNumberRegex = /^TRK-\d{3}-\d{4}$/;
    const pass = typeof received === 'string' && trackingNumberRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid tracking number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid tracking number`,
        pass: false,
      };
    }
  },

  toBeValidPhilippinePhoneNumber(received) {
    const phoneRegex = /^\+63\s?9\d{9}$/;
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
  }
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = {
  testUtils: global.testUtils,
  restoreConsole: global.restoreConsole
};
