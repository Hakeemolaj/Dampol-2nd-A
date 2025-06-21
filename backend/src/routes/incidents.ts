import express from 'express';
import { body, query } from 'express-validator';
import { authenticate, restrictTo, optionalAuth } from '@/middleware/auth';
import { handleValidationErrors } from '@/middleware/validation';
import { catchAsync } from '@/middleware/errorHandler';
import { IncidentsService } from '@/services/database/incidents.service';
import { AuthenticatedRequest } from '@/types/auth';
import { Response } from 'express';

const router = express.Router();

// Mock incidents data for development
let mockIncidents: any[] = [
  {
    id: 'inc-001',
    blotter_number: 'BLT-2025-001',
    incident_type: 'Noise Complaint',
    complainant_id: 'user-001',
    respondent_name: 'Juan Dela Cruz',
    respondent_address: 'Block 2, Lot 5, Dampol 2nd A',
    incident_date: '2025-01-15T20:30:00Z',
    incident_location: 'Block 2, Dampol 2nd A',
    description: 'Loud music and karaoke until late hours disturbing neighbors. Multiple complaints received.',
    status: 'Open',
    created_at: '2025-01-16T08:00:00Z',
    updated_at: '2025-01-16T08:00:00Z'
  },
  {
    id: 'inc-002',
    blotter_number: 'BLT-2025-002',
    incident_type: 'Property Damage',
    complainant_id: 'user-002',
    respondent_name: 'Maria Santos',
    respondent_address: 'Block 1, Lot 12, Dampol 2nd A',
    incident_date: '2025-01-14T14:00:00Z',
    incident_location: 'Dampol Road',
    description: 'Damaged fence and gate due to vehicle accident. Driver fled the scene.',
    status: 'Under Investigation',
    investigating_officer: 'officer-001',
    created_at: '2025-01-14T16:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  }
];

// Use mock service for development
const useMockService = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder');
const incidentsService = useMockService ? null : new IncidentsService();

// Test route
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Incidents API is working!',
    mockService: useMockService,
    incidentsCount: mockIncidents.length
  });
});

// Simple POST test route
router.post('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'POST test successful',
    body: req.body
  });
});

// Validation schemas
const createIncidentValidation = [
  body('incident_type')
    .notEmpty()
    .withMessage('Incident type is required')
    .isIn(['Theft', 'Assault', 'Domestic Violence', 'Noise Complaint', 'Property Damage', 'Public Disturbance', 'Traffic Violation', 'Drug-related', 'Other'])
    .withMessage('Invalid incident type'),
  body('respondent_name')
    .notEmpty()
    .withMessage('Respondent name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Respondent name must be between 2 and 200 characters'),
  body('incident_date')
    .notEmpty()
    .withMessage('Incident date is required')
    .isISO8601()
    .withMessage('Invalid incident date format'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('incident_location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Incident location must not exceed 200 characters'),
  body('respondent_address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Respondent address must not exceed 500 characters'),
];

const updateIncidentValidation = [
  body('status')
    .optional()
    .isIn(['Open', 'Under Investigation', 'Mediation', 'Resolved', 'Referred', 'Closed'])
    .withMessage('Invalid status'),
  body('investigating_officer')
    .optional()
    .isUUID()
    .withMessage('Invalid investigating officer ID'),
  body('resolution')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Resolution must not exceed 2000 characters'),
];

// GET /api/v1/incidents - Get all incident reports (admin/staff only)
router.get('/',
  authenticate,
  restrictTo('admin', 'staff', 'barangay_captain', 'barangay_councilor'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const {
      page = '1',
      limit = '10',
      status,
      incident_type,
      date_from,
      date_to,
      search
    } = req.query;

    if (useMockService) {
      // Mock implementation
      let filtered = [...mockIncidents];

      if (status) filtered = filtered.filter(i => i.status === status);
      if (incident_type) filtered = filtered.filter(i => i.incident_type === incident_type);
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filtered = filtered.filter(i =>
          i.blotter_number.toLowerCase().includes(searchLower) ||
          i.respondent_name.toLowerCase().includes(searchLower) ||
          i.description.toLowerCase().includes(searchLower)
        );
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const start = (pageNum - 1) * limitNum;
      const end = start + limitNum;
      const paginatedData = filtered.slice(start, end);

      res.json({
        status: 'success',
        data: {
          incidents: paginatedData,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limitNum)
          },
        },
      });
    } else {
      const filters: any = {};
      if (status) filters.status = status as string;
      if (incident_type) filters.incident_type = incident_type as string;
      if (date_from) filters.date_from = date_from as string;
      if (date_to) filters.date_to = date_to as string;
      if (search) filters.search = search as string;

      const result = await incidentsService!.getAll(
        { page: parseInt(page as string), limit: parseInt(limit as string) },
        filters
      );

      res.json({
        status: 'success',
        data: {
          incidents: result.data,
          pagination: result.pagination,
        },
      });
    }
  })
);

// GET /api/v1/incidents/:id - Get specific incident report
router.get('/:id',
  authenticate,
  restrictTo('admin', 'staff', 'barangay_captain', 'barangay_councilor'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const incident = await incidentsService.getById(id);

    if (!incident) {
      return res.status(404).json({
        status: 'error',
        message: 'Incident report not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        incident,
      },
    });
  })
);

// POST /api/v1/incidents - Create new incident report
router.post('/',
  optionalAuth, // Allow both authenticated and anonymous reporting
  createIncidentValidation,
  handleValidationErrors,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const {
      incident_type,
      respondent_name,
      respondent_address,
      incident_date,
      incident_location,
      description,
    } = req.body;

    if (useMockService) {
      // Mock implementation
      const newIncident = {
        id: `inc-${Date.now()}`,
        blotter_number: `BLT-2025-${String(mockIncidents.length + 1).padStart(3, '0')}`,
        incident_type,
        complainant_id: req.user?.id || null,
        respondent_name,
        respondent_address: respondent_address || null,
        incident_date,
        incident_location: incident_location || null,
        description,
        status: 'Open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockIncidents.push(newIncident);

      res.status(201).json({
        status: 'success',
        data: {
          incident: newIncident,
        },
        message: 'Incident report submitted successfully. You will receive updates on the investigation.',
      });
    } else {
      const incident = await incidentsService!.create({
        incident_type,
        complainant_id: req.user?.id, // Will be null for anonymous reports
        respondent_name,
        respondent_address,
        incident_date,
        incident_location,
        description,
      });

      res.status(201).json({
        status: 'success',
        data: {
          incident,
        },
        message: 'Incident report submitted successfully. You will receive updates on the investigation.',
      });
    }
  })
);

// PUT /api/v1/incidents/:id - Update incident report (admin/staff only)
router.put('/:id',
  authenticate,
  restrictTo('admin', 'staff', 'barangay_captain'),
  updateIncidentValidation,
  handleValidationErrors,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // If resolving the incident, add resolved timestamp
    if (updateData.status === 'Resolved' || updateData.status === 'Closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const incident = await incidentsService.update(id, updateData);

    res.json({
      status: 'success',
      data: {
        incident,
      },
      message: 'Incident report updated successfully',
    });
  })
);

// DELETE /api/v1/incidents/:id - Delete incident report (admin only)
router.delete('/:id',
  authenticate,
  restrictTo('admin'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await incidentsService.delete(id);

    res.json({
      status: 'success',
      message: 'Incident report deleted successfully',
    });
  })
);

// GET /api/v1/incidents/stats/overview - Get incident statistics
router.get('/stats/overview',
  authenticate,
  restrictTo('admin', 'staff', 'barangay_captain', 'barangay_councilor'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (useMockService) {
      // Mock implementation
      const stats = {
        total: mockIncidents.length,
        open: mockIncidents.filter(i => i.status === 'Open').length,
        under_investigation: mockIncidents.filter(i => i.status === 'Under Investigation').length,
        resolved: mockIncidents.filter(i => i.status === 'Resolved').length,
        closed: mockIncidents.filter(i => i.status === 'Closed').length,
        by_type: mockIncidents.reduce((acc: any, incident) => {
          acc[incident.incident_type] = (acc[incident.incident_type] || 0) + 1;
          return acc;
        }, {})
      };

      res.json({
        status: 'success',
        data: {
          stats,
        },
      });
    } else {
      const stats = await incidentsService!.getStats();

      res.json({
        status: 'success',
        data: {
          stats,
        },
      });
    }
  })
);

// GET /api/v1/incidents/blotter/:blotter_number - Get incident by blotter number
router.get('/blotter/:blotter_number',
  authenticate,
  restrictTo('admin', 'staff', 'barangay_captain', 'barangay_councilor'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { blotter_number } = req.params;
    const incident = await incidentsService.getByBlotterNumber(blotter_number);

    if (!incident) {
      return res.status(404).json({
        status: 'error',
        message: 'Incident report not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        incident,
      },
    });
  })
);

// POST /api/v1/incidents/:id/assign - Assign investigating officer
router.post('/:id/assign',
  authenticate,
  restrictTo('admin', 'staff', 'barangay_captain'),
  body('investigating_officer').isUUID().withMessage('Invalid officer ID'),
  handleValidationErrors,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { investigating_officer } = req.body;

    const incident = await incidentsService.update(id, {
      investigating_officer,
      status: 'Under Investigation',
    });

    res.json({
      status: 'success',
      data: {
        incident,
      },
      message: 'Investigating officer assigned successfully',
    });
  })
);

export default router;
