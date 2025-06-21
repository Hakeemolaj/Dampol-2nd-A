import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import request from 'supertest';
import WebSocket from 'ws';
import { performance } from 'perf_hooks';

// Mock streaming server for testing
class MockStreamingServer {
  private connections: Set<WebSocket> = new Set();
  private server: any;

  start(port: number = 8080) {
    this.server = new WebSocket.Server({ port });
    
    this.server.on('connection', (ws: WebSocket) => {
      this.connections.add(ws);
      
      ws.on('close', () => {
        this.connections.delete(ws);
      });
      
      ws.on('message', (data) => {
        // Broadcast to all connected clients
        this.broadcast(data);
      });
    });
  }

  broadcast(data: any) {
    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  getConnectionCount() {
    return this.connections.size;
  }

  stop() {
    this.connections.forEach(ws => ws.close());
    this.server?.close();
  }
}

describe('Streaming Performance Tests', () => {
  let mockServer: MockStreamingServer;
  let baseURL: string;

  beforeAll(async () => {
    mockServer = new MockStreamingServer();
    mockServer.start(8080);
    baseURL = process.env.TEST_API_URL || 'http://localhost:3002';
  });

  afterAll(async () => {
    mockServer.stop();
  });

  describe('Stream Creation Performance', () => {
    test('should create stream within acceptable time limit', async () => {
      const startTime = performance.now();
      
      const response = await request(baseURL)
        .post('/api/v1/streams')
        .send({
          title: 'Performance Test Stream',
          description: 'Testing stream creation performance',
          category: 'meeting',
          is_public: true,
          recording_enabled: true
        })
        .expect(201);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
    });

    test('should handle concurrent stream creation', async () => {
      const concurrentRequests = 10;
      const promises = [];

      const startTime = performance.now();

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(baseURL)
            .post('/api/v1/streams')
            .send({
              title: `Concurrent Test Stream ${i}`,
              description: 'Testing concurrent stream creation',
              category: 'meeting',
              is_public: true,
              recording_enabled: true
            })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
      });
    });
  });

  describe('Viewer Connection Performance', () => {
    test('should handle multiple viewer connections', async () => {
      const viewerCount = 100;
      const connections: WebSocket[] = [];

      const startTime = performance.now();

      // Create multiple WebSocket connections
      for (let i = 0; i < viewerCount; i++) {
        const ws = new WebSocket('ws://localhost:8080');
        connections.push(ws);
        
        await new Promise(resolve => {
          ws.on('open', resolve);
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // Should connect within 10 seconds
      expect(mockServer.getConnectionCount()).toBe(viewerCount);

      // Clean up connections
      connections.forEach(ws => ws.close());
    });

    test('should maintain stable connections under load', async () => {
      const viewerCount = 50;
      const connections: WebSocket[] = [];
      const messageCount = 100;

      // Create connections
      for (let i = 0; i < viewerCount; i++) {
        const ws = new WebSocket('ws://localhost:8080');
        connections.push(ws);
        
        await new Promise(resolve => {
          ws.on('open', resolve);
        });
      }

      const startTime = performance.now();

      // Send messages rapidly
      for (let i = 0; i < messageCount; i++) {
        const randomConnection = connections[Math.floor(Math.random() * connections.length)];
        randomConnection.send(JSON.stringify({
          type: 'chat_message',
          message: `Test message ${i}`,
          timestamp: Date.now()
        }));
        
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should handle messages within 5 seconds
      expect(mockServer.getConnectionCount()).toBe(viewerCount);

      // Clean up
      connections.forEach(ws => ws.close());
    });
  });

  describe('API Response Time Performance', () => {
    test('should respond to stream list requests quickly', async () => {
      const iterations = 20;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const response = await request(baseURL)
          .get('/api/v1/streams')
          .expect(200);

        const endTime = performance.now();
        responseTimes.push(endTime - startTime);

        expect(response.body.status).toBe('success');
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);

      expect(averageResponseTime).toBeLessThan(500); // Average under 500ms
      expect(maxResponseTime).toBeLessThan(1000); // Max under 1 second
    });

    test('should handle analytics requests efficiently', async () => {
      const startTime = performance.now();

      const response = await request(baseURL)
        .get('/api/v1/analytics/streams')
        .expect(200);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(response.body.status).toBe('success');
    });
  });

  describe('Memory and Resource Usage', () => {
    test('should not have memory leaks during stream operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform multiple stream operations
      for (let i = 0; i < 50; i++) {
        await request(baseURL)
          .post('/api/v1/streams')
          .send({
            title: `Memory Test Stream ${i}`,
            category: 'meeting',
            is_public: true
          });

        await request(baseURL)
          .get('/api/v1/streams')
          .expect(200);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Database Performance', () => {
    test('should handle database queries efficiently', async () => {
      const queryCount = 100;
      const startTime = performance.now();

      const promises = [];
      for (let i = 0; i < queryCount; i++) {
        promises.push(
          request(baseURL)
            .get('/api/v1/streams')
            .query({ limit: 10 })
        );
      }

      await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle 100 queries within 10 seconds
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Error Handling Performance', () => {
    test('should handle invalid requests quickly', async () => {
      const startTime = performance.now();

      const response = await request(baseURL)
        .post('/api/v1/streams')
        .send({
          // Invalid data
          title: '',
          category: 'invalid_category'
        })
        .expect(400);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should fail fast
      expect(response.body.status).toBe('error');
    });

    test('should handle non-existent stream requests efficiently', async () => {
      const startTime = performance.now();

      const response = await request(baseURL)
        .get('/api/v1/streams/non-existent-id')
        .expect(404);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should fail fast
      expect(response.body.status).toBe('error');
    });
  });
});

// Load testing utilities
export class StreamingLoadTester {
  private baseURL: string;
  private results: any[] = [];

  constructor(baseURL: string = 'http://localhost:3002') {
    this.baseURL = baseURL;
  }

  async runLoadTest(config: {
    concurrentUsers: number;
    duration: number; // in seconds
    requestsPerSecond: number;
  }) {
    console.log(`Starting load test with ${config.concurrentUsers} users for ${config.duration} seconds`);
    
    const startTime = Date.now();
    const endTime = startTime + (config.duration * 1000);
    const promises: Promise<any>[] = [];

    for (let user = 0; user < config.concurrentUsers; user++) {
      promises.push(this.simulateUser(user, endTime, config.requestsPerSecond));
    }

    await Promise.all(promises);
    
    return this.generateReport();
  }

  private async simulateUser(userId: number, endTime: number, requestsPerSecond: number) {
    const interval = 1000 / requestsPerSecond;
    
    while (Date.now() < endTime) {
      const startTime = performance.now();
      
      try {
        const response = await request(this.baseURL)
          .get('/api/v1/streams')
          .timeout(5000);

        const responseTime = performance.now() - startTime;
        
        this.results.push({
          userId,
          timestamp: Date.now(),
          responseTime,
          status: response.status,
          success: response.status === 200
        });
      } catch (error) {
        const responseTime = performance.now() - startTime;
        
        this.results.push({
          userId,
          timestamp: Date.now(),
          responseTime,
          status: 0,
          success: false,
          error: error.message
        });
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  private generateReport() {
    const successfulRequests = this.results.filter(r => r.success);
    const failedRequests = this.results.filter(r => !r.success);
    
    const responseTimes = successfulRequests.map(r => r.responseTime);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    
    // Calculate percentiles
    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

    return {
      totalRequests: this.results.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: (successfulRequests.length / this.results.length) * 100,
      responseTime: {
        average: averageResponseTime,
        min: minResponseTime,
        max: maxResponseTime,
        p50,
        p95,
        p99
      },
      requestsPerSecond: this.results.length / ((this.results[this.results.length - 1]?.timestamp - this.results[0]?.timestamp) / 1000),
      errors: failedRequests.map(r => r.error).filter(Boolean)
    };
  }
}

// Performance monitoring utilities
export class StreamingPerformanceMonitor {
  private metrics: any[] = [];
  private interval: NodeJS.Timeout | null = null;

  start() {
    this.interval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.metrics.push({
        timestamp: Date.now(),
        memory: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      });
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getReport() {
    if (this.metrics.length === 0) return null;

    const memoryUsage = this.metrics.map(m => m.memory.heapUsed);
    const avgMemory = memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length;
    const maxMemory = Math.max(...memoryUsage);
    const minMemory = Math.min(...memoryUsage);

    return {
      duration: this.metrics.length,
      memory: {
        average: avgMemory,
        max: maxMemory,
        min: minMemory,
        samples: this.metrics.length
      },
      cpu: {
        samples: this.metrics.length
      }
    };
  }
}
