import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, restrictTo, AuthenticatedRequest } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';
import { reportSchedulingService } from '@/services/reportSchedulingService';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// GET /api/v1/reports/scheduled - Get all scheduled reports
router.get('/scheduled', 
  restrictTo('admin', 'staff'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const reports = await reportSchedulingService.getScheduledReports();
    
    res.json({
      status: 'success',
      data: {
        reports,
      },
    });
  })
);

// POST /api/v1/reports/scheduled - Create new scheduled report
router.post('/scheduled',
  restrictTo('admin', 'staff'),
  [
    body('name').notEmpty().withMessage('Report name is required'),
    body('report_type').isIn(['demographics', 'financial', 'services', 'operational', 'comprehensive']),
    body('format').isIn(['pdf', 'csv', 'excel', 'json']),
    body('frequency').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    body('schedule_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
    body('recipients').isArray().withMessage('Recipients must be an array'),
    body('recipients.*').isEmail().withMessage('All recipients must be valid email addresses'),
  ],
  handleValidationErrors,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    const {
      name,
      description,
      report_type,
      format,
      frequency,
      schedule_time,
      schedule_day,
      schedule_weekday,
      recipients,
      filters,
      is_active = true,
    } = req.body;

    const report = await reportSchedulingService.createScheduledReport({
      name,
      description,
      report_type,
      format,
      frequency,
      schedule_time,
      schedule_day,
      schedule_weekday,
      recipients,
      filters,
      is_active,
      created_by: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        report,
      },
    });
  })
);

// GET /api/v1/reports/scheduled/:id - Get specific scheduled report
router.get('/scheduled/:id',
  restrictTo('admin', 'staff'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const report = await reportSchedulingService.getScheduledReportById(id);

    res.json({
      status: 'success',
      data: {
        report,
      },
    });
  })
);

// PUT /api/v1/reports/scheduled/:id - Update scheduled report
router.put('/scheduled/:id',
  restrictTo('admin', 'staff'),
  [
    body('name').optional().notEmpty(),
    body('report_type').optional().isIn(['demographics', 'financial', 'services', 'operational', 'comprehensive']),
    body('format').optional().isIn(['pdf', 'csv', 'excel', 'json']),
    body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    body('schedule_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('recipients').optional().isArray(),
    body('recipients.*').optional().isEmail(),
  ],
  handleValidationErrors,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const report = await reportSchedulingService.updateScheduledReport(id, updates);

    res.json({
      status: 'success',
      data: {
        report,
      },
    });
  })
);

// DELETE /api/v1/reports/scheduled/:id - Delete scheduled report
router.delete('/scheduled/:id',
  restrictTo('admin', 'staff'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await reportSchedulingService.deleteScheduledReport(id);

    res.json({
      status: 'success',
      message: 'Scheduled report deleted successfully',
    });
  })
);

// POST /api/v1/reports/scheduled/:id/execute - Execute scheduled report immediately
router.post('/scheduled/:id/execute',
  restrictTo('admin', 'staff'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const execution = await reportSchedulingService.executeReport(id);

    res.json({
      status: 'success',
      data: {
        execution,
      },
    });
  })
);

// GET /api/v1/reports/generate - Generate report on-demand
router.get('/generate',
  restrictTo('admin', 'staff'),
  [
    query('type').isIn(['demographics', 'financial', 'services', 'operational', 'comprehensive']),
    query('format').isIn(['pdf', 'csv', 'excel', 'json']),
    query('dateRange').optional().isString(),
  ],
  handleValidationErrors,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { type, format, dateRange = 'last30days' } = req.query;

    // This would generate the report immediately
    // For now, return a placeholder response
    const reportData = {
      type,
      format,
      dateRange,
      generatedAt: new Date().toISOString(),
      downloadUrl: `/api/v1/analytics/export?category=${type}&format=${format}&dateRange=${dateRange}`,
    };

    res.json({
      status: 'success',
      data: {
        report: reportData,
      },
    });
  })
);

// GET /api/v1/reports/templates - Get available report templates
router.get('/templates',
  restrictTo('admin', 'staff'),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const templates = [
      {
        id: 'demographics',
        name: 'Demographics Report',
        description: 'Population statistics, age distribution, and demographic insights',
        fields: ['total_population', 'age_groups', 'gender_distribution', 'civil_status'],
        formats: ['pdf', 'csv', 'excel'],
      },
      {
        id: 'financial',
        name: 'Financial Report',
        description: 'Revenue, expenses, budget utilization, and financial health',
        fields: ['revenue_summary', 'expense_breakdown', 'budget_analysis', 'cash_flow'],
        formats: ['pdf', 'csv', 'excel'],
      },
      {
        id: 'services',
        name: 'Services Report',
        description: 'Document requests, processing times, and service efficiency',
        fields: ['request_volume', 'processing_times', 'completion_rates', 'popular_services'],
        formats: ['pdf', 'csv', 'excel'],
      },
      {
        id: 'operational',
        name: 'Operational Report',
        description: 'Staff productivity, workflow efficiency, and operational metrics',
        fields: ['staff_performance', 'workflow_metrics', 'efficiency_indicators'],
        formats: ['pdf', 'csv', 'excel'],
      },
      {
        id: 'comprehensive',
        name: 'Comprehensive Report',
        description: 'Complete overview including all categories',
        fields: ['overview', 'demographics', 'financial', 'services', 'operational'],
        formats: ['pdf', 'excel'],
      },
    ];

    res.json({
      status: 'success',
      data: {
        templates,
      },
    });
  })
);

// GET /api/v1/reports/executions - Get report execution history
router.get('/executions',
  restrictTo('admin', 'staff'),
  [
    query('scheduled_report_id').optional().isUUID(),
    query('status').optional().isIn(['pending', 'running', 'completed', 'failed']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  handleValidationErrors,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    // This would fetch execution history from the database
    // For now, return a placeholder response
    const executions = [
      {
        id: '1',
        scheduled_report_id: 'report-1',
        execution_date: new Date().toISOString(),
        status: 'completed',
        file_path: '/reports/demographics-report.pdf',
        file_size: 1024000,
        execution_time_ms: 5000,
      },
    ];

    res.json({
      status: 'success',
      data: {
        executions,
        pagination: {
          limit: 10,
          offset: 0,
          total: executions.length,
        },
      },
    });
  })
);

export default router;
