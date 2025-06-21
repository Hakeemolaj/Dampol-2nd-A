import { supabase } from '@/config/supabase';
import { NotificationsService } from './database/notifications.service';

export interface NotificationPayload {
  userId: string;
  templateName: string;
  variables: Record<string, string>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  relatedEntityType?: string;
  relatedEntityId?: string;
  scheduledFor?: string;
}

export class RealTimeNotificationService {
  private notificationsService: NotificationsService;

  constructor() {
    this.notificationsService = new NotificationsService();
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(payload: NotificationPayload): Promise<string> {
    try {
      // Create notification in database
      const notificationId = await this.notificationsService.createFromTemplate(
        payload.userId,
        payload.templateName,
        payload.variables,
        {
          scheduledFor: payload.scheduledFor,
          relatedEntityType: payload.relatedEntityType,
          relatedEntityId: payload.relatedEntityId,
        }
      );

      // Send real-time notification via Supabase
      await this.sendRealTimeUpdate(payload.userId, {
        type: 'notification',
        action: 'created',
        data: {
          id: notificationId,
          template: payload.templateName,
          priority: payload.priority || 'normal',
          variables: payload.variables,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: Omit<NotificationPayload, 'userId'>): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const userId of userIds) {
      try {
        const notificationId = await this.sendToUser({
          ...payload,
          userId,
        });
        notificationIds.push(notificationId);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
      }
    }

    return notificationIds;
  }

  /**
   * Send notification to all users with a specific role
   */
  async sendToRole(role: string, payload: Omit<NotificationPayload, 'userId'>): Promise<string[]> {
    try {
      // Get all users with the specified role
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', role);

      if (error) {
        throw error;
      }

      const userIds = users?.map(user => user.id) || [];
      return await this.sendToUsers(userIds, payload);
    } catch (error) {
      console.error(`Failed to send notification to role ${role}:`, error);
      throw error;
    }
  }

  /**
   * Send broadcast notification to all users
   */
  async sendBroadcast(payload: Omit<NotificationPayload, 'userId'>): Promise<string[]> {
    try {
      // Get all active users
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id');

      if (error) {
        throw error;
      }

      const userIds = users?.map(user => user.id) || [];
      return await this.sendToUsers(userIds, payload);
    } catch (error) {
      console.error('Failed to send broadcast notification:', error);
      throw error;
    }
  }

  /**
   * Send document status update notification
   */
  async sendDocumentStatusUpdate(
    userId: string,
    documentRequest: {
      id: string;
      request_number: string;
      document_type: string;
      status: string;
      applicant_name: string;
    },
    additionalMessage?: string
  ): Promise<string> {
    return await this.sendToUser({
      userId,
      templateName: 'Document Status Update',
      variables: {
        user_name: documentRequest.applicant_name,
        document_type: documentRequest.document_type,
        request_number: documentRequest.request_number,
        status: documentRequest.status,
        additional_message: additionalMessage || '',
      },
      priority: 'normal',
      relatedEntityType: 'document_request',
      relatedEntityId: documentRequest.id,
    });
  }

  /**
   * Send new announcement notification
   */
  async sendAnnouncementNotification(
    announcement: {
      id: string;
      title: string;
      summary?: string;
      priority: string;
    }
  ): Promise<string[]> {
    const priority = announcement.priority === 'urgent' ? 'urgent' : 'normal';

    return await this.sendBroadcast({
      templateName: 'New Announcement',
      variables: {
        title: announcement.title,
        summary: announcement.summary || '',
      },
      priority: priority as any,
      relatedEntityType: 'announcement',
      relatedEntityId: announcement.id,
    });
  }

  /**
   * Send payment reminder notification
   */
  async sendPaymentReminder(
    userId: string,
    payment: {
      amount: number;
      service: string;
      due_date: string;
      user_name: string;
    }
  ): Promise<string> {
    return await this.sendToUser({
      userId,
      templateName: 'Payment Reminder',
      variables: {
        user_name: payment.user_name,
        amount: payment.amount.toString(),
        service: payment.service,
        due_date: payment.due_date,
      },
      priority: 'high',
    });
  }

  /**
   * Send emergency alert
   */
  async sendEmergencyAlert(
    title: string,
    message: string
  ): Promise<string[]> {
    return await this.sendBroadcast({
      templateName: 'Emergency Alert',
      variables: {
        title,
        message,
      },
      priority: 'urgent',
    });
  }

  /**
   * Send welcome notification to new user
   */
  async sendWelcomeNotification(
    userId: string,
    userName: string
  ): Promise<string> {
    return await this.sendToUser({
      userId,
      templateName: 'Welcome Message',
      variables: {
        user_name: userName,
      },
      priority: 'normal',
    });
  }

  /**
   * Send real-time update via Supabase
   */
  private async sendRealTimeUpdate(userId: string, payload: any): Promise<void> {
    try {
      // Send to user-specific channel
      await supabase.channel(`user:${userId}`).send({
        type: 'broadcast',
        event: 'notification',
        payload,
      });

      // Also send to general notifications channel for the user
      await supabase.channel('notifications').send({
        type: 'broadcast',
        event: 'user_notification',
        payload: {
          userId,
          ...payload,
        },
      });
    } catch (error) {
      console.error('Failed to send real-time update:', error);
      // Don't throw error here as the notification is still created in the database
    }
  }

  /**
   * Process pending notifications (for scheduled notifications)
   */
  async processPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications = await this.notificationsService.getPendingNotifications(50);

      for (const notification of pendingNotifications) {
        try {
          // Send real-time update
          await this.sendRealTimeUpdate(notification.user_id!, {
            type: 'notification',
            action: 'delivered',
            data: {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              priority: notification.priority,
              type: notification.notification_type?.name,
            },
          });

          // Mark as sent
          await this.notificationsService.markAsSent(notification.id);
        } catch (error) {
          console.error(`Failed to process notification ${notification.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to process pending notifications:', error);
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      return await this.notificationsService.cleanupExpired();
    } catch (error) {
      console.error('Failed to cleanup expired notifications:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const realTimeNotificationService = new RealTimeNotificationService();
