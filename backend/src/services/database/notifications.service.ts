import { BaseService, PaginationOptions, PaginationResult, FilterOptions, SortOptions } from './base.service';
import { Database } from '@/config/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];
type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];

export interface NotificationFilters extends FilterOptions {
  is_read?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  type_name?: string;
  related_entity_type?: string;
}

export interface CreateNotificationData {
  user_id: string;
  type_name: string;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  delivery_method?: string[];
  scheduled_for?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface NotificationWithType extends Notification {
  notification_type?: {
    name: string;
    icon: string;
    color: string;
  };
}

export class NotificationsService extends BaseService {
  private readonly tableName = 'notifications';

  /**
   * Get notifications for a user with pagination and filtering
   */
  async getUserNotifications(
    userId: string,
    options: PaginationOptions = {},
    filters: NotificationFilters = {},
    sort: SortOptions = { column: 'created_at', ascending: false }
  ): Promise<PaginationResult<NotificationWithType>> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(`
          *,
          notification_type:notification_types(name, icon, color)
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.related_entity_type) {
        query = query.eq('related_entity_type', filters.related_entity_type);
      }

      // Filter out expired notifications
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      // Apply sorting
      query = this.applySorting(query, sort);

      // Apply pagination
      query = this.applyPagination(query, options);

      const { data, count } = await this.executeQueryWithCount<NotificationWithType>(
        query,
        'get user notifications'
      );

      const { page = 1, limit = 10 } = options;
      const pagination = this.calculatePagination(count, page, limit);

      return { data, pagination };
    } catch (error) {
      this.handleError(error, 'get user notifications');
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data } = await this.client
        .rpc('get_unread_notification_count', { p_user_id: userId });

      return data || 0;
    } catch (error) {
      this.handleError(error, 'get unread notification count');
    }
  }

  /**
   * Create a new notification
   */
  async create(data: CreateNotificationData): Promise<Notification> {
    try {
      this.validateRequired(data, ['user_id', 'type_name', 'title', 'message']);

      // Get notification type ID
      const { data: notificationType } = await this.client
        .from('notification_types')
        .select('id')
        .eq('name', data.type_name)
        .single();

      if (!notificationType) {
        throw new Error(`Notification type '${data.type_name}' not found`);
      }

      const insertData: NotificationInsert = {
        id: this.generateId(),
        user_id: data.user_id,
        type_id: notificationType.id,
        title: data.title,
        message: data.message,
        data: data.data || null,
        priority: data.priority || 'normal',
        delivery_method: data.delivery_method || ['in_app'],
        scheduled_for: data.scheduled_for || null,
        related_entity_type: data.related_entity_type || null,
        related_entity_id: data.related_entity_id || null,
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<Notification>(query, 'create notification');
    } catch (error) {
      this.handleError(error, 'create notification');
    }
  }

  /**
   * Create notification from template
   */
  async createFromTemplate(
    userId: string,
    templateName: string,
    variables: Record<string, string> = {},
    options: {
      scheduledFor?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
    } = {}
  ): Promise<string> {
    try {
      const { data } = await this.client
        .rpc('create_notification_from_template', {
          p_user_id: userId,
          p_template_name: templateName,
          p_variables: variables,
          p_scheduled_for: options.scheduledFor || null,
          p_related_entity_type: options.relatedEntityType || null,
          p_related_entity_id: options.relatedEntityId || null,
        });

      return data;
    } catch (error) {
      this.handleError(error, 'create notification from template');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    try {
      const updateData: NotificationUpdate = {
        is_read: true,
        read_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      return await this.executeQuery<Notification>(query, 'mark notification as read');
    } catch (error) {
      this.handleError(error, 'mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const updateData: NotificationUpdate = {
        is_read: true,
        read_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('user_id', userId)
        .eq('is_read', false);

      await this.executeQuery(query, 'mark all notifications as read');
    } catch (error) {
      this.handleError(error, 'mark all notifications as read');
    }
  }

  /**
   * Delete notification
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    try {
      const query = this.client
        .from(this.tableName)
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      await this.executeQuery(query, 'delete notification');
    } catch (error) {
      this.handleError(error, 'delete notification');
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const query = this.client
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      const data = await this.executeQuery<NotificationPreferences>(query, 'get user preferences');
      return data;
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get user preferences');
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const updateData = {
        ...this.cleanData(preferences),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...updateData,
        })
        .select()
        .single();

      return await this.executeQuery<NotificationPreferences>(query, 'update user preferences');
    } catch (error) {
      this.handleError(error, 'update user preferences');
    }
  }

  /**
   * Get pending notifications for delivery
   */
  async getPendingNotifications(limit: number = 100): Promise<NotificationWithType[]> {
    try {
      const query = this.client
        .from(this.tableName)
        .select(`
          *,
          notification_type:notification_types(name, icon, color)
        `)
        .eq('is_sent', false)
        .or('scheduled_for.is.null,scheduled_for.lte.' + new Date().toISOString())
        .limit(limit)
        .order('created_at', { ascending: true });

      return await this.executeQuery<NotificationWithType[]>(query, 'get pending notifications');
    } catch (error) {
      this.handleError(error, 'get pending notifications');
    }
  }

  /**
   * Mark notification as sent
   */
  async markAsSent(notificationId: string): Promise<void> {
    try {
      const updateData: NotificationUpdate = {
        is_sent: true,
        sent_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', notificationId);

      await this.executeQuery(query, 'mark notification as sent');
    } catch (error) {
      this.handleError(error, 'mark notification as sent');
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpired(): Promise<number> {
    try {
      const { data } = await this.client
        .from(this.tableName)
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      return data?.length || 0;
    } catch (error) {
      this.handleError(error, 'cleanup expired notifications');
    }
  }
}
