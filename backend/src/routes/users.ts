import express from 'express';
import { authenticate, restrictTo } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/users - Get all users (admin only)
router.get('/', restrictTo('admin'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Users endpoint - Coming soon',
  });
});

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  res.json({
    status: 'success',
    message: 'Get user by ID - Coming soon',
  });
});

// PUT /api/v1/users/:id - Update user (admin only)
router.put('/:id', restrictTo('admin'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Update user - Coming soon',
  });
});

// DELETE /api/v1/users/:id - Delete user (admin only)
router.delete('/:id', restrictTo('admin'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Delete user - Coming soon',
  });
});

export default router;
