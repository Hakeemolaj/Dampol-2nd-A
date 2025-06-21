import { BaseService, PaginationOptions, PaginationResult, FilterOptions, SortOptions } from './base.service';
import { Database } from '@/config/database.types';

type Announcement = Database['public']['Tables']['announcements']['Row'];
type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update'];

export interface AnnouncementFilters extends FilterOptions {
  category?: string;
  priority?: string;
  is_published?: boolean;
  author_id?: string;
  search?: string;
}

export interface CreateAnnouncementData {
  title: string;
  summary?: string;
  content: string;
  category: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  is_published?: boolean;
  published_at?: string;
  expires_at?: string;
  author_id: string;
}

export interface UpdateAnnouncementData {
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  is_published?: boolean;
  published_at?: string;
  expires_at?: string;
}

export class AnnouncementsService extends BaseService {
  private readonly tableName = 'announcements';

  /**
   * Get all announcements with pagination and filtering
   */
  async getAll(
    options: PaginationOptions = {},
    filters: AnnouncementFilters = {},
    sort: SortOptions = { column: 'created_at', ascending: false }
  ): Promise<PaginationResult<Announcement>> {
    try {
      // Build base query
      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }
      
      if (filters.author_id) {
        query = query.eq('author_id', filters.author_id);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = this.applySorting(query, sort);

      // Apply pagination
      query = this.applyPagination(query, options);

      const { data, count } = await this.executeQueryWithCount<Announcement>(
        query,
        'get announcements'
      );

      const { page = 1, limit = 10 } = options;
      const pagination = this.calculatePagination(count, page, limit);

      return { data, pagination };
    } catch (error) {
      this.handleError(error, 'get announcements');
    }
  }

  /**
   * Get published announcements only
   */
  async getPublished(
    options: PaginationOptions = {},
    filters: Omit<AnnouncementFilters, 'is_published'> = {},
    sort: SortOptions = { column: 'published_at', ascending: false }
  ): Promise<PaginationResult<Announcement>> {
    return this.getAll(options, { ...filters, is_published: true }, sort);
  }

  /**
   * Get urgent announcements
   */
  async getUrgent(): Promise<Announcement[]> {
    try {
      const query = this.client
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .eq('priority', 'urgent')
        .order('published_at', { ascending: false });

      return await this.executeQuery<Announcement[]>(query, 'get urgent announcements');
    } catch (error) {
      this.handleError(error, 'get urgent announcements');
    }
  }

  /**
   * Get announcement by ID
   */
  async getById(id: string): Promise<Announcement | null> {
    try {
      const query = this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      const data = await this.executeQuery<Announcement>(query, 'get announcement by ID');
      return data;
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get announcement by ID');
    }
  }

  /**
   * Create new announcement
   */
  async create(data: CreateAnnouncementData): Promise<Announcement> {
    try {
      this.validateRequired(data, ['title', 'content', 'category', 'author_id']);

      const insertData: AnnouncementInsert = {
        ...this.cleanData(data),
        id: this.generateId(),
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<Announcement>(query, 'create announcement');
    } catch (error) {
      this.handleError(error, 'create announcement');
    }
  }

  /**
   * Update announcement
   */
  async update(id: string, data: UpdateAnnouncementData): Promise<Announcement> {
    try {
      const updateData: AnnouncementUpdate = {
        ...this.cleanData(data),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<Announcement>(query, 'update announcement');
    } catch (error) {
      this.handleError(error, 'update announcement');
    }
  }

  /**
   * Delete announcement
   */
  async delete(id: string): Promise<void> {
    try {
      const query = this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      await this.executeQuery(query, 'delete announcement');
    } catch (error) {
      this.handleError(error, 'delete announcement');
    }
  }

  /**
   * Publish announcement
   */
  async publish(id: string): Promise<Announcement> {
    try {
      const updateData: AnnouncementUpdate = {
        is_published: true,
        published_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<Announcement>(query, 'publish announcement');
    } catch (error) {
      this.handleError(error, 'publish announcement');
    }
  }

  /**
   * Unpublish announcement
   */
  async unpublish(id: string): Promise<Announcement> {
    try {
      const updateData: AnnouncementUpdate = {
        is_published: false,
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<Announcement>(query, 'unpublish announcement');
    } catch (error) {
      this.handleError(error, 'unpublish announcement');
    }
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const query = this.client
        .from(this.tableName)
        .select('category')
        .not('category', 'is', null);

      const data = await this.executeQuery<{ category: string }[]>(query, 'get categories');
      
      // Extract unique categories
      const categories = [...new Set(data.map(item => item.category))];
      return categories.sort();
    } catch (error) {
      this.handleError(error, 'get categories');
    }
  }

  /**
   * Get announcements count by status
   */
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    urgent: number;
  }> {
    try {
      const [total, published, urgent] = await Promise.all([
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('is_published', true),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('priority', 'urgent').eq('is_published', true),
      ]);

      return {
        total: total.count || 0,
        published: published.count || 0,
        draft: (total.count || 0) - (published.count || 0),
        urgent: urgent.count || 0,
      };
    } catch (error) {
      this.handleError(error, 'get announcement stats');
    }
  }
}
