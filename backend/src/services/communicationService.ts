import { supabase } from '@/config/supabase';
import { CustomError } from '@/middleware/errorHandler';

export interface SendMessageOptions {
  recipients: string[]; // user IDs or contact info
  templateCode: string;
  variables: Record<string, string>;
  channel: 'email' | 'sms' | 'push' | 'all';
  priority?: number;
  scheduledAt?: string;
}

export interface BulletinPostData {
  title: string;
  content: string;
  category: string;
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  isPinned?: boolean;
  isPublic?: boolean;
  targetAudience?: string;
  expiresAt?: string;
  tags?: string;
  attachments?: any[];
}

export interface CommunicationCampaignData {
  campaignName: string;
  description?: string;
  targetAudience: string;
  targetCriteria?: any;
  messageTemplateId: string;
  templateVariables: Record<string, string>;
  scheduledAt?: string;
}

export class CommunicationService {
  /**
   * Send message using template
   */
  async sendMessage(options: SendMessageOptions, senderId: string): Promise<string[]> {
    try {
      // Get message template
      const { data: template, error: templateError } = await supabase
        .from('message_templates')
        .select(`
          *,
          channel:communication_channels(*)
        `)
        .eq('template_code', options.templateCode)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        throw new CustomError('Message template not found', 404);
      }

      // Process template variables
      const subject = this.processTemplate(template.subject_template || '', options.variables);
      const content = this.processTemplate(template.body_template, options.variables);

      const messageIds: string[] = [];

      // Create message queue entries for each recipient
      for (const recipient of options.recipients) {
        const channels = options.channel === 'all' 
          ? ['email', 'sms', 'push'] 
          : [options.channel];

        for (const channelCode of channels) {
          // Get channel info
          const { data: channel } = await supabase
            .from('communication_channels')
            .select('*')
            .eq('channel_code', channelCode.toUpperCase())
            .eq('is_active', true)
            .single();

          if (!channel) continue;

          // Get recipient contact info
          const recipientContact = await this.getRecipientContact(recipient, channelCode);
          if (!recipientContact) continue;

          // Create message queue entry
          const { data: message, error } = await supabase
            .from('message_queue')
            .insert({
              recipient_id: recipient,
              recipient_contact: recipientContact,
              channel_id: channel.id,
              subject,
              message_content: content,
              priority: options.priority || 5,
              scheduled_at: options.scheduledAt || new Date().toISOString(),
              status: 'Pending',
            })
            .select()
            .single();

          if (!error && message) {
            messageIds.push(message.id);
          }
        }
      }

      // Process messages immediately if not scheduled
      if (!options.scheduledAt) {
        await this.processMessageQueue();
      }

      return messageIds;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Create communication campaign
   */
  async createCampaign(data: CommunicationCampaignData, createdBy: string): Promise<any> {
    try {
      // Get target recipients
      const recipients = await this.getTargetRecipients(data.targetAudience, data.targetCriteria);

      const { data: campaign, error } = await supabase
        .from('communication_campaigns')
        .insert({
          campaign_name: data.campaignName,
          description: data.description,
          target_audience: data.targetAudience,
          target_criteria: data.targetCriteria,
          message_template_id: data.messageTemplateId,
          template_variables: data.templateVariables,
          scheduled_at: data.scheduledAt,
          total_recipients: recipients.length,
          created_by: createdBy,
          status: data.scheduledAt ? 'Scheduled' : 'Draft',
        })
        .select()
        .single();

      if (error) {
        throw new CustomError('Failed to create campaign', 500);
      }

      return campaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  }

  /**
   * Create bulletin post
   */
  async createBulletinPost(data: BulletinPostData, authorId: string): Promise<any> {
    try {
      const { data: post, error } = await supabase
        .from('bulletin_posts')
        .insert({
          title: data.title,
          content: data.content,
          category: data.category,
          priority: data.priority || 'Normal',
          is_pinned: data.isPinned || false,
          is_public: data.isPublic !== false,
          target_audience: data.targetAudience || 'all',
          expires_at: data.expiresAt,
          tags: data.tags,
          attachments: data.attachments,
          author_id: authorId,
          status: 'Published',
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new CustomError('Failed to create bulletin post', 500);
      }

      return post;
    } catch (error) {
      console.error('Failed to create bulletin post:', error);
      throw error;
    }
  }

  /**
   * Get bulletin posts
   */
  async getBulletinPosts(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<{ data: any[]; pagination: any }> {
    try {
      let query = supabase
        .from('bulletin_posts')
        .select(`
          *,
          author:user_profiles!author_id(first_name, last_name)
        `, { count: 'exact' })
        .eq('status', 'Published')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        throw new CustomError('Failed to get bulletin posts', 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Failed to get bulletin posts:', error);
      throw error;
    }
  }

  /**
   * Interact with bulletin post
   */
  async interactWithPost(
    postId: string,
    userId: string,
    interactionType: 'view' | 'like' | 'comment',
    commentText?: string
  ): Promise<void> {
    try {
      await supabase
        .from('bulletin_post_interactions')
        .upsert({
          post_id: postId,
          user_id: userId,
          interaction_type: interactionType,
          comment_text: commentText,
        });
    } catch (error) {
      console.error('Failed to interact with post:', error);
      // Don't throw error for interactions
    }
  }

  /**
   * Get communication statistics
   */
  async getCommunicationStats(startDate?: string, endDate?: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('get_communication_stats', {
          p_start_date: startDate,
          p_end_date: endDate,
        });

      if (error) {
        throw new CustomError('Failed to get communication stats', 500);
      }

      return data[0] || {};
    } catch (error) {
      console.error('Failed to get communication stats:', error);
      throw error;
    }
  }

  /**
   * Process message queue (send pending messages)
   */
  async processMessageQueue(): Promise<void> {
    try {
      // Get pending messages
      const { data: messages, error } = await supabase
        .from('message_queue')
        .select(`
          *,
          channel:communication_channels(*)
        `)
        .eq('status', 'Pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('priority')
        .order('created_at')
        .limit(50);

      if (error || !messages) {
        return;
      }

      for (const message of messages) {
        try {
          // Update status to sending
          await supabase
            .from('message_queue')
            .update({ status: 'Sending' })
            .eq('id', message.id);

          // Send message based on channel
          let success = false;
          switch (message.channel.channel_code) {
            case 'EMAIL':
              success = await this.sendEmail(message);
              break;
            case 'SMS':
              success = await this.sendSMS(message);
              break;
            case 'PUSH':
              success = await this.sendPushNotification(message);
              break;
          }

          // Update status
          await supabase
            .from('message_queue')
            .update({
              status: success ? 'Sent' : 'Failed',
              sent_at: success ? new Date().toISOString() : null,
              error_message: success ? null : 'Failed to send message',
            })
            .eq('id', message.id);

        } catch (error) {
          console.error(`Failed to send message ${message.id}:`, error);
          
          // Update retry count and status
          const newRetryCount = (message.retry_count || 0) + 1;
          const status = newRetryCount >= (message.max_retries || 3) ? 'Failed' : 'Pending';
          
          await supabase
            .from('message_queue')
            .update({
              status,
              retry_count: newRetryCount,
              error_message: error.message,
            })
            .eq('id', message.id);
        }
      }
    } catch (error) {
      console.error('Failed to process message queue:', error);
    }
  }

  /**
   * Process template with variables
   */
  private processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    });

    return processed;
  }

  /**
   * Get recipient contact information
   */
  private async getRecipientContact(recipientId: string, channel: string): Promise<string | null> {
    try {
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('email, phone')
        .eq('id', recipientId)
        .single();

      if (error || !user) {
        return null;
      }

      switch (channel) {
        case 'email':
          return user.email;
        case 'sms':
          return user.phone;
        case 'push':
          return user.email; // Use email as identifier for push notifications
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Get target recipients based on audience criteria
   */
  private async getTargetRecipients(audience: string, criteria?: any): Promise<string[]> {
    try {
      let query = supabase
        .from('user_profiles')
        .select('id');

      // Apply audience filters
      switch (audience) {
        case 'residents':
          query = query.eq('role', 'resident');
          break;
        case 'voters':
          query = query.eq('is_registered_voter', true);
          break;
        case 'seniors':
          query = query.eq('is_senior_citizen', true);
          break;
        case 'pwd':
          query = query.eq('is_pwd', true);
          break;
        // Add more audience types as needed
      }

      // Apply custom criteria if provided
      if (criteria) {
        // Implement custom criteria logic here
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(user => user.id);
    } catch (error) {
      console.error('Failed to get target recipients:', error);
      return [];
    }
  }

  /**
   * Send email (placeholder - implement with your email provider)
   */
  private async sendEmail(message: any): Promise<boolean> {
    try {
      // Implement email sending logic here
      // This could use services like SendGrid, AWS SES, etc.
      console.log('Sending email:', message);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send SMS (placeholder - implement with your SMS provider)
   */
  private async sendSMS(message: any): Promise<boolean> {
    try {
      // Implement SMS sending logic here
      // This could use services like Semaphore, Twilio, etc.
      console.log('Sending SMS:', message);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send push notification (placeholder)
   */
  private async sendPushNotification(message: any): Promise<boolean> {
    try {
      // Implement push notification logic here
      console.log('Sending push notification:', message);
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }
}

// Export singleton instance
export const communicationService = new CommunicationService();
