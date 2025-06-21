import express from 'express';
import { authenticate, restrictTo, AuthenticatedRequest } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';
import { DocumentsService } from '@/services/database/documents.service';
import { fileUploadService } from '@/services/fileUploadService';
import { realTimeNotificationService } from '@/services/realTimeNotificationService';
import { DocumentController } from '@/controllers/documentController';
import multer from 'multer';

const router = express.Router();
const documentsService = new DocumentsService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

// Public routes
router.get('/types', DocumentController.getDocumentTypes);

// Document request routes (temporarily without auth for testing)
router.post('/requests', DocumentController.createDocumentRequest);
router.get('/requests', DocumentController.getUserDocumentRequests);
router.get('/requests/:id', DocumentController.getDocumentRequest);

// File upload routes
router.post('/requests/:id/upload', upload.array('documents', 5), DocumentController.uploadDocuments);

// Workflow routes
router.get('/requests/:id/workflow', DocumentController.getWorkflowStatus);
router.post('/requests/:id/workflow/steps/:stepId/start', DocumentController.startWorkflowStep);
router.post('/requests/:id/workflow/steps/:stepId/complete', DocumentController.completeWorkflowStep);

// Admin routes (temporarily without auth for testing)
router.get('/admin/requests', DocumentController.getAllDocumentRequests);
router.patch('/admin/requests/:id/status', DocumentController.updateDocumentRequestStatus);
router.get('/admin/stats', DocumentController.getStorageStats);

// File serving route
router.get('/files/:filename', async (req, res): Promise<void> => {
  try {
    const { filename } = req.params;
    const fileInfo = await fileUploadService.serveFile(filename);

    if (!fileInfo) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.sendFile(fileInfo.path);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file'
    });
  }
});

export default router;
