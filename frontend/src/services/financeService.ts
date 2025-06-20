const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export interface BudgetItem {
  id: string;
  category: string;
  subcategory?: string;
  allocated: number;
  utilized: number;
  remaining: number;
  utilizationRate: number;
  description?: string;
  fiscalYear?: number;
  createdAt?: string;
}

export interface BudgetData {
  fiscalYear: number;
  totalBudget: number;
  totalUtilized: number;
  utilizationRate: number;
  categories: BudgetItem[];
}

export interface RevenueRecord {
  id: string;
  source: string;
  amount: number;
  collectedBy: string;
  collectedAt: string;
  receiptNumber: string;
  payerName: string;
  description?: string;
  createdAt?: string;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  subcategory?: string;
  amount: number;
  vendor: string;
  description?: string;
  expenseDate: string;
  approvedBy: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  receiptNumber: string;
  createdAt?: string;
}

export interface FinancialSummary {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  budgetUtilization: number;
  revenueGrowth: number;
  expenseGrowth: number;
  topRevenueSource: string;
  topExpenseCategory: string;
  pendingExpenses: number;
  cashFlow: {
    inflow: number;
    outflow: number;
    balance: number;
  };
}

export interface PaginatedResponse<T> {
  records: T[];
  summary: {
    totalAmount: number;
    totalRecords: number;
    averageAmount: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  filters?: any;
  generatedAt: string;
}

class FinanceService {
  private async fetchData<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${API_BASE_URL}/finance/${endpoint}`);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }

    return result.data;
  }

  private async postData<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/finance/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }

    return result.data;
  }

  // Budget Management
  async getBudget(fiscalYear: number = 2024): Promise<BudgetData> {
    return this.fetchData<BudgetData>('budget', { fiscalYear });
  }

  async createBudgetItem(budgetItem: Omit<BudgetItem, 'id' | 'utilized' | 'remaining' | 'utilizationRate' | 'createdAt'>): Promise<BudgetItem> {
    return this.postData<BudgetItem>('budget', budgetItem);
  }

  // Revenue Management
  async getRevenue(params: {
    year?: number;
    month?: number;
    source?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<RevenueRecord>> {
    return this.fetchData<PaginatedResponse<RevenueRecord>>('revenue', params);
  }

  async createRevenue(revenue: Omit<RevenueRecord, 'id' | 'collectedBy' | 'collectedAt' | 'createdAt'>): Promise<RevenueRecord> {
    return this.postData<RevenueRecord>('revenue', revenue);
  }

  // Expense Management
  async getExpenses(params: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<ExpenseRecord>> {
    return this.fetchData<PaginatedResponse<ExpenseRecord>>('expenses', params);
  }

  async createExpense(expense: Omit<ExpenseRecord, 'id' | 'approvedBy' | 'status' | 'createdAt'>): Promise<ExpenseRecord> {
    return this.postData<ExpenseRecord>('expenses', expense);
  }

  // Financial Summary
  async getSummary(period: string = 'current_month'): Promise<FinancialSummary> {
    return this.fetchData<FinancialSummary>('summary', { period });
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  calculateUtilizationRate(allocated: number, utilized: number): number {
    if (allocated === 0) return 0;
    return Math.round((utilized / allocated) * 100 * 100) / 100; // Round to 2 decimal places
  }

  getUtilizationColor(rate: number): string {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-yellow-600';
    if (rate >= 50) return 'text-blue-600';
    return 'text-green-600';
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  exportToCSV(data: any[], filename: string): void {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

const financeService = new FinanceService();
export default financeService;
