import express from 'express';
import { authenticate, restrictTo, optionalAuth } from '@/middleware/auth';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, (req, res) => {
  res.json({
    status: 'success',
    message: 'Announcements endpoint - Coming soon',
    data: [
      {
        id: '1',
        title: 'Community Meeting - December 20, 2024',
        summary: 'Monthly barangay assembly to discuss community matters and upcoming projects',
        content: 'Join us for our monthly community meeting where we will discuss important matters affecting our barangay...',
        category: 'Meeting',
        priority: 'normal',
        isPublished: true,
        publishedAt: '2024-12-15T08:00:00Z',
        expiresAt: '2024-12-20T18:00:00Z',
        createdAt: '2024-12-15T08:00:00Z',
      },
      {
        id: '2',
        title: 'Free Medical Checkup Program',
        summary: 'Health program available for all residents this December 18',
        content: 'We are pleased to announce a free medical checkup program for all barangay residents...',
        category: 'Health',
        priority: 'normal',
        isPublished: true,
        publishedAt: '2024-12-14T09:00:00Z',
        expiresAt: '2024-12-18T17:00:00Z',
        createdAt: '2024-12-14T09:00:00Z',
      },
      {
        id: '3',
        title: 'Road Maintenance Notice',
        summary: 'Main street repair ongoing, expect traffic delays',
        content: 'Please be advised that road maintenance work is currently ongoing on Main Street...',
        category: 'Infrastructure',
        priority: 'urgent',
        isPublished: true,
        publishedAt: '2024-12-13T06:00:00Z',
        expiresAt: '2024-12-20T18:00:00Z',
        createdAt: '2024-12-13T06:00:00Z',
      },
    ],
  });
});

router.get('/:id', optionalAuth, (req, res) => {
  res.json({
    status: 'success',
    message: 'Get announcement by ID - Coming soon',
  });
});

// Admin routes
router.use(authenticate);
router.use(restrictTo('admin', 'staff'));

// POST /api/v1/announcements - Create announcement
router.post('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Create announcement - Coming soon',
  });
});

// PUT /api/v1/announcements/:id - Update announcement
router.put('/:id', (req, res) => {
  res.json({
    status: 'success',
    message: 'Update announcement - Coming soon',
  });
});

// DELETE /api/v1/announcements/:id - Delete announcement
router.delete('/:id', (req, res) => {
  res.json({
    status: 'success',
    message: 'Delete announcement - Coming soon',
  });
});

// PATCH /api/v1/announcements/:id/publish - Publish/unpublish announcement
router.patch('/:id/publish', (req, res) => {
  res.json({
    status: 'success',
    message: 'Publish/unpublish announcement - Coming soon',
  });
});

module.exports = router;
