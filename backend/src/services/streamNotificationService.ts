import { supabase } from '../config/supabase';
import { NotificationsService } from './database/notifications.service';

export interface StreamNotification {
  id: string;
  stream_id: string;
  notification_type: 'stream_scheduled' | 'stream_starting' | 'stream_live' | 'stream_ended' | 'emergency_broadcast';
  title: string;
  message: string;
  scheduled_at?: string;
  sent_at?: string;
  recipient_type: 'all_residents' | 'specific_users' | 'role_based';
  recipient_ids?: string[];
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  priority: 'low' | 'normal' | 'high' | 'emergency';
  metadata?: {
    stream_title?: string;
    stream_category?: string;
    stream_url?: string;
    estimated_duration?: number;
  };
}

export class StreamNotificationService {
  private notificationService: NotificationsService;

  constructor() {
    this.notificationService = new NotificationsService();
  }

  /**
   * Schedule notification for upcoming stream
   */
  async scheduleStreamNotification(streamId: string, scheduledAt: Date): Promise<void> {
    try {
      // Get stream details
      const { data: stream, error } = await supabase
        .from('streams')
        .select('*')
        .eq('id', streamId)
        .single();

      if (error || !stream) {
        throw new Error('Stream not found');
      }

      // Create notification 30 minutes before stream
      const notificationTime = new Date(scheduledAt.getTime() - 30 * 60 * 1000);
      
      const notification: Partial<StreamNotification> = {
        stream_id: streamId,
        notification_type: 'stream_scheduled',
        title: `Upcoming: ${stream.title}`,
        message: `${this.getCategoryEmoji(stream.category)} ${stream.title} will start in 30 minutes. Don't miss it!`,
        scheduled_at: notificationTime.toISOString(),
        recipient_type: 'all_residents',
        channels: ['push', 'in_app'],
        priority: stream.category === 'emergency' ? 'emergency' : 'normal',
        metadata: {
          stream_title: stream.title,
          stream_category: stream.category,
          stream_url: `/streams/${streamId}`,
          estimated_duration: 3600 // Default 1 hour
        }
      };

      await this.createNotification(notification);

      // For emergency broadcasts, send immediate notification
      if (stream.category === 'emergency') {
        await this.sendEmergencyBroadcastAlert(streamId);
      }

    } catch (error) {
      console.error('Error scheduling stream notification:', error);
      throw error;
    }
  }

  /**
   * Send notification when stream goes live
   */
  async notifyStreamLive(streamId: string): Promise<void> {
    try {
      const { data: stream, error } = await supabase
        .from('streams')
        .select('*')
        .eq('id', streamId)
        .single();

      if (error || !stream) {
        throw new Error('Stream not found');
      }

      const notification: Partial<StreamNotification> = {
        stream_id: streamId,
        notification_type: 'stream_live',
        title: `🔴 LIVE: ${stream.title}`,
        message: `${this.getCategoryEmoji(stream.category)} ${stream.title} is now live! Join the stream now.`,
        recipient_type: 'all_residents',
        channels: ['push', 'in_app'],
        priority: stream.category === 'emergency' ? 'emergency' : 'high',
        metadata: {
          stream_title: stream.title,
          stream_category: stream.category,
          stream_url: `/streams/${streamId}`,
        }
      };

      await this.createAndSendNotification(notification);

      // Send real-time notification via Supabase
      await supabase
        .channel('notifications')
        .send({
          type: 'broadcast',
          event: 'stream_live',
          payload: {
            stream_id: streamId,
            title: stream.title,
            category: stream.category,
            url: `/streams/${streamId}`
          }
        });

    } catch (error) {
      console.error('Error sending stream live notification:', error);
      throw error;
    }
  }

  /**
   * Send notification when stream ends
   */
  async notifyStreamEnded(streamId: string, viewerCount: number, recordingAvailable: boolean): Promise<void> {
    try {
      const { data: stream, error } = await supabase
        .from('streams')
        .select('*')
        .eq('id', streamId)
        .single();

      if (error || !stream) {
        throw new Error('Stream not found');
      }

      const notification: Partial<StreamNotification> = {
        stream_id: streamId,
        notification_type: 'stream_ended',
        title: `Stream Ended: ${stream.title}`,
        message: recordingAvailable 
          ? `${stream.title} has ended. ${viewerCount} people watched. Recording is now available.`
          : `${stream.title} has ended. ${viewerCount} people watched.`,
        recipient_type: 'all_residents',
        channels: ['in_app'],
        priority: 'low',
        metadata: {
          stream_title: stream.title,
          stream_category: stream.category,
          stream_url: recordingAvailable ? `/streams/${streamId}` : undefined,
        }
      };

      await this.createAndSendNotification(notification);

    } catch (error) {
      console.error('Error sending stream ended notification:', error);
      throw error;
    }
  }

  /**
   * Send emergency broadcast alert
   */
  async sendEmergencyBroadcastAlert(streamId: string): Promise<void> {
    try {
      const { data: stream, error } = await supabase
        .from('streams')
        .select('*')
        .eq('id', streamId)
        .single();

      if (error || !stream) {
        throw new Error('Stream not found');
      }

      const notification: Partial<StreamNotification> = {
        stream_id: streamId,
        notification_type: 'emergency_broadcast',
        title: '🚨 EMERGENCY BROADCAST',
        message: `URGENT: ${stream.title}. Please watch immediately for important information.`,
        recipient_type: 'all_residents',
        channels: ['push', 'email', 'sms', 'in_app'],
        priority: 'emergency',
        metadata: {
          stream_title: stream.title,
          stream_category: stream.category,
          stream_url: `/streams/${streamId}`,
        }
      };

      await this.createAndSendNotification(notification);

      // Send immediate real-time alert
      await supabase
        .channel('emergency')
        .send({
          type: 'broadcast',
          event: 'emergency_broadcast',
          payload: {
            stream_id: streamId,
            title: stream.title,
            message: notification.message,
            url: `/streams/${streamId}`,
            priority: 'emergency'
          }
        });

    } catch (error) {
      console.error('Error sending emergency broadcast alert:', error);
      throw error;
    }
  }

  /**
   * Send reminder for scheduled streams
   */
  async sendStreamReminders(): Promise<void> {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

      // Get streams scheduled to start in 30 minutes
      const { data: upcomingStreams, error } = await supabase
        .from('streams')
        .select('*')
        .eq('status', 'scheduled')
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', reminderTime.toISOString());

      if (error) {
        throw new Error(`Error fetching upcoming streams: ${error.message}`);
      }

      for (const stream of upcomingStreams || []) {
        await this.scheduleStreamNotification(stream.id, new Date(stream.scheduled_at));
      }

    } catch (error) {
      console.error('Error sending stream reminders:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences for user
   */
  async getUserNotificationPreferences(userId: string): Promise<any> {
    try {
      const { data: preferences, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }

      // Default preferences if none exist
      return preferences || {
        stream_notifications: true,
        emergency_alerts: true,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true
      };

    } catch (error) {
      console.error('Error getting user notification preferences:', error);
      return {
        stream_notifications: true,
        emergency_alerts: true,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true
      };
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserNotificationPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error updating user notification preferences:', error);
      throw error;
    }
  }

  /**
   * Create notification record
   */
  private async createNotification(notification: Partial<StreamNotification>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('stream_notifications')
        .insert(notification)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data.id;

    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create and immediately send notification
   */
  private async createAndSendNotification(notification: Partial<StreamNotification>): Promise<void> {
    try {
      const notificationId = await this.createNotification({
        ...notification,
        sent_at: new Date().toISOString()
      });

      // Send via notification service
      // For now, we'll just create the notification in the database
      // In a full implementation, you would integrate with push notification services
      console.log('Notification created:', notificationId);

    } catch (error) {
      console.error('Error creating and sending notification:', error);
      throw error;
    }
  }

  /**
   * Get category emoji
   */
  private getCategoryEmoji(category: string): string {
    switch (category) {
      case 'meeting': return '🏛️';
      case 'emergency': return '🚨';
      case 'event': return '🎉';
      case 'announcement': return '📢';
      case 'education': return '📚';
      default: return '📺';
    }
  }

  /**
   * Get analytics for stream notifications
   */
  async getNotificationAnalytics(streamId?: string): Promise<any> {
    try {
      let query = supabase
        .from('stream_notifications')
        .select('*');

      if (streamId) {
        query = query.eq('stream_id', streamId);
      }

      const { data: notifications, error } = await query;

      if (error) {
        throw error;
      }

      // Calculate analytics
      const analytics = {
        total_notifications: notifications?.length || 0,
        by_type: {},
        by_priority: {},
        by_channel: {},
        delivery_rate: 0,
        engagement_rate: 0
      };

      notifications?.forEach(notification => {
        // Count by type
        analytics.by_type[notification.notification_type] = 
          (analytics.by_type[notification.notification_type] || 0) + 1;

        // Count by priority
        analytics.by_priority[notification.priority] = 
          (analytics.by_priority[notification.priority] || 0) + 1;

        // Count by channels
        notification.channels?.forEach(channel => {
          analytics.by_channel[channel] = 
            (analytics.by_channel[channel] || 0) + 1;
        });
      });

      return analytics;

    } catch (error) {
      console.error('Error getting notification analytics:', error);
      throw error;
    }
  }
}

export default StreamNotificationService;
