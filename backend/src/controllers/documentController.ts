import { Request, Response, NextFunction } from 'express';
// import { supabase } from '@/config/supabase';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import fileStorageService from '@/services/fileStorageService';
import workflowService from '@/services/workflowService';

// Input sanitization function
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/['";]/g, '') // Remove quotes and semicolons that could be used for SQL injection
    .replace(/DROP\s+TABLE/gi, '') // Remove DROP TABLE statements
    .replace(/DELETE\s+FROM/gi, '') // Remove DELETE statements
    .replace(/INSERT\s+INTO/gi, '') // Remove INSERT statements
    .replace(/UPDATE\s+SET/gi, '') // Remove UPDATE statements
    .trim();
}

// Mock data for document types
const documentTypes = [
  {
    id: 'barangay-clearance',
    name: 'Barangay Clearance',
    description: 'Certificate of good moral character for employment, business, and other legal purposes',
    fee: 50,
    processing_time_days: 2,
    requirements: [
      'Valid government-issued ID',
      'Proof of residency in Barangay Dampol 2nd A',
      'Completed application form',
      '2x2 ID picture (2 pieces)'
    ],
    is_active: true
  },
  {
    id: 'certificate-residency',
    name: 'Certificate of Residency',
    description: 'Official proof of residence in Barangay Dampol 2nd A',
    fee: 30,
    processing_time_days: 1,
    requirements: [
      'Valid government-issued ID',
      'Proof of residency (utility bill, lease contract)',
      'Completed application form'
    ],
    is_active: true
  },
  {
    id: 'certificate-indigency',
    name: 'Certificate of Indigency',
    description: 'Certification for low-income families to access government assistance',
    fee: 25,
    processing_time_days: 3,
    requirements: [
      'Valid government-issued ID',
      'Proof of residency',
      'Income documents or affidavit of no income',
      'Completed application form'
    ],
    is_active: true
  }
];

// Mock data for document requests
let documentRequests: any[] = [
  {
    id: 'req-001',
    request_number: 'BR25062001',
    document_type_id: 'barangay-clearance',
    applicant_id: 'user-001',
    purpose: 'Employment application',
    fee_amount: 50,
    status: 'Processing',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Application under review by barangay secretary'
  }
];

// Validation schemas
const createDocumentRequestSchema = z.object({
  type: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  dateOfBirth: z.string(),
  civilStatus: z.string(),
  address: z.string().min(1, 'Address is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  email: z.string().email().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  otherPurpose: z.string().optional(),
  additionalInfo: z.any().optional(),
});

const updateRequestStatusSchema = z.object({
  status: z.enum(['Pending', 'Processing', 'Ready', 'Released', 'Rejected']),
  notes: z.string().optional(),
});

// Generate unique request number
function generateRequestNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `BR${year}${month}${day}${random}`;
}

export class DocumentController {
  // Get all document types (public)
  static async getDocumentTypes(req: Request, res: Response): Promise<void> {
    try {
      const activeDocumentTypes = documentTypes.filter(dt => dt.is_active);

      res.json({
        success: true,
        data: activeDocumentTypes,
      });
    } catch (error) {
      console.error('Error fetching document types:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Create a new document request
  static async createDocumentRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validation = createDocumentRequestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors,
        });
        return;
      }

      const {
        type,
        firstName: rawFirstName,
        lastName: rawLastName,
        middleName: rawMiddleName,
        dateOfBirth,
        civilStatus,
        address: rawAddress,
        contactNumber,
        email,
        purpose: rawPurpose,
        otherPurpose: rawOtherPurpose,
        additionalInfo
      } = validation.data;

      // Sanitize input data
      const firstName = sanitizeInput(rawFirstName);
      const lastName = sanitizeInput(rawLastName);
      const middleName = rawMiddleName ? sanitizeInput(rawMiddleName) : undefined;
      const address = sanitizeInput(rawAddress);
      const purpose = sanitizeInput(rawPurpose);
      const otherPurpose = rawOtherPurpose ? sanitizeInput(rawOtherPurpose) : undefined;

      // Find document type
      const documentType = documentTypes.find(dt => dt.id === type);
      if (!documentType) {
        res.status(404).json({
          success: false,
          message: 'Document type not found',
        });
        return;
      }

      // Generate request number and tracking number
      const requestNumber = generateRequestNumber();
      const trackingNumber = `TRK-${String(documentRequests.length + 1).padStart(3, '0')}-2025`;

      // Create new request
      const newRequest = {
        id: uuidv4(),
        request_number: requestNumber,
        document_type_id: type,
        applicant_id: req.user?.id || 'anonymous',
        status: 'Pending',
        applicantName: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`,
        contactNumber,
        email,
        purpose: purpose === 'Other legal purposes' ? otherPurpose : purpose,
        fee_amount: documentType.fee,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + documentType.processing_time_days * 24 * 60 * 60 * 1000).toISOString(),
        trackingNumber,
        notes: 'Application received and queued for processing',
        formData: {
          firstName,
          lastName,
          middleName,
          dateOfBirth,
          civilStatus,
          address,
          additionalInfo
        },
        document_types: documentType
      };

      documentRequests.push(newRequest);

      // Create workflow instance
      const workflowInstance = workflowService.createWorkflowInstance(
        newRequest.id,
        type,
        'medium'
      );

      if (workflowInstance) {
        console.log(`Workflow created for request ${newRequest.id}:`, workflowInstance.id);
      }

      res.status(201).json({
        success: true,
        message: 'Document request submitted successfully',
        data: newRequest,
      });
    } catch (error) {
      console.error('Error creating document request:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Get user's document requests
  static async getUserDocumentRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const userRequests = documentRequests.slice(offset, offset + limit);
      const total = documentRequests.length;

      res.json({
        success: true,
        data: userRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching user document requests:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Get specific document request
  static async getDocumentRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request = documentRequests.find(req => req.id === id);

      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Document request not found',
        });
        return;
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      console.error('Error fetching document request:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Admin: Get all document requests
  static async getAllDocumentRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status as string;

      let filteredRequests = documentRequests;

      if (status) {
        filteredRequests = documentRequests.filter(req => req.status === status);
      }

      const paginatedRequests = filteredRequests.slice(offset, offset + limit);
      const total = filteredRequests.length;

      res.json({
        success: true,
        data: paginatedRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching all document requests:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Admin: Update document request status
  static async updateDocumentRequestStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateRequestStatusSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors,
        });
        return;
      }

      const { status, notes } = validation.data;
      const requestIndex = documentRequests.findIndex(req => req.id === id);

      if (requestIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Document request not found',
        });
        return;
      }

      const request = documentRequests[requestIndex];
      request.status = status;
      request.updated_at = new Date().toISOString();

      if (notes) {
        request.notes = notes;
      }

      if (status === 'Processing') {
        request.processed_at = new Date().toISOString();
      } else if (status === 'Released') {
        request.released_at = new Date().toISOString();
      }

      res.json({
        success: true,
        message: 'Document request status updated successfully',
        data: request,
      });
    } catch (error) {
      console.error('Error updating document request status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Upload supporting documents
  static async uploadDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
        return;
      }

      const request = documentRequests.find(req => req.id === id);
      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Document request not found',
        });
        return;
      }

      const uploadResults = [];
      for (const file of files) {
        try {
          const result = await fileStorageService.processUpload(
            file,
            req.user?.id || 'anonymous',
            id,
            'documents'
          );
          uploadResults.push(result);
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          // Continue with other files
        }
      }

      res.json({
        success: true,
        message: `${uploadResults.length} files uploaded successfully`,
        data: uploadResults,
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Get workflow status
  static async getWorkflowStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Document request ID is required',
        });
        return;
      }

      const workflow = workflowService.getWorkflowByDocumentRequest(id);
      if (!workflow) {
        res.status(404).json({
          success: false,
          message: 'Workflow not found',
        });
        return;
      }

      const progress = workflowService.getWorkflowProgress(workflow.id);

      res.json({
        success: true,
        data: {
          workflow,
          progress,
        },
      });
    } catch (error) {
      console.error('Error getting workflow status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Start workflow step (admin only)
  static async startWorkflowStep(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id, stepId } = req.params;
      const { assignedTo } = req.body;

      if (!id || !stepId) {
        res.status(400).json({
          success: false,
          message: 'Document request ID and step ID are required',
        });
        return;
      }

      const workflow = workflowService.getWorkflowByDocumentRequest(id);
      if (!workflow) {
        res.status(404).json({
          success: false,
          message: 'Workflow not found',
        });
        return;
      }

      const success = workflowService.startStep(workflow.id, stepId, assignedTo || req.user?.id || 'system');
      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Failed to start workflow step',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Workflow step started successfully',
      });
    } catch (error) {
      console.error('Error starting workflow step:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Complete workflow step (admin only)
  static async completeWorkflowStep(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id, stepId } = req.params;
      const { notes, attachments } = req.body;

      if (!id || !stepId) {
        res.status(400).json({
          success: false,
          message: 'Document request ID and step ID are required',
        });
        return;
      }

      const workflow = workflowService.getWorkflowByDocumentRequest(id);
      if (!workflow) {
        res.status(404).json({
          success: false,
          message: 'Workflow not found',
        });
        return;
      }

      const success = workflowService.completeStep(workflow.id, stepId, notes, attachments);
      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Failed to complete workflow step',
        });
        return;
      }

      // Update document request status based on workflow progress
      const progress = workflowService.getWorkflowProgress(workflow.id);
      if (progress && progress.progressPercentage === 100) {
        const request = documentRequests.find(req => req.id === id);
        if (request) {
          request.status = 'Ready';
          request.updated_at = new Date().toISOString();
        }
      }

      res.json({
        success: true,
        message: 'Workflow step completed successfully',
      });
    } catch (error) {
      console.error('Error completing workflow step:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Get file storage statistics (admin only)
  static async getStorageStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await fileStorageService.getStorageStats();
      const workflowStats = workflowService.getWorkflowStatistics();

      res.json({
        success: true,
        data: {
          storage: stats,
          workflows: workflowStats,
        },
      });
    } catch (error) {
      console.error('Error getting storage stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
