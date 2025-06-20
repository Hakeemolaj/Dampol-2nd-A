const express = require('express');
const router = express.Router();

// Mock data for development
const mockBudgetData = {
  fiscalYear: 2024,
  totalBudget: 2500000,
  totalUtilized: 1875000,
  utilizationRate: 75,
  categories: [
    {
      id: '1',
      category: 'Personnel Services',
      subcategory: 'Salaries and Wages',
      allocated: 800000,
      utilized: 650000,
      remaining: 150000,
      utilizationRate: 81.25,
      description: 'Salaries for barangay officials and staff'
    },
    {
      id: '2',
      category: 'Maintenance and Operations',
      subcategory: 'Office Supplies',
      allocated: 150000,
      utilized: 125000,
      remaining: 25000,
      utilizationRate: 83.33,
      description: 'Office supplies and materials'
    },
    {
      id: '3',
      category: 'Capital Outlay',
      subcategory: 'Infrastructure',
      allocated: 600000,
      utilized: 450000,
      remaining: 150000,
      utilizationRate: 75,
      description: 'Road improvements and facilities'
    },
    {
      id: '4',
      category: 'Social Services',
      subcategory: 'Health Programs',
      allocated: 200000,
      utilized: 180000,
      remaining: 20000,
      utilizationRate: 90,
      description: 'Community health and wellness programs'
    },
    {
      id: '5',
      category: 'General Services',
      subcategory: 'Utilities',
      allocated: 120000,
      utilized: 95000,
      remaining: 25000,
      utilizationRate: 79.17,
      description: 'Electricity, water, and telecommunications'
    }
  ]
};

const mockRevenueData = [
  {
    id: '1',
    source: 'Document Fees',
    amount: 28450,
    collectedBy: 'Maria Santos',
    collectedAt: '2024-01-15T10:30:00Z',
    receiptNumber: 'OR-2024-001',
    payerName: 'Juan Dela Cruz',
    description: 'Barangay clearance and certificates'
  },
  {
    id: '2',
    source: 'Business Permits',
    amount: 12300,
    collectedBy: 'Jose Garcia',
    collectedAt: '2024-01-14T14:15:00Z',
    receiptNumber: 'OR-2024-002',
    payerName: 'ABC Sari-sari Store',
    description: 'Business permit renewal'
  },
  {
    id: '3',
    source: 'Barangay ID',
    amount: 1250,
    collectedBy: 'Ana Reyes',
    collectedAt: '2024-01-13T09:45:00Z',
    receiptNumber: 'OR-2024-003',
    payerName: 'Multiple Applicants',
    description: 'Barangay ID applications (50 pcs)'
  }
];

const mockExpenseData = [
  {
    id: '1',
    category: 'Office Supplies',
    subcategory: 'Stationery',
    amount: 5500,
    vendor: 'ABC Office Supplies',
    description: 'Bond paper, pens, folders',
    expenseDate: '2024-01-10T00:00:00Z',
    approvedBy: 'Barangay Captain',
    status: 'Paid',
    receiptNumber: 'INV-2024-001'
  },
  {
    id: '2',
    category: 'Utilities',
    subcategory: 'Electricity',
    amount: 8750,
    vendor: 'MERALCO',
    description: 'Monthly electricity bill',
    expenseDate: '2024-01-05T00:00:00Z',
    approvedBy: 'Barangay Treasurer',
    status: 'Paid',
    receiptNumber: 'BILL-2024-001'
  },
  {
    id: '3',
    category: 'Infrastructure',
    subcategory: 'Road Maintenance',
    amount: 45000,
    vendor: 'XYZ Construction',
    description: 'Pothole repair on Main Street',
    expenseDate: '2024-01-08T00:00:00Z',
    approvedBy: 'Barangay Captain',
    status: 'Pending',
    receiptNumber: 'PO-2024-001'
  }
];

// GET /api/v1/finance/budget
router.get('/budget', async (req, res) => {
  try {
    const { fiscalYear = 2024 } = req.query;
    
    res.json({
      success: true,
      data: mockBudgetData,
      fiscalYear: Number(fiscalYear),
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching budget data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget data'
    });
  }
});

// POST /api/v1/finance/budget
router.post('/budget', async (req, res) => {
  try {
    const { category, subcategory, allocated, description, fiscalYear = 2024 } = req.body;
    
    if (!category || !allocated) {
      return res.status(400).json({
        success: false,
        message: 'Category and allocated amount are required'
      });
    }
    
    const newBudgetItem = {
      id: Date.now().toString(),
      category,
      subcategory: subcategory || '',
      allocated: Number(allocated),
      utilized: 0,
      remaining: Number(allocated),
      utilizationRate: 0,
      description: description || '',
      fiscalYear: Number(fiscalYear),
      createdAt: new Date().toISOString()
    };
    
    return res.status(201).json({
      success: true,
      data: newBudgetItem,
      message: 'Budget item created successfully'
    });
  } catch (error) {
    console.error('Error creating budget item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create budget item'
    });
  }
});

// GET /api/v1/finance/revenue
router.get('/revenue', async (req, res) => {
  try {
    const { year, month, source, limit = 50, offset = 0 } = req.query;
    
    let filteredRevenue = [...mockRevenueData];
    
    if (source) {
      filteredRevenue = filteredRevenue.filter(record => 
        record.source.toLowerCase().includes(source.toString().toLowerCase())
      );
    }
    
    const startIndex = Number(offset);
    const endIndex = startIndex + Number(limit);
    const paginatedRevenue = filteredRevenue.slice(startIndex, endIndex);
    
    const totalAmount = filteredRevenue.reduce((sum, record) => sum + record.amount, 0);
    const totalRecords = filteredRevenue.length;
    
    res.json({
      success: true,
      data: {
        records: paginatedRevenue,
        summary: {
          totalAmount,
          totalRecords,
          averageAmount: totalRecords > 0 ? totalAmount / totalRecords : 0
        },
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: totalRecords,
          hasMore: endIndex < totalRecords
        }
      },
      filters: { year, month, source },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue data'
    });
  }
});

// POST /api/v1/finance/revenue
router.post('/revenue', async (req, res) => {
  try {
    const { source, amount, payerName, description, receiptNumber } = req.body;
    
    if (!source || !amount || !payerName) {
      return res.status(400).json({
        success: false,
        message: 'Source, amount, and payer name are required'
      });
    }
    
    const newRevenue = {
      id: Date.now().toString(),
      source,
      amount: Number(amount),
      collectedBy: 'Current User',
      collectedAt: new Date().toISOString(),
      receiptNumber: receiptNumber || `OR-${Date.now()}`,
      payerName,
      description: description || '',
      createdAt: new Date().toISOString()
    };
    
    return res.status(201).json({
      success: true,
      data: newRevenue,
      message: 'Revenue record created successfully'
    });
  } catch (error) {
    console.error('Error creating revenue record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create revenue record'
    });
  }
});

// GET /api/v1/finance/expenses
router.get('/expenses', async (req, res) => {
  try {
    const { category, status, limit = 50, offset = 0 } = req.query;
    
    let filteredExpenses = [...mockExpenseData];
    
    if (category) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.category.toLowerCase().includes(category.toString().toLowerCase())
      );
    }
    
    if (status) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.status.toLowerCase() === status.toString().toLowerCase()
      );
    }
    
    const startIndex = Number(offset);
    const endIndex = startIndex + Number(limit);
    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);
    
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalRecords = filteredExpenses.length;
    
    res.json({
      success: true,
      data: {
        records: paginatedExpenses,
        summary: {
          totalAmount,
          totalRecords,
          averageAmount: totalRecords > 0 ? totalAmount / totalRecords : 0
        },
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: totalRecords,
          hasMore: endIndex < totalRecords
        }
      },
      filters: { category, status },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching expense data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense data'
    });
  }
});

// POST /api/v1/finance/expenses
router.post('/expenses', async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      amount, 
      vendor, 
      description, 
      expenseDate,
      receiptNumber 
    } = req.body;
    
    if (!category || !amount || !vendor) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount, and vendor are required'
      });
    }
    
    const newExpense = {
      id: Date.now().toString(),
      category,
      subcategory: subcategory || '',
      amount: Number(amount),
      vendor,
      description: description || '',
      expenseDate: expenseDate || new Date().toISOString(),
      approvedBy: 'Current User',
      status: 'Pending',
      receiptNumber: receiptNumber || `EXP-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    return res.status(201).json({
      success: true,
      data: newExpense,
      message: 'Expense record created successfully'
    });
  } catch (error) {
    console.error('Error creating expense record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create expense record'
    });
  }
});

// GET /api/v1/finance/summary
router.get('/summary', async (req, res) => {
  try {
    const { period = 'current_month' } = req.query;
    
    const totalRevenue = mockRevenueData.reduce((sum, record) => sum + record.amount, 0);
    const totalExpenses = mockExpenseData.reduce((sum, expense) => sum + expense.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    
    const summary = {
      period,
      totalRevenue,
      totalExpenses,
      netIncome,
      budgetUtilization: mockBudgetData.utilizationRate,
      revenueGrowth: 12.5,
      expenseGrowth: 8.3,
      topRevenueSource: 'Document Fees',
      topExpenseCategory: 'Infrastructure',
      pendingExpenses: mockExpenseData.filter(e => e.status === 'Pending').length,
      cashFlow: {
        inflow: totalRevenue,
        outflow: totalExpenses,
        balance: netIncome
      }
    };
    
    res.json({
      success: true,
      data: summary,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial summary'
    });
  }
});

module.exports = router;
