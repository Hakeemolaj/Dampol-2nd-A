import express from 'express';
// import { authenticate, restrictTo, optionalAuth } from '@/middleware/auth';
import { DocumentController } from '@/controllers/documentController';
import fileStorageService from '@/services/fileStorageService';

const router = express.Router();

// Configure multer for file uploads
const upload = fileStorageService.getMulterConfig();

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
router.get('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const fileInfo = await fileStorageService.serveFile(filename);

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
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
