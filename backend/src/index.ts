import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import documentRoutes from './routes/documents';
import analyticsRoutes from './routes/analytics';
import feedbackRoutes from './routes/feedback';
import surveysRoutes from './routes/surveys';
import residentsRoutes from './routes/residents';
import authRoutes from './routes/auth';
import notificationsRoutes from './routes/notifications';
import streamRoutes from './routes/streams';
import streamChatRoutes from './routes/streamChat';
import reportsRoutes from './routes/reports';
import incidentsRoutes from './routes/incidents';

// Import CommonJS routes
const announcementRoutes = require('./routes/announcements.js');
const financeRoutes = require('./routes/finance.js');

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { corsOptions } from './config/cors';
import { rateLimitConfig } from './config/rateLimit';
import { securityMiddleware } from './middleware/security';

// Import streaming service
import StreamingService from './services/streamingService';

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// Initialize streaming service
const streamingService = new StreamingService();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ""],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow streaming content
}));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(rateLimitConfig);

// CORS configuration
app.use(cors(corsOptions));

// Custom security middleware
app.use(securityMiddleware);

// Body parsing middleware with custom error handling
app.use((req: any, res: any, next: any) => {
  express.json({ limit: '10mb' })(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Invalid JSON format in request body'
      });
    }
    next();
  });
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple logging middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/announcements`, announcementRoutes);
app.use(`/api/${API_VERSION}/residents`, residentsRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationsRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${API_VERSION}/finance`, financeRoutes);
app.use(`/api/${API_VERSION}/documents`, documentRoutes);
app.use(`/api/${API_VERSION}/feedback`, feedbackRoutes);
app.use(`/api/${API_VERSION}/surveys`, surveysRoutes);
app.use(`/api/${API_VERSION}/streams`, streamRoutes);
app.use(`/api/${API_VERSION}/stream-chat`, streamChatRoutes);
app.use(`/api/${API_VERSION}/reports`, reportsRoutes);
app.use(`/api/${API_VERSION}/incidents`, incidentsRoutes);

// Simple API routes for testing
app.get(`/api/${API_VERSION}/test`, (req, res) => {
  res.json({
    status: 'success',
    message: 'Barangay API is working!',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Barangay Web Application API',
    version: API_VERSION,
    health: '/health',
    test: `/api/${API_VERSION}/test`,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  streamingService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  streamingService.stop();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Barangay API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);

  // Start streaming server
  streamingService.start();
  console.log(`📺 Streaming Server started on RTMP port 1935 and HTTP port 8000`);
});

export default app;
