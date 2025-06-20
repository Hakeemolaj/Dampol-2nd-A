const request = require('supertest');
const express = require('express');
const documentRoutes = require('../src/routes/documents');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/documents', documentRoutes);

describe('Performance Tests', () => {
  describe('Response Time Tests', () => {
    it('should respond to document types request within 200ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/documents/types')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle document request creation within 500ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send(testUtils.createValidDocumentRequest())
        .expect(201);

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(500);
      expect(response.body.success).toBe(true);
    });

    it('should retrieve document requests within 300ms', async () => {
      // Create a test request first
      await request(app)
        .post('/api/v1/documents/requests')
        .send(testUtils.createValidDocumentRequest());

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/documents/requests')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(300);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle 10 concurrent document requests', async () => {
      const concurrentRequests = 10;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const requestData = testUtils.createValidDocumentRequest({
          email: `test${i}@example.com`,
          contactNumber: `+63 912 345 ${6789 + i}`
        });

        requests.push(
          request(app)
            .post('/api/v1/documents/requests')
            .send(requestData)
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Should complete within reasonable time (5 seconds for 10 requests)
      expect(totalTime).toBeLessThan(5000);
      
      console.log(`✅ Handled ${concurrentRequests} concurrent requests in ${totalTime}ms`);
    });

    it('should handle 50 concurrent read requests', async () => {
      // Create some test data first
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/documents/requests')
          .send(testUtils.createValidDocumentRequest({
            email: `setup${i}@example.com`
          }));
      }

      const concurrentRequests = 50;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          request(app)
            .get('/api/v1/documents/requests')
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Should complete within reasonable time (3 seconds for 50 read requests)
      expect(totalTime).toBeLessThan(3000);
      
      console.log(`✅ Handled ${concurrentRequests} concurrent read requests in ${totalTime}ms`);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not have memory leaks with repeated requests', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/v1/documents/types');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      console.log(`📊 Memory increase after 100 requests: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    });

    it('should handle large payloads efficiently', async () => {
      const largeData = testUtils.createValidDocumentRequest({
        address: 'A'.repeat(10000), // 10KB address
        purpose: 'B'.repeat(5000)   // 5KB purpose
      });

      const startTime = Date.now();
      const initialMemory = process.memoryUsage();

      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send(largeData);

      const responseTime = Date.now() - startTime;
      const finalMemory = process.memoryUsage();
      const memoryUsed = finalMemory.heapUsed - initialMemory.heapUsed;

      // Should handle large payload within reasonable time and memory
      expect(responseTime).toBeLessThan(1000);
      expect(memoryUsed).toBeLessThan(20 * 1024 * 1024); // Less than 20MB
      expect([200, 201, 413]).toContain(response.status); // Success or payload too large
    });
  });

  describe('Database Performance Simulation', () => {
    it('should handle pagination efficiently', async () => {
      // Create test data
      const testDataCount = 50;
      for (let i = 0; i < testDataCount; i++) {
        await request(app)
          .post('/api/v1/documents/requests')
          .send(testUtils.createValidDocumentRequest({
            email: `perf${i}@example.com`
          }));
      }

      // Test different page sizes
      const pageSizes = [5, 10, 20, 50];
      
      for (const pageSize of pageSizes) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get(`/api/v1/documents/requests?page=1&limit=${pageSize}`)
          .expect(200);

        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(300);
        expect(response.body.data.length).toBeLessThanOrEqual(pageSize);
        
        console.log(`📄 Page size ${pageSize}: ${responseTime}ms`);
      }
    });

    it('should handle filtering efficiently', async () => {
      // Create test data with different statuses
      const statuses = ['Pending', 'Processing', 'Ready'];
      
      for (let i = 0; i < 30; i++) {
        const status = statuses[i % statuses.length];
        const response = await request(app)
          .post('/api/v1/documents/requests')
          .send(testUtils.createValidDocumentRequest({
            email: `filter${i}@example.com`
          }));

        if (response.status === 201) {
          // Update status for testing
          await request(app)
            .put(`/api/v1/documents/admin/requests/${response.body.data.id}/status`)
            .send({ status });
        }
      }

      // Test filtering performance
      for (const status of statuses) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get(`/api/v1/documents/admin/requests?status=${status}`)
          .expect(200);

        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(400);
        
        console.log(`🔍 Filter by ${status}: ${responseTime}ms`);
      }
    });
  });

  describe('API Rate Limiting Performance', () => {
    it('should maintain performance under rate limiting', async () => {
      const requestCount = 20;
      const requests = [];
      
      // Send requests in quick succession
      for (let i = 0; i < requestCount; i++) {
        requests.push(
          request(app)
            .get('/api/v1/documents/types')
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // Count successful responses
      const successfulResponses = responses.filter(r => r.status === 200).length;
      const rateLimitedResponses = responses.filter(r => r.status === 429).length;

      console.log(`📊 ${successfulResponses} successful, ${rateLimitedResponses} rate limited in ${totalTime}ms`);

      // Should handle requests efficiently even with rate limiting
      expect(totalTime).toBeLessThan(2000);
      expect(successfulResponses + rateLimitedResponses).toBe(requestCount);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle validation errors quickly', async () => {
      const invalidData = {
        type: 'invalid-type',
        firstName: '',
        lastName: '',
        // Missing required fields
      };

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/v1/documents/requests')
        .send(invalidData);

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(100);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle 404 errors efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/documents/requests/non-existent-id')
        .expect(404);

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(50);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Stress Testing', () => {
    it('should survive stress test with mixed operations', async () => {
      const operations = [];
      const operationCount = 100;

      // Mix of different operations
      for (let i = 0; i < operationCount; i++) {
        if (i % 4 === 0) {
          // Create request
          operations.push(
            request(app)
              .post('/api/v1/documents/requests')
              .send(testUtils.createValidDocumentRequest({
                email: `stress${i}@example.com`
              }))
          );
        } else if (i % 4 === 1) {
          // Get types
          operations.push(
            request(app)
              .get('/api/v1/documents/types')
          );
        } else if (i % 4 === 2) {
          // Get requests
          operations.push(
            request(app)
              .get('/api/v1/documents/requests')
          );
        } else {
          // Get admin requests
          operations.push(
            request(app)
              .get('/api/v1/documents/admin/requests')
          );
        }
      }

      const startTime = Date.now();
      const responses = await Promise.allSettled(operations);
      const totalTime = Date.now() - startTime;

      const successful = responses.filter(r => r.status === 'fulfilled').length;
      const failed = responses.filter(r => r.status === 'rejected').length;

      console.log(`🔥 Stress test: ${successful} successful, ${failed} failed in ${totalTime}ms`);

      // Should handle most operations successfully
      expect(successful).toBeGreaterThan(operationCount * 0.8); // At least 80% success
      expect(totalTime).toBeLessThan(10000); // Complete within 10 seconds
    });
  });
});
