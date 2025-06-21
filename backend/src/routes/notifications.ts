import express, { Response } from 'express';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';
import { NotificationsService } from '@/services/database/notifications.service';

const router = express.Router();
const notificationsService = new NotificationsService();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/notifications - Get user notifications
router.get('/', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const { page = '1', limit = '10', is_read, priority, type_name } = req.query;

  // Build filters
  const filters: any = {};
  if (is_read !== undefined) filters.is_read = is_read === 'true';
  if (priority) filters.priority = priority as string;
  if (type_name) filters.type_name = type_name as string;

  const result = await notificationsService.getUserNotifications(
    req.user.id,
    { page: parseInt(page as string), limit: parseInt(limit as string) },
    filters
  );

  res.json({
    status: 'success',
    data: {
      notifications: result.data,
      pagination: result.pagination,
    },
  });
}));

// GET /api/v1/notifications/unread-count - Get unread notification count
router.get('/unread-count', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const count = await notificationsService.getUnreadCount(req.user.id);

  res.json({
    status: 'success',
    data: {
      count,
    },
  });
}));

// PUT /api/v1/notifications/:id/read - Mark notification as read
router.put('/:id/read', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const { id } = req.params;
  const notification = await notificationsService.markAsRead(id, req.user.id);

  res.json({
    status: 'success',
    data: {
      notification,
    },
  });
}));

// PUT /api/v1/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  await notificationsService.markAllAsRead(req.user.id);

  res.json({
    status: 'success',
    message: 'All notifications marked as read',
  });
}));

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const { id } = req.params;
  await notificationsService.delete(id, req.user.id);

  res.json({
    status: 'success',
    message: 'Notification deleted',
  });
}));

// GET /api/v1/notifications/preferences - Get user notification preferences
router.get('/preferences', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const preferences = await notificationsService.getUserPreferences(req.user.id);

  res.json({
    status: 'success',
    data: {
      preferences: preferences || {
        email_enabled: true,
        sms_enabled: false,
        push_enabled: true,
        in_app_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
        preferences: {},
      },
    },
  });
}));

// PUT /api/v1/notifications/preferences - Update user notification preferences
router.put('/preferences', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const {
    email_enabled,
    sms_enabled,
    push_enabled,
    in_app_enabled,
    quiet_hours_start,
    quiet_hours_end,
    preferences,
  } = req.body;

  const updatedPreferences = await notificationsService.updateUserPreferences(req.user.id, {
    email_enabled,
    sms_enabled,
    push_enabled,
    in_app_enabled,
    quiet_hours_start,
    quiet_hours_end,
    preferences,
  });

  res.json({
    status: 'success',
    data: {
      preferences: updatedPreferences,
    },
  });
}));

// POST /api/v1/notifications/test - Create test notification (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    const { title, message, priority = 'normal', type_name = 'system' } = req.body;

    const notification = await notificationsService.create({
      user_id: req.user.id,
      type_name,
      title: title || 'Test Notification',
      message: message || 'This is a test notification from the system.',
      priority,
    });

    res.json({
      status: 'success',
      data: {
        notification,
      },
    });
  }));
}

export default router;
