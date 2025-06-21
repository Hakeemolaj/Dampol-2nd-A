import { BaseService, PaginationOptions, PaginationResult, FilterOptions, SortOptions } from './base.service';
import { Database } from '@/config/database.types';

type RevenueTransaction = Database['public']['Tables']['revenue_transactions']['Row'];
type ExpenseTransaction = Database['public']['Tables']['expense_transactions']['Row'];
type AnnualBudget = Database['public']['Tables']['annual_budgets']['Row'];
type BudgetLineItem = Database['public']['Tables']['budget_line_items']['Row'];

export interface FinancialFilters extends FilterOptions {
  transaction_type?: 'revenue' | 'expense';
  status?: string;
  date_from?: string;
  date_to?: string;
  category_id?: string;
  source_id?: string;
}

export interface CreateRevenueData {
  revenue_source_id: string;
  amount: number;
  transaction_date: string;
  payer_name?: string;
  payer_contact?: string;
  description?: string;
  payment_method: string;
  reference_number?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface CreateExpenseData {
  budget_line_item_id?: string;
  amount: number;
  transaction_date: string;
  vendor_name?: string;
  vendor_contact?: string;
  description: string;
  payment_method: string;
  reference_number?: string;
  invoice_number?: string;
}

export interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  revenue_by_source: Record<string, number>;
  expenses_by_category: Record<string, number>;
}

export class FinancialService extends BaseService {
  /**
   * Get financial summary for a period
   */
  async getFinancialSummary(startDate: string, endDate: string): Promise<FinancialSummary> {
    try {
      const { data } = await this.client
        .rpc('get_financial_summary', {
          p_start_date: startDate,
          p_end_date: endDate,
        });

      if (!data || data.length === 0) {
        return {
          total_revenue: 0,
          total_expenses: 0,
          net_income: 0,
          revenue_by_source: {},
          expenses_by_category: {},
        };
      }

      return data[0];
    } catch (error) {
      this.handleError(error, 'get financial summary');
    }
  }

  /**
   * Get revenue transactions
   */
  async getRevenueTransactions(
    options: PaginationOptions = {},
    filters: FinancialFilters = {},
    sort: SortOptions = { column: 'transaction_date', ascending: false }
  ): Promise<PaginationResult<any>> {
    try {
      let query = this.client
        .from('revenue_transactions')
        .select(`
          *,
          revenue_source:revenue_sources(*),
          collected_by_profile:user_profiles!collected_by(first_name, last_name)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.source_id) {
        query = query.eq('revenue_source_id', filters.source_id);
      }
      
      if (filters.date_from) {
        query = query.gte('transaction_date', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('transaction_date', filters.date_to);
      }

      // Apply sorting
      query = this.applySorting(query, sort);

      // Apply pagination
      query = this.applyPagination(query, options);

      const { data, count } = await this.executeQueryWithCount(query, 'get revenue transactions');

      const { page = 1, limit = 10 } = options;
      const pagination = this.calculatePagination(count, page, limit);

      return { data, pagination };
    } catch (error) {
      this.handleError(error, 'get revenue transactions');
    }
  }

  /**
   * Get expense transactions
   */
  async getExpenseTransactions(
    options: PaginationOptions = {},
    filters: FinancialFilters = {},
    sort: SortOptions = { column: 'transaction_date', ascending: false }
  ): Promise<PaginationResult<any>> {
    try {
      let query = this.client
        .from('expense_transactions')
        .select(`
          *,
          budget_line_item:budget_line_items(*),
          created_by_profile:user_profiles!created_by(first_name, last_name),
          approved_by_profile:user_profiles!approved_by(first_name, last_name)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category_id) {
        query = query.eq('budget_line_items.category_id', filters.category_id);
      }
      
      if (filters.date_from) {
        query = query.gte('transaction_date', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('transaction_date', filters.date_to);
      }

      // Apply sorting
      query = this.applySorting(query, sort);

      // Apply pagination
      query = this.applyPagination(query, options);

      const { data, count } = await this.executeQueryWithCount(query, 'get expense transactions');

      const { page = 1, limit = 10 } = options;
      const pagination = this.calculatePagination(count, page, limit);

      return { data, pagination };
    } catch (error) {
      this.handleError(error, 'get expense transactions');
    }
  }

  /**
   * Create revenue transaction
   */
  async createRevenue(data: CreateRevenueData, collectedBy: string): Promise<RevenueTransaction> {
    try {
      this.validateRequired(data, ['revenue_source_id', 'amount', 'transaction_date', 'payment_method']);

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber('REV');

      const insertData = {
        id: this.generateId(),
        transaction_number: transactionNumber,
        revenue_source_id: data.revenue_source_id,
        amount: data.amount,
        transaction_date: data.transaction_date,
        payer_name: data.payer_name,
        payer_contact: data.payer_contact,
        description: data.description,
        payment_method: data.payment_method,
        reference_number: data.reference_number,
        related_entity_type: data.related_entity_type,
        related_entity_id: data.related_entity_id,
        collected_by: collectedBy,
        status: 'Completed',
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from('revenue_transactions')
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<RevenueTransaction>(query, 'create revenue transaction');
    } catch (error) {
      this.handleError(error, 'create revenue transaction');
    }
  }

  /**
   * Create expense transaction
   */
  async createExpense(data: CreateExpenseData, createdBy: string): Promise<ExpenseTransaction> {
    try {
      this.validateRequired(data, ['amount', 'transaction_date', 'description', 'payment_method']);

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber('EXP');

      const insertData = {
        id: this.generateId(),
        transaction_number: transactionNumber,
        budget_line_item_id: data.budget_line_item_id,
        amount: data.amount,
        transaction_date: data.transaction_date,
        vendor_name: data.vendor_name,
        vendor_contact: data.vendor_contact,
        description: data.description,
        payment_method: data.payment_method,
        reference_number: data.reference_number,
        invoice_number: data.invoice_number,
        status: 'Pending',
        created_by: createdBy,
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from('expense_transactions')
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<ExpenseTransaction>(query, 'create expense transaction');
    } catch (error) {
      this.handleError(error, 'create expense transaction');
    }
  }

  /**
   * Approve expense transaction
   */
  async approveExpense(id: string, approvedBy: string): Promise<ExpenseTransaction> {
    try {
      const updateData = {
        status: 'Approved',
        approved_by: approvedBy,
        approved_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from('expense_transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<ExpenseTransaction>(query, 'approve expense');
    } catch (error) {
      this.handleError(error, 'approve expense');
    }
  }

  /**
   * Mark expense as paid
   */
  async markExpensePaid(id: string, paidBy: string): Promise<ExpenseTransaction> {
    try {
      const updateData = {
        status: 'Paid',
        paid_by: paidBy,
        paid_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from('expense_transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<ExpenseTransaction>(query, 'mark expense paid');
    } catch (error) {
      this.handleError(error, 'mark expense paid');
    }
  }

  /**
   * Get budget categories
   */
  async getBudgetCategories(): Promise<any[]> {
    try {
      const query = this.client
        .from('budget_categories')
        .select('*')
        .eq('is_active', true)
        .order('category_name');

      return await this.executeQuery(query, 'get budget categories');
    } catch (error) {
      this.handleError(error, 'get budget categories');
    }
  }

  /**
   * Get revenue sources
   */
  async getRevenueSources(): Promise<any[]> {
    try {
      const query = this.client
        .from('revenue_sources')
        .select('*')
        .eq('is_active', true)
        .order('source_name');

      return await this.executeQuery(query, 'get revenue sources');
    } catch (error) {
      this.handleError(error, 'get revenue sources');
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<any[]> {
    try {
      const query = this.client
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('method_name');

      return await this.executeQuery(query, 'get payment methods');
    } catch (error) {
      this.handleError(error, 'get payment methods');
    }
  }

  /**
   * Get current fiscal year budget
   */
  async getCurrentBudget(): Promise<any> {
    try {
      const currentYear = new Date().getFullYear();
      
      const query = this.client
        .from('annual_budgets')
        .select(`
          *,
          budget_line_items:budget_line_items(
            *,
            category:budget_categories(*)
          )
        `)
        .eq('fiscal_year', currentYear)
        .single();

      return await this.executeQuery(query, 'get current budget');
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // No budget found for current year
      }
      this.handleError(error, 'get current budget');
    }
  }

  /**
   * Generate transaction number
   */
  private async generateTransactionNumber(prefix: string): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Get the latest transaction number for this month
      const tableName = prefix === 'REV' ? 'revenue_transactions' : 'expense_transactions';
      
      const query = this.client
        .from(tableName)
        .select('transaction_number')
        .like('transaction_number', `${prefix}-${year}${month}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      const data = await this.executeQuery<{ transaction_number: string }[]>(query, 'get latest transaction number');
      
      let nextNumber = 1;
      if (data.length > 0) {
        const lastNumber = data[0].transaction_number;
        const match = lastNumber.match(/(\w+)-(\d{4})(\d{2})(\d{4})/);
        if (match) {
          nextNumber = parseInt(match[4]) + 1;
        }
      }

      return `${prefix}-${year}${month}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      this.handleError(error, 'generate transaction number');
    }
  }
}
