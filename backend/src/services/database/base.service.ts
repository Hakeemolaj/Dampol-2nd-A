import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/config/supabase';
import { Database } from '@/config/database.types';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  column: string;
  ascending?: boolean;
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export abstract class BaseService {
  protected client: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.client = client || supabaseAdmin;
  }

  /**
   * Handle Supabase errors and convert them to DatabaseError
   */
  protected handleError(error: any, operation: string): never {
    console.error(`Database error in ${operation}:`, error);
    
    if (error?.code) {
      throw new DatabaseError(
        error.message || `Failed to ${operation}`,
        error.code,
        error.details
      );
    }
    
    throw new DatabaseError(`Failed to ${operation}`, 'UNKNOWN_ERROR', error);
  }

  /**
   * Calculate pagination metadata
   */
  protected calculatePagination(
    total: number,
    page: number,
    limit: number
  ): PaginationResult<any>['pagination'] {
    const totalPages = Math.ceil(total / limit);
    
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Apply filters to a query builder
   */
  protected applyFilters(query: any, filters: FilterOptions): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'string' && value.includes('%')) {
          query = query.like(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    
    return query;
  }

  /**
   * Apply sorting to a query builder
   */
  protected applySorting(query: any, sort?: SortOptions): any {
    if (sort) {
      query = query.order(sort.column, { ascending: sort.ascending ?? true });
    }
    
    return query;
  }

  /**
   * Apply pagination to a query builder
   */
  protected applyPagination(query: any, options: PaginationOptions): any {
    const { page = 1, limit = 10, offset } = options;
    
    if (offset !== undefined) {
      query = query.range(offset, offset + limit - 1);
    } else {
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);
    }
    
    return query;
  }

  /**
   * Execute a query with error handling
   */
  protected async executeQuery<T>(
    queryBuilder: any,
    operation: string
  ): Promise<T> {
    const { data, error } = await queryBuilder;
    
    if (error) {
      this.handleError(error, operation);
    }
    
    return data;
  }

  /**
   * Execute a query with count for pagination
   */
  protected async executeQueryWithCount<T>(
    queryBuilder: any,
    operation: string
  ): Promise<{ data: T[]; count: number }> {
    const { data, error, count } = await queryBuilder;
    
    if (error) {
      this.handleError(error, operation);
    }
    
    return { data: data || [], count: count || 0 };
  }

  /**
   * Generate a unique ID (UUID v4)
   */
  protected generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Get current timestamp in ISO format
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: any, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new DatabaseError(
        `Missing required fields: ${missing.join(', ')}`,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Clean data by removing undefined values
   */
  protected cleanData(data: any): any {
    const cleaned: any = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }
}
