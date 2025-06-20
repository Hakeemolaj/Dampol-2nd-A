import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes (using require for TS files)
const announcementRoutes = require('./routes/announcements');
const documentRoutes = require('./routes/documents');
const analyticsRoutes = require('./routes/analytics');
const financeRoutes = require('./routes/finance.js');
const feedbackRoutes = require('./routes/feedback');
const surveysRoutes = require('./routes/surveys');

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
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
app.use(`/api/${API_VERSION}/announcements`, announcementRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${API_VERSION}/finance`, financeRoutes);
app.use(`/api/${API_VERSION}/documents`, documentRoutes);
app.use(`/api/${API_VERSION}/feedback`, feedbackRoutes);
app.use(`/api/${API_VERSION}/surveys`, surveysRoutes);

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
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Barangay API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
