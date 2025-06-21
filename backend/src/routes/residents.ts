import express, { Response } from 'express';
import { authenticate, restrictTo, AuthenticatedRequest } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';
import { residentsService } from '@/services/database';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/residents - Get residents (admin/staff only)
router.get('/', restrictTo('admin', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '10', search, status, household_id } = req.query;

  // Build filters
  const filters: any = {};
  if (search) filters.search = search as string;
  if (status) filters.status = status as string;
  if (household_id) filters.household_id = household_id as string;

  const result = await residentsService.getAll(
    { page: parseInt(page as string), limit: parseInt(limit as string) },
    filters
  );

  res.json({
    status: 'success',
    data: {
      residents: result.data,
      pagination: result.pagination,
    },
  });
}));

// POST /api/v1/residents - Register as resident
router.post('/', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { resident_id, household_id, relationship_to_head, ...otherData } = req.body;

  // Generate resident ID if not provided
  const finalResidentId = resident_id || await residentsService.generateResidentId();

  const resident = await residentsService.create({
    user_id: req.user?.id,
    resident_id: finalResidentId,
    household_id,
    relationship_to_head,
    ...otherData,
  });

  res.status(201).json({
    status: 'success',
    data: {
      resident,
    },
  });
}));

// GET /api/v1/residents/profile - Get own resident profile
router.get('/profile', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const resident = await residentsService.getByUserId(req.user.id);

  if (!resident) {
    return res.status(404).json({
      status: 'error',
      message: 'Resident profile not found',
    });
  }

  res.json({
    status: 'success',
    data: {
      resident,
    },
  });
}));

// PUT /api/v1/residents/profile - Update own resident profile
router.put('/profile', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const resident = await residentsService.getByUserId(req.user.id);
  if (!resident) {
    return res.status(404).json({
      status: 'error',
      message: 'Resident profile not found',
    });
  }

  const updatedResident = await residentsService.update(resident.id, req.body);

  res.json({
    status: 'success',
    data: {
      resident: updatedResident,
    },
  });
}));

// GET /api/v1/residents/profile/complete - Get complete resident profile
router.get('/profile/complete', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const resident = await residentsService.getByUserId(req.user.id);
  if (!resident) {
    return res.status(404).json({
      status: 'error',
      message: 'Resident profile not found',
    });
  }

  const completeProfile = await residentsService.getCompleteProfile(resident.id);

  res.json({
    status: 'success',
    data: {
      profile: completeProfile,
    },
  });
}));

// GET /api/v1/residents/:id - Get resident by ID (admin/staff only)
router.get('/:id', restrictTo('admin', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const resident = await residentsService.getById(id);

  if (!resident) {
    return res.status(404).json({
      status: 'error',
      message: 'Resident not found',
    });
  }

  res.json({
    status: 'success',
    data: {
      resident,
    },
  });
}));

// GET /api/v1/residents/:id/complete - Get complete resident profile by ID (admin/staff only)
router.get('/:id/complete', restrictTo('admin', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const completeProfile = await residentsService.getCompleteProfile(id);

  if (!completeProfile) {
    return res.status(404).json({
      status: 'error',
      message: 'Resident profile not found',
    });
  }

  res.json({
    status: 'success',
    data: {
      profile: completeProfile,
    },
  });
}));

// PUT /api/v1/residents/:id - Update resident (admin/staff only)
router.put('/:id', restrictTo('admin', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updatedResident = await residentsService.update(id, req.body);

  if (!updatedResident) {
    return res.status(404).json({
      status: 'error',
      message: 'Resident not found',
    });
  }

  res.json({
    status: 'success',
    data: {
      resident: updatedResident,
    },
  });
}));

// PATCH /api/v1/residents/:id/status - Update resident status (admin only)
router.patch('/:id/status', restrictTo('admin'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Active', 'Inactive', 'Deceased', 'Moved'].includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid status value',
    });
  }

  const updatedResident = await residentsService.update(id, { status });

  if (!updatedResident) {
    return res.status(404).json({
      status: 'error',
      message: 'Resident not found',
    });
  }

  res.json({
    status: 'success',
    data: {
      resident: updatedResident,
    },
  });
}));

// Family Relationship Management

// GET /api/v1/residents/:id/family - Get family relationships
router.get('/:id/family', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if user can access this resident's family info
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
    const resident = await residentsService.getByUserId(req.user?.id || '');
    if (!resident || resident.id !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }
  }

  const familyRelationships = await residentsService.getFamilyRelationships(id);

  res.json({
    status: 'success',
    data: {
      relationships: familyRelationships,
    },
  });
}));

// POST /api/v1/residents/:id/family - Add family relationship
router.post('/:id/family', restrictTo('admin', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { related_resident_id, relationship_type, is_primary } = req.body;

  const relationship = await residentsService.addFamilyRelationship({
    resident_id: id,
    related_resident_id,
    relationship_type,
    is_primary,
  });

  res.status(201).json({
    status: 'success',
    data: {
      relationship,
    },
  });
}));

// DELETE /api/v1/residents/:id/family/:relationshipId - Remove family relationship
router.delete('/:id/family/:relationshipId', restrictTo('admin', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { relationshipId } = req.params;

  await residentsService.removeFamilyRelationship(relationshipId);

  res.json({
    status: 'success',
    message: 'Family relationship removed successfully',
  });
}));

// Emergency Contacts Management

// GET /api/v1/residents/:id/emergency-contacts - Get emergency contacts
router.get('/:id/emergency-contacts', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if user can access this resident's emergency contacts
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
    const resident = await residentsService.getByUserId(req.user?.id || '');
    if (!resident || resident.id !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }
  }

  const emergencyContacts = await residentsService.getEmergencyContacts(id);

  res.json({
    status: 'success',
    data: {
      contacts: emergencyContacts,
    },
  });
}));

// POST /api/v1/residents/:id/emergency-contacts - Add emergency contact
router.post('/:id/emergency-contacts', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if user can modify this resident's emergency contacts
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
    const resident = await residentsService.getByUserId(req.user?.id || '');
    if (!resident || resident.id !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }
  }

  const contact = await residentsService.addEmergencyContact({
    resident_id: id,
    ...req.body,
  });

  res.status(201).json({
    status: 'success',
    data: {
      contact,
    },
  });
}));

// PUT /api/v1/residents/:id/emergency-contacts/:contactId - Update emergency contact
router.put('/:id/emergency-contacts/:contactId', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id, contactId } = req.params;

  // Check if user can modify this resident's emergency contacts
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
    const resident = await residentsService.getByUserId(req.user?.id || '');
    if (!resident || resident.id !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }
  }

  const updatedContact = await residentsService.updateEmergencyContact(contactId, req.body);

  res.json({
    status: 'success',
    data: {
      contact: updatedContact,
    },
  });
}));

// DELETE /api/v1/residents/:id/emergency-contacts/:contactId - Remove emergency contact
router.delete('/:id/emergency-contacts/:contactId', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id, contactId } = req.params;

  // Check if user can modify this resident's emergency contacts
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
    const resident = await residentsService.getByUserId(req.user?.id || '');
    if (!resident || resident.id !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }
  }

  await residentsService.removeEmergencyContact(contactId);

  res.json({
    status: 'success',
    message: 'Emergency contact removed successfully',
  });
}));

export default router;
