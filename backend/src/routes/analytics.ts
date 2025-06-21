import express from 'express';
import { Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { StreamAnalyticsService } from '../services/streamAnalyticsService';

const router = express.Router();
const streamAnalyticsService = new StreamAnalyticsService();

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Mock data for analytics (in production, this would come from database queries)
const analyticsData = {
  overview: {
    totalResidents: 8542,
    totalHouseholds: 2134,
    activeRequests: 47,
    completedRequests: 1256,
    monthlyRevenue: 45230,
    pendingDocuments: 23
  },
  demographics: {
    ageGroups: [
      { range: '0-17', count: 2156, percentage: 25.2 },
      { range: '18-35', count: 2734, percentage: 32.0 },
      { range: '36-55', count: 2389, percentage: 28.0 },
      { range: '56+', count: 1263, percentage: 14.8 }
    ],
    gender: [
      { type: 'Male', count: 4321, percentage: 50.6 },
      { type: 'Female', count: 4221, percentage: 49.4 }
    ]
  },
  services: {
    popularDocuments: [
      { 
        type: 'Barangay Clearance', 
        requests: 456, 
        avgProcessingDays: 3, 
        completionRate: 98.5,
        revenue: 22800,
        satisfaction: 4.8
      },
      { 
        type: 'Certificate of Residency', 
        requests: 234, 
        avgProcessingDays: 2, 
        completionRate: 99.1,
        revenue: 7020,
        satisfaction: 4.9
      },
      { 
        type: 'Business Permit', 
        requests: 123, 
        avgProcessingDays: 7, 
        completionRate: 94.3,
        revenue: 12300,
        satisfaction: 4.2
      },
      { 
        type: 'Certificate of Indigency', 
        requests: 89, 
        avgProcessingDays: 2, 
        completionRate: 100,
        revenue: 0,
        satisfaction: 4.7
      }
    ],
    monthlyTrends: [
      { month: 'Jan', requests: 145, completed: 142, pending: 3 },
      { month: 'Feb', requests: 167, completed: 164, pending: 3 },
      { month: 'Mar', requests: 189, completed: 185, pending: 4 },
      { month: 'Apr', requests: 156, completed: 152, pending: 4 },
      { month: 'May', requests: 178, completed: 174, pending: 4 },
      { month: 'Jun', requests: 203, completed: 196, pending: 7 }
    ],
    processingTimes: [
      { step: 'Application Received', avgHours: 0.5 },
      { step: 'Document Review', avgHours: 24 },
      { step: 'Verification', avgHours: 12 },
      { step: 'Approval', avgHours: 6 },
      { step: 'Document Preparation', avgHours: 4 },
      { step: 'Ready for Pickup', avgHours: 1 }
    ],
    statusDistribution: [
      { status: 'Completed', count: 1256, percentage: 78.5 },
      { status: 'Processing', count: 234, percentage: 14.6 },
      { status: 'Pending', count: 89, percentage: 5.6 },
      { status: 'Rejected', count: 21, percentage: 1.3 }
    ]
  },
  financial: {
    monthlyRevenue: [
      { month: 'Jan', revenue: 38450 },
      { month: 'Feb', revenue: 42100 },
      { month: 'Mar', revenue: 39800 },
      { month: 'Apr', revenue: 41200 },
      { month: 'May', revenue: 43600 },
      { month: 'Jun', revenue: 45230 }
    ],
    revenueByService: [
      { service: 'Document Fees', amount: 28450, percentage: 62.9 },
      { service: 'Business Permits', amount: 12300, percentage: 27.2 },
      { service: 'Other Services', amount: 4480, percentage: 9.9 }
    ]
  },
  communication: {
    announcements: {
      totalPublished: 47,
      totalViews: 12450,
      totalEngagements: 892,
      avgViewsPerAnnouncement: 264.9,
      engagementRate: 7.2,
      monthlyTrends: [
        { month: 'Jan', published: 6, views: 1850, engagements: 134 },
        { month: 'Feb', published: 8, views: 2100, engagements: 156 },
        { month: 'Mar', published: 9, views: 2450, engagements: 189 },
        { month: 'Apr', published: 7, views: 1980, engagements: 142 },
        { month: 'May', published: 8, views: 2170, engagements: 167 },
        { month: 'Jun', revenue: 9, views: 2900, engagements: 204 }
      ],
      categoryBreakdown: [
        { category: 'Health', count: 12, views: 3200, engagements: 245, avgEngagement: 7.7 },
        { category: 'Infrastructure', count: 8, views: 2100, engagements: 156, avgEngagement: 7.4 },
        { category: 'Events', count: 10, views: 2800, engagements: 198, avgEngagement: 7.1 },
        { category: 'Emergency', count: 5, views: 1850, engagements: 142, avgEngagement: 7.7 },
        { category: 'General', count: 12, views: 2500, engagements: 151, avgEngagement: 6.0 }
      ],
      priorityDistribution: [
        { priority: 'Normal', count: 32, percentage: 68.1 },
        { priority: 'Important', count: 10, percentage: 21.3 },
        { priority: 'Urgent', count: 5, percentage: 10.6 }
      ],
      reachMetrics: {
        totalReach: 8542,
        uniqueViewers: 3421,
        repeatViewers: 1876,
        viewerRetentionRate: 54.8,
        avgTimeOnAnnouncement: 45.2
      }
    },
    feedback: {
      totalSubmissions: 234,
      averageRating: 4.3,
      responseRate: 87.2,
      resolutionTime: 2.8,
      categoryBreakdown: [
        { category: 'Service Quality', count: 89, avgRating: 4.5, resolved: 82 },
        { category: 'Infrastructure', count: 67, avgRating: 4.1, resolved: 58 },
        { category: 'Health Services', count: 45, avgRating: 4.6, resolved: 43 },
        { category: 'General Inquiry', count: 33, avgRating: 4.2, resolved: 28 }
      ],
      sentimentAnalysis: [
        { sentiment: 'Positive', count: 156, percentage: 66.7 },
        { sentiment: 'Neutral', count: 52, percentage: 22.2 },
        { sentiment: 'Negative', count: 26, percentage: 11.1 }
      ],
      monthlyTrends: [
        { month: 'Jan', submissions: 34, avgRating: 4.2, resolved: 29 },
        { month: 'Feb', submissions: 41, avgRating: 4.3, resolved: 36 },
        { month: 'Mar', submissions: 38, avgRating: 4.4, resolved: 33 },
        { month: 'Apr', submissions: 42, avgRating: 4.1, resolved: 37 },
        { month: 'May', submissions: 39, avgRating: 4.5, resolved: 35 },
        { month: 'Jun', submissions: 40, avgRating: 4.3, resolved: 34 }
      ]
    },
    engagement: {
      websiteTraffic: {
        totalVisitors: 15678,
        uniqueVisitors: 8934,
        pageViews: 45231,
        avgSessionDuration: 3.2,
        bounceRate: 32.1,
        returnVisitorRate: 43.2
      },
      socialMedia: {
        followers: 2456,
        posts: 89,
        likes: 1234,
        shares: 456,
        comments: 234,
        engagementRate: 8.9,
        reach: 12450
      },
      digitalServices: {
        onlineApplications: 1256,
        digitalAdoption: 73.4,
        userSatisfaction: 4.2,
        completionRate: 89.3,
        avgCompletionTime: 12.5
      }
    }
  },
  operational: {
    staffPerformance: {
      totalStaff: 12,
      activeStaff: 11,
      avgProductivityScore: 87.3,
      totalTasksCompleted: 1456,
      avgTaskCompletionTime: 2.4,
      staffUtilization: 89.2,
      staffBreakdown: [
        {
          department: 'Document Processing',
          staff: 4,
          tasksCompleted: 567,
          avgCompletionTime: 1.8,
          productivityScore: 92.1,
          efficiency: 94.5
        },
        {
          department: 'Resident Services',
          staff: 3,
          tasksCompleted: 423,
          avgCompletionTime: 2.1,
          productivityScore: 88.7,
          efficiency: 91.2
        },
        {
          department: 'Administrative',
          staff: 2,
          tasksCompleted: 234,
          avgCompletionTime: 3.2,
          productivityScore: 85.4,
          efficiency: 87.8
        },
        {
          department: 'Finance',
          staff: 2,
          tasksCompleted: 189,
          avgCompletionTime: 2.8,
          productivityScore: 89.3,
          efficiency: 90.1
        },
        {
          department: 'IT Support',
          staff: 1,
          tasksCompleted: 43,
          avgCompletionTime: 4.1,
          productivityScore: 78.9,
          efficiency: 82.3
        }
      ],
      monthlyTrends: [
        { month: 'Jan', tasksCompleted: 234, avgTime: 2.6, productivity: 85.2 },
        { month: 'Feb', tasksCompleted: 267, avgTime: 2.4, productivity: 87.1 },
        { month: 'Mar', tasksCompleted: 289, avgTime: 2.3, productivity: 88.9 },
        { month: 'Apr', tasksCompleted: 245, avgTime: 2.5, productivity: 86.7 },
        { month: 'May', tasksCompleted: 278, avgTime: 2.2, productivity: 89.4 },
        { month: 'Jun', tasksCompleted: 143, avgTime: 2.4, productivity: 87.3 }
      ]
    },
    serviceDelivery: {
      totalServices: 8,
      avgDeliveryTime: 3.2,
      onTimeDeliveryRate: 91.4,
      customerSatisfaction: 4.3,
      serviceEfficiency: 88.7,
      slaCompliance: 94.2,
      serviceBreakdown: [
        {
          service: 'Barangay Clearance',
          requests: 456,
          avgDeliveryTime: 2.1,
          onTimeRate: 96.3,
          satisfaction: 4.5,
          slaTarget: 3,
          efficiency: 95.2
        },
        {
          service: 'Certificate of Residency',
          requests: 234,
          avgDeliveryTime: 1.8,
          onTimeRate: 98.1,
          satisfaction: 4.6,
          slaTarget: 2,
          efficiency: 97.8
        },
        {
          service: 'Business Permit',
          requests: 123,
          avgDeliveryTime: 5.2,
          onTimeRate: 84.6,
          satisfaction: 4.1,
          slaTarget: 7,
          efficiency: 82.4
        },
        {
          service: 'Indigency Certificate',
          requests: 189,
          avgDeliveryTime: 2.8,
          onTimeRate: 93.7,
          satisfaction: 4.4,
          slaTarget: 3,
          efficiency: 91.2
        },
        {
          service: 'Building Permit',
          requests: 67,
          avgDeliveryTime: 8.4,
          onTimeRate: 78.2,
          satisfaction: 3.9,
          slaTarget: 10,
          efficiency: 79.8
        }
      ],
      monthlyPerformance: [
        { month: 'Jan', avgDelivery: 3.4, onTime: 89.2, satisfaction: 4.2 },
        { month: 'Feb', avgDelivery: 3.1, onTime: 91.8, satisfaction: 4.3 },
        { month: 'Mar', avgDelivery: 2.9, onTime: 93.4, satisfaction: 4.4 },
        { month: 'Apr', avgDelivery: 3.3, onTime: 90.1, satisfaction: 4.2 },
        { month: 'May', avgDelivery: 2.8, onTime: 94.7, satisfaction: 4.5 },
        { month: 'Jun', avgDelivery: 3.2, onTime: 91.4, satisfaction: 4.3 }
      ]
    },
    workflowEfficiency: {
      totalWorkflows: 15,
      automatedWorkflows: 8,
      automationRate: 53.3,
      avgWorkflowTime: 4.7,
      workflowOptimization: 82.6,
      bottleneckResolution: 76.8,
      workflowBreakdown: [
        {
          workflow: 'Document Request Processing',
          steps: 6,
          avgTime: 3.2,
          automationLevel: 67,
          efficiency: 89.4,
          bottlenecks: 1
        },
        {
          workflow: 'Resident Registration',
          steps: 4,
          avgTime: 2.1,
          automationLevel: 75,
          efficiency: 92.8,
          bottlenecks: 0
        },
        {
          workflow: 'Complaint Resolution',
          steps: 8,
          avgTime: 6.8,
          automationLevel: 25,
          efficiency: 71.2,
          bottlenecks: 3
        },
        {
          workflow: 'Financial Transaction',
          steps: 5,
          avgTime: 2.8,
          automationLevel: 80,
          efficiency: 94.1,
          bottlenecks: 0
        },
        {
          workflow: 'Announcement Publishing',
          steps: 3,
          avgTime: 1.2,
          automationLevel: 90,
          efficiency: 96.7,
          bottlenecks: 0
        }
      ],
      improvementAreas: [
        { area: 'Complaint Resolution', priority: 'High', impact: 'Medium', effort: 'High' },
        { area: 'Document Verification', priority: 'Medium', impact: 'High', effort: 'Medium' },
        { area: 'Payment Processing', priority: 'Low', impact: 'Low', effort: 'Low' }
      ]
    },
    administrativeMetrics: {
      meetingsHeld: 24,
      decisionsImplemented: 89,
      policyUpdates: 12,
      complianceRate: 96.8,
      auditScore: 92.4,
      governanceEfficiency: 88.9,
      departmentPerformance: [
        {
          department: 'Executive Office',
          meetings: 8,
          decisions: 34,
          implementation: 97.1,
          compliance: 98.5
        },
        {
          department: 'Treasury',
          meetings: 6,
          decisions: 23,
          implementation: 95.7,
          compliance: 96.8
        },
        {
          department: 'Secretary Office',
          meetings: 5,
          decisions: 18,
          implementation: 94.4,
          compliance: 95.2
        },
        {
          department: 'Health Services',
          meetings: 3,
          decisions: 9,
          implementation: 100.0,
          compliance: 97.8
        },
        {
          department: 'Peace & Order',
          meetings: 2,
          decisions: 5,
          implementation: 100.0,
          compliance: 98.0
        }
      ],
      kpiTracking: [
        { kpi: 'Response Time', target: 24, actual: 18.4, performance: 130.4 },
        { kpi: 'Resolution Rate', target: 85, actual: 91.2, performance: 107.3 },
        { kpi: 'Citizen Satisfaction', target: 4.0, actual: 4.3, performance: 107.5 },
        { kpi: 'Cost Efficiency', target: 75, actual: 82.1, performance: 109.5 },
        { kpi: 'Digital Adoption', target: 60, actual: 73.4, performance: 122.3 }
      ]
    },
    resourceUtilization: {
      facilityUsage: 78.4,
      equipmentEfficiency: 85.7,
      budgetUtilization: 89.3,
      staffWorkload: 87.2,
      technologyAdoption: 76.8,
      resourceOptimization: 83.1,
      facilityBreakdown: [
        { facility: 'Main Office', usage: 92.3, capacity: 50, efficiency: 89.4 },
        { facility: 'Meeting Hall', usage: 67.8, capacity: 100, efficiency: 78.2 },
        { facility: 'Health Center', usage: 84.1, capacity: 30, efficiency: 91.7 },
        { facility: 'Multi-Purpose Hall', usage: 45.6, capacity: 200, efficiency: 65.3 }
      ],
      equipmentStatus: [
        { equipment: 'Computers', total: 15, functional: 14, efficiency: 93.3 },
        { equipment: 'Printers', total: 8, functional: 7, efficiency: 87.5 },
        { equipment: 'Vehicles', total: 3, functional: 3, efficiency: 100.0 },
        { equipment: 'Communication Devices', total: 12, functional: 11, efficiency: 91.7 }
      ]
    }
  }
};

// Helper function to filter data by date range
const filterByDateRange = (data: any[], dateRange: string) => {
  // In production, this would filter based on actual dates
  // For now, return all data as it's mock data
  return data;
};

// GET /api/v1/analytics/overview
// Get overview analytics data
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last30days' } = req.query;
    
    res.json({
      success: true,
      data: analyticsData.overview,
      dateRange,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview analytics'
    });
  }
});

// GET /api/v1/analytics/demographics
// Get demographic analytics data
router.get('/demographics', async (req: Request, res: Response) => {
  try {
    const { dateRange = 'all' } = req.query;
    
    res.json({
      success: true,
      data: analyticsData.demographics,
      dateRange,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching demographics analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demographics analytics'
    });
  }
});

// GET /api/v1/analytics/services
// Get service analytics data
router.get('/services', async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last30days', documentType } = req.query;
    
    let servicesData = { ...analyticsData.services };
    
    // Filter by document type if specified
    if (documentType && typeof documentType === 'string') {
      servicesData.popularDocuments = servicesData.popularDocuments.filter(
        doc => doc.type.toLowerCase().includes(documentType.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: servicesData,
      filters: { dateRange, documentType },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching services analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services analytics'
    });
  }
});

// GET /api/v1/analytics/financial
// Get financial analytics data
router.get('/financial', async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last6months' } = req.query;

    let financialData = { ...analyticsData.financial };

    // Filter monthly revenue by date range
    if (dateRange === 'last3months') {
      financialData.monthlyRevenue = financialData.monthlyRevenue.slice(-3);
    }

    res.json({
      success: true,
      data: financialData,
      dateRange,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial analytics'
    });
  }
});

// GET /api/v1/analytics/communication
// Get communication and engagement analytics data
router.get('/communication', async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last30days', category } = req.query;

    let communicationData = { ...analyticsData.communication };

    // Filter by category if specified
    if (category && typeof category === 'string') {
      if (category === 'announcements') {
        communicationData = { announcements: communicationData.announcements } as any;
      } else if (category === 'feedback') {
        communicationData = { feedback: communicationData.feedback } as any;
      } else if (category === 'engagement') {
        communicationData = { engagement: communicationData.engagement } as any;
      }
    }

    res.json({
      success: true,
      data: communicationData,
      filters: { dateRange, category },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching communication analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication analytics'
    });
  }
});

// GET /api/v1/analytics/operational
// Get operational performance analytics data
router.get('/operational', async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last30days', category } = req.query;

    let operationalData = { ...analyticsData.operational };

    // Filter by category if specified
    if (category && typeof category === 'string') {
      if (category === 'staff') {
        operationalData = { staffPerformance: operationalData.staffPerformance } as any;
      } else if (category === 'service') {
        operationalData = { serviceDelivery: operationalData.serviceDelivery } as any;
      } else if (category === 'workflow') {
        operationalData = { workflowEfficiency: operationalData.workflowEfficiency } as any;
      } else if (category === 'admin') {
        operationalData = { administrativeMetrics: operationalData.administrativeMetrics } as any;
      } else if (category === 'resource') {
        operationalData = { resourceUtilization: operationalData.resourceUtilization } as any;
      }
    }

    res.json({
      success: true,
      data: operationalData,
      filters: { dateRange, category },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching operational analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch operational analytics'
    });
  }
});

// GET /api/v1/analytics/dashboard
// Get complete dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last30days' } = req.query;
    
    res.json({
      success: true,
      data: {
        overview: analyticsData.overview,
        demographics: analyticsData.demographics,
        services: analyticsData.services,
        financial: analyticsData.financial,
        communication: analyticsData.communication,
        operational: analyticsData.operational
      },
      dateRange,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    });
  }
});

// GET /api/v1/analytics/export
// Export analytics data in various formats
router.get('/export', async (req: Request, res: Response) => {
  try {
    const { format = 'json', category = 'all', dateRange = 'last30days' } = req.query;
    
    let exportData: any = analyticsData;

    // Filter by category if specified
    if (category !== 'all' && typeof category === 'string') {
      const categoryData = (analyticsData as any)[category];
      if (categoryData) {
        exportData = { [category]: categoryData };
      }
    }
    
    if (format === 'csv') {
      // In production, convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${dateRange}.csv`);
      res.send('CSV export functionality would be implemented here');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${dateRange}.json`);
      res.json({
        success: true,
        data: exportData,
        exportInfo: {
          format,
          category,
          dateRange,
          exportedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data'
    });
  }
});

// =============================================
// STREAMING ANALYTICS ROUTES
// =============================================

// Get analytics for multiple streams
router.get('/streams',
  authenticate,
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('category').optional().isIn(['meeting', 'emergency', 'event', 'announcement', 'education']),
    query('status').optional().isIn(['scheduled', 'live', 'ended', 'cancelled']),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        category: req.query.category as string,
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const analytics = await streamAnalyticsService.getStreamsAnalytics(filters);

      res.json({
        status: 'success',
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching streams analytics:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Get analytics for a specific stream
router.get('/streams/:id',
  authenticate,
  [param('id').isUUID()],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const analytics = await streamAnalyticsService.getStreamAnalytics(id);

      res.json({
        status: 'success',
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching stream analytics:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Get popular streams
router.get('/streams/popular',
  authenticate,
  [
    query('timeframe').optional().isIn(['day', 'week', 'month', 'all'])
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const timeframe = (req.query.timeframe as 'day' | 'week' | 'month' | 'all') || 'week';
      const popularStreams = await streamAnalyticsService.getPopularStreams(timeframe);

      res.json({
        status: 'success',
        data: popularStreams
      });
    } catch (error) {
      console.error('Error fetching popular streams:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Get real-time dashboard data
router.get('/dashboard/streaming',
  authenticate,
  async (req: express.Request, res: express.Response) => {
    try {
      // Get current live streams
      const liveStreamsAnalytics = await streamAnalyticsService.getStreamsAnalytics({
        status: 'live'
      });

      // Get today's analytics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAnalytics = await streamAnalyticsService.getStreamsAnalytics({
        startDate: today.toISOString()
      });

      // Get popular streams this week
      const popularStreams = await streamAnalyticsService.getPopularStreams('week');

      const dashboardData = {
        live_streams: liveStreamsAnalytics,
        today_summary: todayAnalytics.summary,
        popular_streams: popularStreams.slice(0, 5),
        real_time_metrics: {
          active_viewers: liveStreamsAnalytics.streams.reduce((sum, stream) =>
            sum + stream.total_viewers, 0),
          live_stream_count: liveStreamsAnalytics.streams.length,
          total_engagement: liveStreamsAnalytics.summary.average_engagement
        }
      };

      res.json({
        status: 'success',
        data: dashboardData
      });
    } catch (error) {
      console.error('Error fetching streaming dashboard data:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// GET /api/v1/analytics/export
// Export analytics data in various formats
router.get('/export', async (req: Request, res: Response) => {
  try {
    const { format = 'json', category = 'all', dateRange = 'last30days' } = req.query;

    let data: any = {};

    // Get data based on category
    switch (category) {
      case 'demographics':
        data = analyticsData.demographics;
        break;
      case 'services':
        data = analyticsData.services;
        break;
      case 'financial':
        data = analyticsData.financial;
        break;
      case 'communication':
        data = analyticsData.communication;
        break;
      case 'operational':
        data = analyticsData.operational;
        break;
      default:
        data = analyticsData;
    }

    if (format === 'csv') {
      // Convert data to CSV format
      const csvData = convertToCSV(data, category as string);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="barangay-analytics-${category}-${dateRange}.csv"`);
      res.send(csvData);
    } else if (format === 'pdf') {
      // Generate PDF report
      const pdfBuffer = await generatePDFReport(data, category as string, dateRange as string);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="barangay-report-${category}-${dateRange}.pdf"`);
      res.send(pdfBuffer);
    } else {
      // Default JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="barangay-analytics-${category}-${dateRange}.json"`);
      res.json({
        success: true,
        data,
        metadata: {
          category,
          dateRange,
          exportedAt: new Date().toISOString(),
          format: 'json'
        }
      });
    }
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data'
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data: any, category: string): string {
  let csvContent = '';

  switch (category) {
    case 'demographics':
      csvContent = 'Age Group,Count,Percentage\n';
      data.ageGroups?.forEach((group: any) => {
        csvContent += `${group.range},${group.count},${group.percentage}\n`;
      });
      csvContent += '\nGender,Count,Percentage\n';
      data.gender?.forEach((g: any) => {
        csvContent += `${g.type},${g.count},${g.percentage}\n`;
      });
      break;

    case 'services':
      csvContent = 'Document Type,Count,Percentage\n';
      data.popularDocuments?.forEach((doc: any) => {
        csvContent += `${doc.type},${doc.count},${doc.percentage}\n`;
      });
      break;

    case 'financial':
      csvContent = 'Month,Revenue,Expenses\n';
      data.monthlyRevenue?.forEach((month: any) => {
        csvContent += `${month.month},${month.revenue},${month.expenses}\n`;
      });
      break;

    default:
      csvContent = 'Category,Value\n';
      csvContent += `Total Residents,${data.overview?.totalResidents || 0}\n`;
      csvContent += `Total Households,${data.overview?.totalHouseholds || 0}\n`;
      csvContent += `Active Requests,${data.overview?.activeRequests || 0}\n`;
      csvContent += `Monthly Revenue,${data.overview?.monthlyRevenue || 0}\n`;
  }

  return csvContent;
}

// Helper function to generate PDF report (placeholder)
async function generatePDFReport(data: any, category: string, dateRange: string): Promise<Buffer> {
  // This would use a PDF generation library like puppeteer or jsPDF
  // For now, return a simple text-based PDF placeholder
  const reportContent = `
    BARANGAY DAMPOL 2ND A
    ${category.toUpperCase()} REPORT

    Date Range: ${dateRange}
    Generated: ${new Date().toLocaleDateString()}

    ${JSON.stringify(data, null, 2)}
  `;

  // In a real implementation, you would use a proper PDF library
  return Buffer.from(reportContent, 'utf-8');
}

export default router;
