import express from 'express';
import { authenticate, restrictTo, requireBarangayOfficial, requireBarangayCaptain } from '@/middleware/auth';
import { roleManagementService } from '@/services/roleManagementService';
import { catchAsync } from '@/middleware/errorHandler';
import { supabaseAdmin } from '@/config/supabase';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(restrictTo('admin'));

// GET /api/v1/admin/dashboard - Admin dashboard stats
router.get('/dashboard',
  requireBarangayOfficial,
  catchAsync(async (req, res) => {
    // Get comprehensive dashboard statistics
    const stats = await getDashboardStats();
    const recentActivity = await getRecentActivity();
    const alerts = await getSystemAlerts();
    const quickStats = await getQuickStats();

    res.json({
      status: 'success',
      data: {
        stats,
        recentActivity,
        alerts,
        quickStats,
        lastUpdated: new Date().toISOString(),
      },
    });
  })
);

// GET /api/v1/admin/users - Get all users with roles
router.get('/users',
  restrictTo('admin', 'barangay_captain'),
  catchAsync(async (req, res) => {
    const users = await roleManagementService.getAllUsersWithRoles();

    res.json({
      status: 'success',
      data: {
        users,
      },
    });
  })
);

// GET /api/v1/admin/roles - Get role hierarchy and permissions
router.get('/roles',
  requireBarangayOfficial,
  catchAsync(async (req, res) => {
    const hierarchy = roleManagementService.getRoleHierarchy();

    res.json({
      status: 'success',
      data: {
        roles: hierarchy,
      },
    });
  })
);

// PUT /api/v1/admin/users/:id/role - Update user role
router.put('/users/:id/role',
  requireBarangayCaptain,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { role, position, department, reason } = req.body;

    // Get current user data for audit log
    const currentUsers = await roleManagementService.getAllUsersWithRoles();
    const currentUser = currentUsers.find(u => u.id === id);

    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Update role
    const updatedUser = await roleManagementService.updateUserRole(id, role, position, department);

    // Log the change
    await roleManagementService.logRoleChange(
      req.user!.id,
      id,
      currentUser.role,
      role,
      reason
    );

    res.json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  })
);

// GET /api/v1/admin/officials - Get barangay officials
router.get('/officials',
  requireBarangayOfficial,
  catchAsync(async (req, res) => {
    const officials = await roleManagementService.getBarangayOfficials();

    res.json({
      status: 'success',
      data: {
        officials,
      },
    });
  })
);

// GET /api/v1/admin/staff - Get staff members
router.get('/staff',
  requireBarangayOfficial,
  catchAsync(async (req, res) => {
    const staff = await roleManagementService.getStaffMembers();

    res.json({
      status: 'success',
      data: {
        staff,
      },
    });
  })
);

// POST /api/v1/admin/roles/bulk-update - Bulk update user roles
router.post('/roles/bulk-update',
  requireBarangayCaptain,
  catchAsync(async (req, res) => {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        status: 'error',
        message: 'Updates must be an array',
      });
    }

    const results = await roleManagementService.bulkUpdateRoles(updates, req.user!.id);

    res.json({
      status: 'success',
      data: {
        updated_users: results,
      },
    });
  })
);

// GET /api/v1/admin/permissions/:role - Get permissions for a role
router.get('/permissions/:role',
  requireBarangayOfficial,
  catchAsync(async (req, res) => {
    const { role } = req.params;
    const permissions = roleManagementService.getRolePermissions(role);

    res.json({
      status: 'success',
      data: {
        role,
        permissions,
      },
    });
  })
);

// GET /api/v1/admin/documents - Manage documents
router.get('/documents', (req, res) => {
  res.json({
    status: 'success',
    message: 'Admin documents management - Coming soon',
  });
});

// GET /api/v1/admin/reports - Generate reports
router.get('/reports', (req, res) => {
  res.json({
    status: 'success',
    message: 'Admin reports - Coming soon',
  });
});

// POST /api/v1/admin/backup - Create system backup
router.post('/backup', (req, res) => {
  res.json({
    status: 'success',
    message: 'System backup - Coming soon',
  });
});

// GET /api/v1/admin/logs - View system logs
router.get('/logs', (req, res) => {
  res.json({
    status: 'success',
    message: 'System logs - Coming soon',
  });
});

// POST /api/v1/admin/settings - Update system settings
router.post('/settings', (req, res) => {
  res.json({
    status: 'success',
    message: 'System settings - Coming soon',
  });
});

// Helper functions for dashboard data
async function getDashboardStats() {
  try {
    // Get total residents
    const { count: totalResidents } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'resident');

    // Get pending documents
    const { count: pendingDocuments } = await supabaseAdmin
      .from('document_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total announcements
    const { count: totalAnnouncements } = await supabaseAdmin
      .from('announcements')
      .select('*', { count: 'exact', head: true });

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo);

    return {
      totalResidents: totalResidents || 0,
      pendingDocuments: pendingDocuments || 0,
      totalAnnouncements: totalAnnouncements || 0,
      activeUsers: activeUsers || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalResidents: 0,
      pendingDocuments: 0,
      totalAnnouncements: 0,
      activeUsers: 0,
    };
  }
}

async function getRecentActivity() {
  try {
    const activities = [];

    // Get recent document requests
    const { data: recentDocuments } = await supabaseAdmin
      .from('document_requests')
      .select(`
        id,
        document_type_id,
        created_at,
        applicant:user_profiles!applicant_id(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentDocuments) {
      recentDocuments.forEach(doc => {
        activities.push({
          type: 'document_request',
          message: `New ${doc.document_type_id} request from ${doc.applicant?.first_name} ${doc.applicant?.last_name}`,
          timestamp: doc.created_at,
          id: doc.id,
        });
      });
    }

    // Get recent user registrations
    const { data: recentUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentUsers) {
      recentUsers.forEach(user => {
        activities.push({
          type: 'user_registration',
          message: `New user registered: ${user.first_name} ${user.last_name}`,
          timestamp: user.created_at,
          id: user.id,
        });
      });
    }

    // Sort by timestamp and return latest 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

async function getSystemAlerts() {
  try {
    const alerts = [];

    // Check for overdue documents
    const { count: overdueDocuments } = await supabaseAdmin
      .from('document_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing')
      .lt('estimated_completion', new Date().toISOString());

    if (overdueDocuments && overdueDocuments > 0) {
      alerts.push({
        type: 'warning',
        title: 'Overdue Documents',
        message: `${overdueDocuments} document(s) are past their estimated completion date`,
        action: 'View Documents',
        link: '/admin/documents?filter=overdue',
      });
    }

    // Check for low storage space (placeholder)
    const storageUsage = Math.random() * 100; // Replace with actual storage check
    if (storageUsage > 85) {
      alerts.push({
        type: 'error',
        title: 'Storage Space Low',
        message: `Storage is ${storageUsage.toFixed(1)}% full`,
        action: 'Manage Storage',
        link: '/admin/settings#storage',
      });
    }

    // Check for pending feedback
    const { count: pendingFeedback } = await supabaseAdmin
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingFeedback && pendingFeedback > 10) {
      alerts.push({
        type: 'info',
        title: 'Pending Feedback',
        message: `${pendingFeedback} feedback items need review`,
        action: 'Review Feedback',
        link: '/admin/feedback',
      });
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    return [];
  }
}

async function getQuickStats() {
  try {
    // Get today's statistics
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    // Documents submitted today
    const { count: documentsToday } = await supabaseAdmin
      .from('document_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd);

    // Documents completed today
    const { count: documentsCompleted } = await supabaseAdmin
      .from('document_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'released')
      .gte('updated_at', todayStart)
      .lt('updated_at', todayEnd);

    // New registrations today
    const { count: newRegistrations } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd);

    // Revenue today (placeholder - would integrate with payment system)
    const revenueToday = (documentsCompleted || 0) * 50; // Assuming average fee of 50

    return {
      documentsToday: documentsToday || 0,
      documentsCompleted: documentsCompleted || 0,
      newRegistrations: newRegistrations || 0,
      revenueToday,
    };
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return {
      documentsToday: 0,
      documentsCompleted: 0,
      newRegistrations: 0,
      revenueToday: 0,
    };
  }
}

export default router;
