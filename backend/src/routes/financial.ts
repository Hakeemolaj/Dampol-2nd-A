import express, { Response } from 'express';
import { authenticate, restrictTo, AuthenticatedRequest } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';
import { FinancialService } from '@/services/database/financial.service';

const router = express.Router();
const financialService = new FinancialService();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/financial/summary - Get financial summary
router.get('/summary', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { start_date, end_date } = req.query;
  
  // Default to current month if no dates provided
  const startDate = start_date as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const endDate = end_date as string || new Date().toISOString().split('T')[0];

  const summary = await financialService.getFinancialSummary(startDate, endDate);

  res.json({
    status: 'success',
    data: {
      summary,
      period: {
        start_date: startDate,
        end_date: endDate,
      },
    },
  });
}));

// GET /api/v1/financial/revenue - Get revenue transactions
router.get('/revenue', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '10', status, source_id, date_from, date_to } = req.query;
  
  const filters: any = {};
  if (status) filters.status = status as string;
  if (source_id) filters.source_id = source_id as string;
  if (date_from) filters.date_from = date_from as string;
  if (date_to) filters.date_to = date_to as string;

  const result = await financialService.getRevenueTransactions(
    { page: parseInt(page as string), limit: parseInt(limit as string) },
    filters
  );

  res.json({
    status: 'success',
    data: {
      revenue_transactions: result.data,
      pagination: result.pagination,
    },
  });
}));

// GET /api/v1/financial/expenses - Get expense transactions
router.get('/expenses', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '10', status, category_id, date_from, date_to } = req.query;
  
  const filters: any = {};
  if (status) filters.status = status as string;
  if (category_id) filters.category_id = category_id as string;
  if (date_from) filters.date_from = date_from as string;
  if (date_to) filters.date_to = date_to as string;

  const result = await financialService.getExpenseTransactions(
    { page: parseInt(page as string), limit: parseInt(limit as string) },
    filters
  );

  res.json({
    status: 'success',
    data: {
      expense_transactions: result.data,
      pagination: result.pagination,
    },
  });
}));

// POST /api/v1/financial/revenue - Create revenue transaction
router.post('/revenue', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const {
    revenue_source_id,
    amount,
    transaction_date,
    payer_name,
    payer_contact,
    description,
    payment_method,
    reference_number,
    related_entity_type,
    related_entity_id,
  } = req.body;

  const revenue = await financialService.createRevenue({
    revenue_source_id,
    amount,
    transaction_date,
    payer_name,
    payer_contact,
    description,
    payment_method,
    reference_number,
    related_entity_type,
    related_entity_id,
  }, req.user.id);

  res.status(201).json({
    status: 'success',
    data: {
      revenue_transaction: revenue,
    },
  });
}));

// POST /api/v1/financial/expenses - Create expense transaction
router.post('/expenses', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const {
    budget_line_item_id,
    amount,
    transaction_date,
    vendor_name,
    vendor_contact,
    description,
    payment_method,
    reference_number,
    invoice_number,
  } = req.body;

  const expense = await financialService.createExpense({
    budget_line_item_id,
    amount,
    transaction_date,
    vendor_name,
    vendor_contact,
    description,
    payment_method,
    reference_number,
    invoice_number,
  }, req.user.id);

  res.status(201).json({
    status: 'success',
    data: {
      expense_transaction: expense,
    },
  });
}));

// PUT /api/v1/financial/expenses/:id/approve - Approve expense
router.put('/expenses/:id/approve', restrictTo('admin', 'treasurer'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const { id } = req.params;
  const expense = await financialService.approveExpense(id, req.user.id);

  res.json({
    status: 'success',
    data: {
      expense_transaction: expense,
    },
  });
}));

// PUT /api/v1/financial/expenses/:id/pay - Mark expense as paid
router.put('/expenses/:id/pay', restrictTo('admin', 'treasurer'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  const { id } = req.params;
  const expense = await financialService.markExpensePaid(id, req.user.id);

  res.json({
    status: 'success',
    data: {
      expense_transaction: expense,
    },
  });
}));

// GET /api/v1/financial/budget-categories - Get budget categories
router.get('/budget-categories', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const categories = await financialService.getBudgetCategories();

  res.json({
    status: 'success',
    data: {
      budget_categories: categories,
    },
  });
}));

// GET /api/v1/financial/revenue-sources - Get revenue sources
router.get('/revenue-sources', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const sources = await financialService.getRevenueSources();

  res.json({
    status: 'success',
    data: {
      revenue_sources: sources,
    },
  });
}));

// GET /api/v1/financial/payment-methods - Get payment methods
router.get('/payment-methods', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const methods = await financialService.getPaymentMethods();

  res.json({
    status: 'success',
    data: {
      payment_methods: methods,
    },
  });
}));

// GET /api/v1/financial/budget - Get current budget
router.get('/budget', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const budget = await financialService.getCurrentBudget();

  res.json({
    status: 'success',
    data: {
      budget,
    },
  });
}));

// GET /api/v1/financial/dashboard - Get financial dashboard data
router.get('/dashboard', restrictTo('admin', 'treasurer', 'staff'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Current month
  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  
  // Current year
  const yearStart = new Date(currentYear, 0, 1).toISOString().split('T')[0];
  const yearEnd = new Date(currentYear, 11, 31).toISOString().split('T')[0];

  const [monthlySummary, yearlySummary, budget] = await Promise.all([
    financialService.getFinancialSummary(monthStart, monthEnd),
    financialService.getFinancialSummary(yearStart, yearEnd),
    financialService.getCurrentBudget(),
  ]);

  res.json({
    status: 'success',
    data: {
      monthly_summary: monthlySummary,
      yearly_summary: yearlySummary,
      current_budget: budget,
      periods: {
        current_month: { start: monthStart, end: monthEnd },
        current_year: { start: yearStart, end: yearEnd },
      },
    },
  });
}));

export default router;
