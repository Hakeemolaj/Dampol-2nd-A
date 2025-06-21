import { BaseService, PaginationOptions, PaginationResult, FilterOptions, SortOptions } from './base.service';
import { Database } from '@/config/database.types';

type Resident = Database['public']['Tables']['residents']['Row'];
type ResidentInsert = Database['public']['Tables']['residents']['Insert'];
type ResidentUpdate = Database['public']['Tables']['residents']['Update'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export interface ResidentFilters extends FilterOptions {
  household_id?: string;
  is_registered_voter?: boolean;
  is_pwd?: boolean;
  is_senior_citizen?: boolean;
  is_4ps_beneficiary?: boolean;
  status?: string;
  search?: string;
}

export interface CreateResidentData {
  user_id?: string;
  resident_id: string;
  household_id?: string;
  relationship_to_head?: string;
  is_registered_voter?: boolean;
  voter_id?: string;
  is_pwd?: boolean;
  pwd_id?: string;
  is_senior_citizen?: boolean;
  is_4ps_beneficiary?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status?: 'Active' | 'Inactive' | 'Deceased' | 'Moved';
}

export interface UpdateResidentData {
  household_id?: string;
  relationship_to_head?: string;
  is_registered_voter?: boolean;
  voter_id?: string;
  is_pwd?: boolean;
  pwd_id?: string;
  is_senior_citizen?: boolean;
  is_4ps_beneficiary?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status?: 'Active' | 'Inactive' | 'Deceased' | 'Moved';
}

export interface ResidentWithProfile extends Resident {
  user_profile?: UserProfile;
}

export interface CompleteResidentProfile {
  basic_info: any;
  health_info: any;
  education: any[];
  employment: any[];
  emergency_contacts: any[];
  family_relationships: any[];
  assets: any[];
  social_services: any[];
  documents: any[];
  preferences: any;
}

export class ResidentsService extends BaseService {
  private readonly tableName = 'residents';

  /**
   * Get all residents with pagination and filtering
   */
  async getAll(
    options: PaginationOptions = {},
    filters: ResidentFilters = {},
    sort: SortOptions = { column: 'created_at', ascending: false }
  ): Promise<PaginationResult<ResidentWithProfile>> {
    try {
      // Build base query with user profile join
      let query = this.client
        .from(this.tableName)
        .select(`
          *,
          user_profile:user_profiles(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.household_id) {
        query = query.eq('household_id', filters.household_id);
      }
      
      if (filters.is_registered_voter !== undefined) {
        query = query.eq('is_registered_voter', filters.is_registered_voter);
      }
      
      if (filters.is_pwd !== undefined) {
        query = query.eq('is_pwd', filters.is_pwd);
      }
      
      if (filters.is_senior_citizen !== undefined) {
        query = query.eq('is_senior_citizen', filters.is_senior_citizen);
      }
      
      if (filters.is_4ps_beneficiary !== undefined) {
        query = query.eq('is_4ps_beneficiary', filters.is_4ps_beneficiary);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.or(`resident_id.ilike.%${filters.search}%,emergency_contact_name.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = this.applySorting(query, sort);

      // Apply pagination
      query = this.applyPagination(query, options);

      const { data, count } = await this.executeQueryWithCount<ResidentWithProfile>(
        query,
        'get residents'
      );

      const { page = 1, limit = 10 } = options;
      const pagination = this.calculatePagination(count, page, limit);

      return { data, pagination };
    } catch (error) {
      this.handleError(error, 'get residents');
    }
  }

  /**
   * Get resident by ID
   */
  async getById(id: string): Promise<ResidentWithProfile | null> {
    try {
      const query = this.client
        .from(this.tableName)
        .select(`
          *,
          user_profile:user_profiles(*)
        `)
        .eq('id', id)
        .single();

      const data = await this.executeQuery<ResidentWithProfile>(query, 'get resident by ID');
      return data;
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get resident by ID');
    }
  }

  /**
   * Get resident by user ID
   */
  async getByUserId(userId: string): Promise<ResidentWithProfile | null> {
    try {
      const query = this.client
        .from(this.tableName)
        .select(`
          *,
          user_profile:user_profiles(*)
        `)
        .eq('user_id', userId)
        .single();

      const data = await this.executeQuery<ResidentWithProfile>(query, 'get resident by user ID');
      return data;
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get resident by user ID');
    }
  }

  /**
   * Get resident by resident ID
   */
  async getByResidentId(residentId: string): Promise<ResidentWithProfile | null> {
    try {
      const query = this.client
        .from(this.tableName)
        .select(`
          *,
          user_profile:user_profiles(*)
        `)
        .eq('resident_id', residentId)
        .single();

      const data = await this.executeQuery<ResidentWithProfile>(query, 'get resident by resident ID');
      return data;
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get resident by resident ID');
    }
  }

  /**
   * Create new resident
   */
  async create(data: CreateResidentData): Promise<Resident> {
    try {
      this.validateRequired(data, ['resident_id']);

      const insertData: ResidentInsert = {
        ...this.cleanData(data),
        id: this.generateId(),
        status: data.status || 'Active',
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<Resident>(query, 'create resident');
    } catch (error) {
      this.handleError(error, 'create resident');
    }
  }

  /**
   * Update resident
   */
  async update(id: string, data: UpdateResidentData): Promise<Resident> {
    try {
      const updateData: ResidentUpdate = {
        ...this.cleanData(data),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<Resident>(query, 'update resident');
    } catch (error) {
      this.handleError(error, 'update resident');
    }
  }

  /**
   * Delete resident
   */
  async delete(id: string): Promise<void> {
    try {
      const query = this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      await this.executeQuery(query, 'delete resident');
    } catch (error) {
      this.handleError(error, 'delete resident');
    }
  }

  /**
   * Get residents by household
   */
  async getByHousehold(householdId: string): Promise<ResidentWithProfile[]> {
    try {
      const query = this.client
        .from(this.tableName)
        .select(`
          *,
          user_profile:user_profiles(*)
        `)
        .eq('household_id', householdId)
        .order('relationship_to_head', { ascending: true });

      return await this.executeQuery<ResidentWithProfile[]>(query, 'get residents by household');
    } catch (error) {
      this.handleError(error, 'get residents by household');
    }
  }

  /**
   * Get residents statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    voters: number;
    pwd: number;
    seniors: number;
    fourPs: number;
  }> {
    try {
      const [total, active, voters, pwd, seniors, fourPs] = await Promise.all([
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('is_registered_voter', true),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('is_pwd', true),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('is_senior_citizen', true),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('is_4ps_beneficiary', true),
      ]);

      return {
        total: total.count || 0,
        active: active.count || 0,
        voters: voters.count || 0,
        pwd: pwd.count || 0,
        seniors: seniors.count || 0,
        fourPs: fourPs.count || 0,
      };
    } catch (error) {
      this.handleError(error, 'get resident stats');
    }
  }

  /**
   * Get complete resident profile with all related information
   */
  async getCompleteProfile(residentId: string): Promise<CompleteResidentProfile | null> {
    try {
      const { data } = await this.client
        .rpc('get_complete_resident_profile', { p_resident_id: residentId });

      if (!data || data.length === 0) {
        return null;
      }

      return data[0];
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get complete resident profile');
    }
  }

  /**
   * Update resident health information
   */
  async updateHealthInfo(residentId: string, healthData: any): Promise<any> {
    try {
      const updateData = {
        ...this.cleanData(healthData),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from('resident_health_info')
        .upsert({
          resident_id: residentId,
          ...updateData,
        })
        .select()
        .single();

      return await this.executeQuery(query, 'update health info');
    } catch (error) {
      this.handleError(error, 'update health info');
    }
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(residentId: string, contactData: any): Promise<any> {
    try {
      const insertData = {
        id: this.generateId(),
        resident_id: residentId,
        ...this.cleanData(contactData),
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from('emergency_contacts')
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery(query, 'add emergency contact');
    } catch (error) {
      this.handleError(error, 'add emergency contact');
    }
  }

  /**
   * Generate next resident ID
   */
  async generateResidentId(): Promise<string> {
    try {
      // Get the latest resident ID to generate the next one
      const query = this.client
        .from(this.tableName)
        .select('resident_id')
        .order('created_at', { ascending: false })
        .limit(1);

      const data = await this.executeQuery<{ resident_id: string }[]>(query, 'get latest resident ID');

      if (data.length === 0) {
        return 'RES-000001';
      }

      const lastId = data[0].resident_id;
      const match = lastId.match(/RES-(\d+)/);

      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        return `RES-${nextNumber.toString().padStart(6, '0')}`;
      }

      return 'RES-000001';
    } catch (error) {
      this.handleError(error, 'generate resident ID');
    }
  }
}
