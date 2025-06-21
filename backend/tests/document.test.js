const request = require('supertest');
const express = require('express');
const documentRoutes = require('../src/routes/documents').default;

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/documents', documentRoutes);

describe('Document API Tests', () => {
  describe('GET /api/v1/documents/types', () => {
    it('should return document types', async () => {
      const response = await request(app)
        .get('/api/v1/documents/types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check document type structure
      const documentType = response.body.data[0];
      expect(documentType).toHaveProperty('id');
      expect(documentType).toHaveProperty('name');
      expect(documentType).toHaveProperty('fee');
      expect(documentType).toHaveProperty('processing_time_days');
    });
  });

  describe('POST /api/v1/documents/requests', () => {
    const validRequestData = {
      type: 'barangay-clearance',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      middleName: 'Santos',
      dateOfBirth: '1990-01-01',
      civilStatus: 'Single',
      address: '123 Main Street, Dampol 2nd A, Pulilan, Bulacan',
      contactNumber: '+63 912 345 6789',
      email: 'juan@email.com',
      purpose: 'Employment'
    };

    it('should create a document request with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send(validRequestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Document request submitted successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('request_number');
      expect(response.body.data).toHaveProperty('trackingNumber');
      expect(response.body.data.status).toBe('Pending');
    });

    it('should reject request with missing required fields', async () => {
      const invalidData = { ...validRequestData };
      delete invalidData.firstName;

      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should reject request with invalid document type', async () => {
      const invalidData = { ...validRequestData, type: 'invalid-type' };

      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Document type not found');
    });

    it('should reject request with invalid email format', async () => {
      const invalidData = { ...validRequestData, email: 'invalid-email' };

      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/v1/documents/requests', () => {
    beforeEach(async () => {
      // Create a test request first
      await request(app)
        .post('/api/v1/documents/requests')
        .send({
          type: 'barangay-clearance',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
          civilStatus: 'Single',
          address: 'Test Address',
          contactNumber: '+63 912 345 6789',
          purpose: 'Testing'
        });
    });

    it('should return user document requests', async () => {
      const response = await request(app)
        .get('/api/v1/documents/requests')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/documents/requests?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/v1/documents/requests/:id', () => {
    let requestId;

    beforeEach(async () => {
      // Create a test request first
      const createResponse = await request(app)
        .post('/api/v1/documents/requests')
        .send({
          type: 'barangay-clearance',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
          civilStatus: 'Single',
          address: 'Test Address',
          contactNumber: '+63 912 345 6789',
          purpose: 'Testing'
        });
      
      requestId = createResponse.body.data.id;
    });

    it('should return specific document request', async () => {
      const response = await request(app)
        .get(`/api/v1/documents/requests/${requestId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(requestId);
    });

    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .get('/api/v1/documents/requests/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Document request not found');
    });
  });

  describe('Admin Routes', () => {
    describe('GET /api/v1/documents/admin/requests', () => {
      it('should return all document requests for admin', async () => {
        const response = await request(app)
          .get('/api/v1/documents/admin/requests')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination).toBeDefined();
      });

      it('should filter by status', async () => {
        const response = await request(app)
          .get('/api/v1/documents/admin/requests?status=Pending')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('PATCH /api/v1/documents/admin/requests/:id/status', () => {
      let requestId;

      beforeEach(async () => {
        // Create a test request first
        const createResponse = await request(app)
          .post('/api/v1/documents/requests')
          .send({
            type: 'barangay-clearance',
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            civilStatus: 'Single',
            address: 'Test Address',
            contactNumber: '+63 912 345 6789',
            purpose: 'Testing'
          });
        
        requestId = createResponse.body.data.id;
      });

      it('should update document request status', async () => {
        const response = await request(app)
          .patch(`/api/v1/documents/admin/requests/${requestId}/status`)
          .send({
            status: 'Processing',
            notes: 'Started processing the request'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Document request status updated successfully');
        expect(response.body.data.status).toBe('Processing');
      });

      it('should reject invalid status', async () => {
        const response = await request(app)
          .patch(`/api/v1/documents/admin/requests/${requestId}/status`)
          .send({
            status: 'InvalidStatus'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
      });

      it('should return 404 for non-existent request', async () => {
        const response = await request(app)
          .patch('/api/v1/documents/admin/requests/non-existent-id/status')
          .send({
            status: 'Processing'
          })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Document request not found');
      });
    });
  });

  describe('Workflow Integration', () => {
    let requestId;

    beforeEach(async () => {
      // Create a test request first
      const createResponse = await request(app)
        .post('/api/v1/documents/requests')
        .send({
          type: 'barangay-clearance',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
          civilStatus: 'Single',
          address: 'Test Address',
          contactNumber: '+63 912 345 6789',
          purpose: 'Testing'
        });
      
      requestId = createResponse.body.data.id;
    });

    it('should return workflow status', async () => {
      const response = await request(app)
        .get(`/api/v1/documents/requests/${requestId}/workflow`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.workflow).toBeDefined();
      expect(response.body.data.progress).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      // The exact error handling depends on your middleware setup
      expect(response.status).toBe(400);
    });

    it('should handle very large payloads gracefully', async () => {
      const largeData = {
        type: 'barangay-clearance',
        firstName: 'A'.repeat(10000), // Very long name
        lastName: 'Test',
        dateOfBirth: '1990-01-01',
        civilStatus: 'Single',
        address: 'Test Address',
        contactNumber: '+63 912 345 6789',
        purpose: 'Testing'
      };

      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send(largeData);

      // Should either accept it or reject it gracefully
      expect([200, 201, 400, 413]).toContain(response.status);
    });
  });
});
