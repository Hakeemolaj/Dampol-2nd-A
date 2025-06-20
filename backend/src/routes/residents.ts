import express from 'express';
import { authenticate, restrictTo } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/residents - Get residents (admin/staff only)
router.get('/', restrictTo('admin', 'staff'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Residents endpoint - Coming soon',
  });
});

// POST /api/v1/residents - Register as resident
router.post('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Resident registration - Coming soon',
  });
});

// GET /api/v1/residents/profile - Get own resident profile
router.get('/profile', (req, res) => {
  res.json({
    status: 'success',
    message: 'Get resident profile - Coming soon',
  });
});

// PUT /api/v1/residents/profile - Update own resident profile
router.put('/profile', (req, res) => {
  res.json({
    status: 'success',
    message: 'Update resident profile - Coming soon',
  });
});

// GET /api/v1/residents/:id - Get resident by ID (admin/staff only)
router.get('/:id', restrictTo('admin', 'staff'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Get resident by ID - Coming soon',
  });
});

// PUT /api/v1/residents/:id - Update resident (admin/staff only)
router.put('/:id', restrictTo('admin', 'staff'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Update resident - Coming soon',
  });
});

// PATCH /api/v1/residents/:id/status - Update resident status (admin only)
router.patch('/:id/status', restrictTo('admin'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Update resident status - Coming soon',
  });
});

export default router;
