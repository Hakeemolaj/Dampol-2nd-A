import { BaseService, PaginationOptions, PaginationResult, FilterOptions, SortOptions } from './base.service';
import { Database } from '@/config/database.types';

type IncidentReport = Database['public']['Tables']['incident_reports']['Row'];
type IncidentReportInsert = Database['public']['Tables']['incident_reports']['Insert'];
type IncidentReportUpdate = Database['public']['Tables']['incident_reports']['Update'];

export interface IncidentFilters extends FilterOptions {
  status?: string;
  incident_type?: string;
  complainant_id?: string;
  investigating_officer?: string;
  date_from?: string;
  date_to?: string;
}

export interface CreateIncidentData {
  incident_type: string;
  complainant_id?: string;
  respondent_name: string;
  respondent_address?: string;
  incident_date: string;
  incident_location?: string;
  description: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface IncidentWithDetails extends IncidentReport {
  complainant?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  investigating_officer_profile?: {
    first_name: string;
    last_name: string;
  };
}

export class IncidentsService extends BaseService {
  private readonly tableName = 'incident_reports';

  /**
   * Get incident reports with pagination and filtering
   */
  async getAll(
    options: PaginationOptions = {},
    filters: IncidentFilters = {},
    sort: SortOptions = { column: 'incident_date', ascending: false }
  ): Promise<PaginationResult<IncidentWithDetails>> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(`
          *,
          complainant:user_profiles!complainant_id(first_name, last_name, phone),
          investigating_officer_profile:user_profiles!investigating_officer(first_name, last_name)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.incident_type) {
        query = query.eq('incident_type', filters.incident_type);
      }
      
      if (filters.complainant_id) {
        query = query.eq('complainant_id', filters.complainant_id);
      }
      
      if (filters.investigating_officer) {
        query = query.eq('investigating_officer', filters.investigating_officer);
      }
      
      if (filters.date_from) {
        query = query.gte('incident_date', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('incident_date', filters.date_to);
      }

      // Apply sorting
      query = this.applySorting(query, sort);

      // Apply pagination
      query = this.applyPagination(query, options);

      const { data, count } = await this.executeQueryWithCount<IncidentWithDetails>(
        query,
        'get incident reports'
      );

      const { page = 1, limit = 10 } = options;
      const pagination = this.calculatePagination(count, page, limit);

      return { data, pagination };
    } catch (error) {
      this.handleError(error, 'get incident reports');
    }
  }

  /**
   * Get incident report by ID
   */
  async getById(id: string): Promise<IncidentWithDetails | null> {
    try {
      const query = this.client
        .from(this.tableName)
        .select(`
          *,
          complainant:user_profiles!complainant_id(first_name, last_name, phone, email),
          investigating_officer_profile:user_profiles!investigating_officer(first_name, last_name)
        `)
        .eq('id', id)
        .single();

      const data = await this.executeQuery<IncidentWithDetails>(query, 'get incident by ID');
      return data;
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get incident by ID');
    }
  }

  /**
   * Create new incident report
   */
  async create(data: CreateIncidentData): Promise<IncidentReport> {
    try {
      this.validateRequired(data, ['incident_type', 'respondent_name', 'incident_date', 'description']);

      // Generate blotter number
      const blotterNumber = await this.generateBlotterNumber();

      const insertData: IncidentReportInsert = {
        id: this.generateId(),
        blotter_number: blotterNumber,
        incident_type: data.incident_type,
        complainant_id: data.complainant_id || null,
        respondent_name: data.respondent_name,
        respondent_address: data.respondent_address || null,
        incident_date: data.incident_date,
        incident_location: data.incident_location || null,
        description: data.description,
        status: 'Open',
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<IncidentReport>(query, 'create incident report');
    } catch (error) {
      this.handleError(error, 'create incident report');
    }
  }

  /**
   * Get incident report by blotter number
   */
  async getByBlotterNumber(blotterNumber: string): Promise<IncidentWithDetails | null> {
    try {
      const query = this.client
        .from(this.tableName)
        .select(`
          *,
          complainant:user_profiles!complainant_id(first_name, last_name, phone, email),
          investigating_officer_profile:user_profiles!investigating_officer(first_name, last_name)
        `)
        .eq('blotter_number', blotterNumber)
        .single();

      const data = await this.executeQuery<IncidentWithDetails>(query, 'get incident by blotter number');
      return data;
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get incident by blotter number');
    }
  }

  /**
   * Update incident report
   */
  async update(id: string, data: Partial<IncidentReportUpdate>): Promise<IncidentReport> {
    try {
      const updateData: IncidentReportUpdate = {
        ...this.cleanData(data),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<IncidentReport>(query, 'update incident report');
    } catch (error) {
      this.handleError(error, 'update incident report');
    }
  }

  /**
   * Update incident status
   */
  async updateStatus(
    id: string,
    status: string,
    investigatingOfficer?: string,
    resolution?: string
  ): Promise<IncidentReport> {
    try {
      const updateData: IncidentReportUpdate = {
        status,
        investigating_officer: investigatingOfficer,
        resolution,
        updated_at: this.getCurrentTimestamp(),
      };

      // Set resolved_at timestamp for resolved statuses
      if (['Resolved', 'Closed'].includes(status)) {
        updateData.resolved_at = this.getCurrentTimestamp();
      }

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<IncidentReport>(query, 'update incident status');
    } catch (error) {
      this.handleError(error, 'update incident status');
    }
  }

  /**
   * Get incident statistics
   */
  async getStats(): Promise<{
    total: number;
    open: number;
    under_investigation: number;
    resolved: number;
    closed: number;
    by_type: Record<string, number>;
  }> {
    try {
      const [total, open, underInvestigation, resolved, closed, byType] = await Promise.all([
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'Open'),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'Under Investigation'),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'Resolved'),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'Closed'),
        this.client.from(this.tableName).select('incident_type'),
      ]);

      // Count by incident type
      const typeStats: Record<string, number> = {};
      if (byType.data) {
        byType.data.forEach((incident: any) => {
          const type = incident.incident_type;
          typeStats[type] = (typeStats[type] || 0) + 1;
        });
      }

      return {
        total: total.count || 0,
        open: open.count || 0,
        under_investigation: underInvestigation.count || 0,
        resolved: resolved.count || 0,
        closed: closed.count || 0,
        by_type: typeStats,
      };
    } catch (error) {
      this.handleError(error, 'get incident stats');
    }
  }

  /**
   * Get incident types
   */
  async getIncidentTypes(): Promise<string[]> {
    try {
      const query = this.client
        .from(this.tableName)
        .select('incident_type')
        .order('incident_type');

      const data = await this.executeQuery<{ incident_type: string }[]>(query, 'get incident types');
      
      // Get unique incident types
      const uniqueTypes = [...new Set(data.map(item => item.incident_type))];
      return uniqueTypes;
    } catch (error) {
      this.handleError(error, 'get incident types');
    }
  }

  /**
   * Generate blotter number
   */
  private async generateBlotterNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Get the latest blotter number for this month
      const query = this.client
        .from(this.tableName)
        .select('blotter_number')
        .like('blotter_number', `BLT-${year}${month}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      const data = await this.executeQuery<{ blotter_number: string }[]>(query, 'get latest blotter number');
      
      let nextNumber = 1;
      if (data.length > 0) {
        const lastNumber = data[0].blotter_number;
        const match = lastNumber.match(/BLT-(\d{4})(\d{2})(\d{4})/);
        if (match) {
          nextNumber = parseInt(match[3]) + 1;
        }
      }

      return `BLT-${year}${month}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      this.handleError(error, 'generate blotter number');
    }
  }
}
