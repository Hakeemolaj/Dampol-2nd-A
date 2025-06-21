// Test utilities for barangay backend tests

const testUtils = {
  createValidDocumentRequest: (overrides = {}) => {
    return {
      type: 'barangay-clearance',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      middleName: 'Santos',
      dateOfBirth: '1990-01-01',
      civilStatus: 'Single',
      address: '123 Main Street, Dampol 2nd A, Pulilan, Bulacan',
      contactNumber: '+63 912 345 6789',
      email: 'juan@example.com',
      purpose: 'Employment',
      ...overrides
    };
  },

  createValidUser: (overrides = {}) => {
    return {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
      contactNumber: '+63 912 345 6789',
      address: 'Test Address, Dampol 2nd A, Pulilan, Bulacan',
      ...overrides
    };
  },

  createValidAdmin: (overrides = {}) => {
    return {
      email: 'admin@dampol2nda.gov.ph',
      password: 'AdminPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      position: 'Barangay Secretary',
      ...overrides
    };
  },

  generateRandomEmail: () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test${timestamp}${random}@example.com`;
  },

  generateRandomPhone: () => {
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `+63 912 345 ${random}`;
  },

  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Mock file for testing file uploads
  createMockFile: (filename = 'test.pdf', mimetype = 'application/pdf', size = 1024) => {
    return {
      fieldname: 'documents',
      originalname: filename,
      encoding: '7bit',
      mimetype: mimetype,
      size: size,
      buffer: Buffer.alloc(size, 'test data'),
      destination: '/tmp',
      filename: `${Date.now()}-${filename}`,
      path: `/tmp/${Date.now()}-${filename}`
    };
  },

  // Validation helpers
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhoneNumber: (phone) => {
    const phoneRegex = /^\+63\s\d{3}\s\d{3}\s\d{4}$/;
    return phoneRegex.test(phone);
  },

  // Date helpers
  isValidISODate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString === date.toISOString();
  },

  isRecentDate: (dateString, maxAgeMinutes = 5) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = (now - date) / (1000 * 60);
    return diffMinutes <= maxAgeMinutes;
  },

  // Response validation helpers
  validateSuccessResponse: (response, expectedStatus = 200) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('data');
  },

  validateErrorResponse: (response, expectedStatus = 400) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
  },

  validatePaginationResponse: (response) => {
    testUtils.validateSuccessResponse(response);
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('totalPages');
  },

  // Document request validation
  validateDocumentRequest: (documentRequest) => {
    expect(documentRequest).toHaveProperty('id');
    expect(documentRequest).toHaveProperty('request_number');
    expect(documentRequest).toHaveProperty('document_type_id');
    expect(documentRequest).toHaveProperty('status');
    expect(documentRequest).toHaveProperty('created_at');
    expect(documentRequest).toHaveProperty('updated_at');
    expect(documentRequest).toHaveProperty('fee_amount');
    expect(typeof documentRequest.fee_amount).toBe('number');
    expect(testUtils.isValidUUID(documentRequest.id)).toBe(true);
    expect(testUtils.isValidISODate(documentRequest.created_at)).toBe(true);
    expect(testUtils.isValidISODate(documentRequest.updated_at)).toBe(true);
  },

  // Document type validation
  validateDocumentType: (documentType) => {
    expect(documentType).toHaveProperty('id');
    expect(documentType).toHaveProperty('name');
    expect(documentType).toHaveProperty('description');
    expect(documentType).toHaveProperty('fee');
    expect(documentType).toHaveProperty('processing_time_days');
    expect(documentType).toHaveProperty('requirements');
    expect(documentType).toHaveProperty('is_active');
    expect(typeof documentType.fee).toBe('number');
    expect(typeof documentType.processing_time_days).toBe('number');
    expect(Array.isArray(documentType.requirements)).toBe(true);
    expect(typeof documentType.is_active).toBe('boolean');
  },

  // Performance measurement
  measureResponseTime: async (requestFunction) => {
    const startTime = Date.now();
    const response = await requestFunction();
    const responseTime = Date.now() - startTime;
    return { response, responseTime };
  },

  // Memory measurement
  measureMemoryUsage: (beforeCallback, afterCallback) => {
    const initialMemory = process.memoryUsage();
    beforeCallback();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage();
    afterCallback();
    
    return {
      heapUsedDiff: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotalDiff: finalMemory.heapTotal - initialMemory.heapTotal,
      externalDiff: finalMemory.external - initialMemory.external,
      rssUsedDiff: finalMemory.rss - initialMemory.rss
    };
  }
};

module.exports = testUtils;
