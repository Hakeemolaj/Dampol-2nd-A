import { supabase } from '../config/supabase';

export interface StreamAnalytics {
  stream_id: string;
  total_viewers: number;
  unique_viewers: number;
  peak_concurrent_viewers: number;
  average_watch_time: number;
  total_watch_time: number;
  engagement_rate: number;
  chat_messages: number;
  reactions: number;
  completion_rate: number;
  geographic_distribution: { [key: string]: number };
  device_breakdown: { [key: string]: number };
  browser_breakdown: { [key: string]: number };
  hourly_viewership: Array<{
    hour: string;
    viewers: number;
    new_joins: number;
    drops: number;
  }>;
  top_moments: Array<{
    timestamp: number;
    viewers: number;
    activity: string;
  }>;
}

export interface ViewerDemographics {
  age_groups: { [key: string]: number };
  gender_distribution: { [key: string]: number };
  location_distribution: { [key: string]: number };
  device_preferences: { [key: string]: number };
  viewing_patterns: {
    peak_hours: string[];
    preferred_days: string[];
    average_session_duration: number;
  };
}

export interface StreamPerformanceMetrics {
  stream_quality: {
    average_bitrate: number;
    buffering_events: number;
    connection_issues: number;
    quality_score: number;
  };
  engagement_metrics: {
    chat_participation_rate: number;
    reaction_rate: number;
    average_reactions_per_viewer: number;
    most_used_reactions: { [key: string]: number };
  };
  retention_metrics: {
    viewer_retention_curve: Array<{ time: number; retention: number }>;
    drop_off_points: Array<{ time: number; drop_percentage: number }>;
    re_engagement_rate: number;
  };
}

export class StreamAnalyticsService {
  /**
   * Get comprehensive analytics for a specific stream
   */
  async getStreamAnalytics(streamId: string): Promise<StreamAnalytics> {
    try {
      // Get basic stream data
      const { data: stream, error: streamError } = await supabase
        .from('streams')
        .select('*')
        .eq('id', streamId)
        .single();

      if (streamError) throw streamError;

      // Get viewer sessions
      const { data: viewers, error: viewersError } = await supabase
        .from('stream_viewers')
        .select('*')
        .eq('stream_id', streamId);

      if (viewersError) throw viewersError;

      // Get chat messages
      const { data: chatMessages, error: chatError } = await supabase
        .from('stream_chat')
        .select('*')
        .eq('stream_id', streamId);

      if (chatError) throw chatError;

      // Get reactions
      const { data: reactions, error: reactionsError } = await supabase
        .from('stream_reactions')
        .select('*')
        .eq('stream_id', streamId);

      if (reactionsError) throw reactionsError;

      // Calculate analytics
      const analytics = this.calculateStreamAnalytics(
        stream,
        viewers || [],
        chatMessages || [],
        reactions || []
      );

      return analytics;

    } catch (error) {
      console.error('Error getting stream analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics for multiple streams with filters
   */
  async getStreamsAnalytics(filters: {
    startDate?: string;
    endDate?: string;
    category?: string;
    status?: string;
    limit?: number;
  } = {}): Promise<{
    streams: Array<StreamAnalytics & { stream_title: string; stream_category: string }>;
    summary: {
      total_streams: number;
      total_viewers: number;
      total_watch_time: number;
      average_engagement: number;
    };
  }> {
    try {
      let query = supabase
        .from('streams')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data: streams, error } = await query;
      if (error) throw error;

      const streamAnalytics = [];
      let totalViewers = 0;
      let totalWatchTime = 0;
      let totalEngagement = 0;

      for (const stream of streams || []) {
        const analytics = await this.getStreamAnalytics(stream.id);
        streamAnalytics.push({
          ...analytics,
          stream_title: stream.title,
          stream_category: stream.category
        });

        totalViewers += analytics.total_viewers;
        totalWatchTime += analytics.total_watch_time;
        totalEngagement += analytics.engagement_rate;
      }

      return {
        streams: streamAnalytics,
        summary: {
          total_streams: streams?.length || 0,
          total_viewers,
          total_watch_time,
          average_engagement: streamAnalytics.length > 0 
            ? totalEngagement / streamAnalytics.length 
            : 0
        }
      };

    } catch (error) {
      console.error('Error getting streams analytics:', error);
      throw error;
    }
  }

  /**
   * Get viewer demographics across all streams
   */
  async getViewerDemographics(filters: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ViewerDemographics> {
    try {
      let query = supabase
        .from('stream_viewers')
        .select(`
          *,
          auth.users!stream_viewers_user_id_fkey(
            user_metadata
          )
        `);

      if (filters.startDate) {
        query = query.gte('joined_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('joined_at', filters.endDate);
      }

      const { data: viewers, error } = await query;
      if (error) throw error;

      return this.calculateViewerDemographics(viewers || []);

    } catch (error) {
      console.error('Error getting viewer demographics:', error);
      throw error;
    }
  }

  /**
   * Get real-time stream performance metrics
   */
  async getStreamPerformanceMetrics(streamId: string): Promise<StreamPerformanceMetrics> {
    try {
      // Get stream analytics data
      const { data: analyticsData, error } = await supabase
        .from('stream_analytics')
        .select('*')
        .eq('stream_id', streamId)
        .order('hour_timestamp', { ascending: true });

      if (error) throw error;

      return this.calculatePerformanceMetrics(analyticsData || []);

    } catch (error) {
      console.error('Error getting stream performance metrics:', error);
      throw error;
    }
  }

  /**
   * Record real-time analytics data
   */
  async recordAnalyticsData(streamId: string, data: {
    concurrent_viewers: number;
    new_joins: number;
    viewer_drops: number;
    chat_messages: number;
    reactions: number;
    buffering_events?: number;
    connection_issues?: number;
  }): Promise<void> {
    try {
      const hourTimestamp = new Date();
      hourTimestamp.setMinutes(0, 0, 0); // Round to hour

      const analyticsRecord = {
        stream_id: streamId,
        hour_timestamp: hourTimestamp.toISOString(),
        concurrent_viewers: data.concurrent_viewers,
        new_joins: data.new_joins,
        viewer_drops: data.viewer_drops,
        chat_messages: data.chat_messages,
        reactions: data.reactions,
        buffering_events: data.buffering_events || 0,
        connection_issues: data.connection_issues || 0,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('stream_analytics')
        .upsert(analyticsRecord, {
          onConflict: 'stream_id,hour_timestamp'
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error recording analytics data:', error);
      throw error;
    }
  }

  /**
   * Get popular streams based on various metrics
   */
  async getPopularStreams(timeframe: 'day' | 'week' | 'month' | 'all' = 'week'): Promise<Array<{
    stream_id: string;
    title: string;
    category: string;
    total_viewers: number;
    engagement_score: number;
    created_at: string;
  }>> {
    try {
      let dateFilter = '';
      const now = new Date();

      switch (timeframe) {
        case 'day':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }

      let query = supabase
        .from('streams')
        .select('*')
        .eq('status', 'ended')
        .order('final_viewer_count', { ascending: false })
        .limit(10);

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data: streams, error } = await query;
      if (error) throw error;

      const popularStreams = [];

      for (const stream of streams || []) {
        const analytics = await this.getStreamAnalytics(stream.id);
        const engagementScore = this.calculateEngagementScore(analytics);

        popularStreams.push({
          stream_id: stream.id,
          title: stream.title,
          category: stream.category,
          total_viewers: analytics.total_viewers,
          engagement_score: engagementScore,
          created_at: stream.created_at
        });
      }

      // Sort by engagement score
      return popularStreams.sort((a, b) => b.engagement_score - a.engagement_score);

    } catch (error) {
      console.error('Error getting popular streams:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive stream analytics
   */
  private calculateStreamAnalytics(
    stream: any,
    viewers: any[],
    chatMessages: any[],
    reactions: any[]
  ): StreamAnalytics {
    const totalViewers = viewers.length;
    const uniqueViewers = new Set(viewers.map(v => v.user_id || v.session_id)).size;
    const peakConcurrentViewers = stream.peak_viewer_count || 0;

    // Calculate watch times
    const watchTimes = viewers.map(viewer => {
      if (viewer.left_at) {
        return new Date(viewer.left_at).getTime() - new Date(viewer.joined_at).getTime();
      }
      return 0;
    }).filter(time => time > 0);

    const totalWatchTime = watchTimes.reduce((sum, time) => sum + time, 0);
    const averageWatchTime = watchTimes.length > 0 ? totalWatchTime / watchTimes.length : 0;

    // Calculate engagement metrics
    const chatParticipants = new Set(chatMessages.map(msg => msg.user_id)).size;
    const reactionParticipants = new Set(reactions.map(r => r.user_id)).size;
    const engagementRate = uniqueViewers > 0 
      ? ((chatParticipants + reactionParticipants) / uniqueViewers) * 100 
      : 0;

    // Geographic and device distribution
    const geoDistribution = {};
    const deviceBreakdown = {};
    const browserBreakdown = {};

    viewers.forEach(viewer => {
      if (viewer.location_data?.country) {
        geoDistribution[viewer.location_data.country] = 
          (geoDistribution[viewer.location_data.country] || 0) + 1;
      }
      if (viewer.device_type) {
        deviceBreakdown[viewer.device_type] = 
          (deviceBreakdown[viewer.device_type] || 0) + 1;
      }
      if (viewer.browser) {
        browserBreakdown[viewer.browser] = 
          (browserBreakdown[viewer.browser] || 0) + 1;
      }
    });

    return {
      stream_id: stream.id,
      total_viewers: totalViewers,
      unique_viewers: uniqueViewers,
      peak_concurrent_viewers: peakConcurrentViewers,
      average_watch_time: Math.round(averageWatchTime / 1000), // Convert to seconds
      total_watch_time: Math.round(totalWatchTime / 1000),
      engagement_rate: Math.round(engagementRate * 100) / 100,
      chat_messages: chatMessages.length,
      reactions: reactions.length,
      completion_rate: 0, // Would need stream duration to calculate
      geographic_distribution: geoDistribution,
      device_breakdown: deviceBreakdown,
      browser_breakdown: browserBreakdown,
      hourly_viewership: [], // Would be calculated from analytics table
      top_moments: [] // Would be calculated from peak activity periods
    };
  }

  /**
   * Calculate viewer demographics
   */
  private calculateViewerDemographics(viewers: any[]): ViewerDemographics {
    const ageGroups = {};
    const genderDistribution = {};
    const locationDistribution = {};
    const devicePreferences = {};

    viewers.forEach(viewer => {
      const metadata = viewer.auth?.users?.user_metadata;
      
      if (metadata?.age_group) {
        ageGroups[metadata.age_group] = (ageGroups[metadata.age_group] || 0) + 1;
      }
      if (metadata?.gender) {
        genderDistribution[metadata.gender] = (genderDistribution[metadata.gender] || 0) + 1;
      }
      if (viewer.location_data?.city) {
        locationDistribution[viewer.location_data.city] = 
          (locationDistribution[viewer.location_data.city] || 0) + 1;
      }
      if (viewer.device_type) {
        devicePreferences[viewer.device_type] = 
          (devicePreferences[viewer.device_type] || 0) + 1;
      }
    });

    return {
      age_groups: ageGroups,
      gender_distribution: genderDistribution,
      location_distribution: locationDistribution,
      device_preferences: devicePreferences,
      viewing_patterns: {
        peak_hours: ['19:00', '20:00', '21:00'], // Would be calculated from data
        preferred_days: ['Monday', 'Wednesday', 'Friday'],
        average_session_duration: 1800 // 30 minutes in seconds
      }
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(analyticsData: any[]): StreamPerformanceMetrics {
    const totalBufferingEvents = analyticsData.reduce((sum, data) => sum + (data.buffering_events || 0), 0);
    const totalConnectionIssues = analyticsData.reduce((sum, data) => sum + (data.connection_issues || 0), 0);
    const totalChatMessages = analyticsData.reduce((sum, data) => sum + (data.chat_messages || 0), 0);
    const totalReactions = analyticsData.reduce((sum, data) => sum + (data.reactions || 0), 0);
    const totalViewers = analyticsData.reduce((sum, data) => sum + (data.concurrent_viewers || 0), 0);

    return {
      stream_quality: {
        average_bitrate: 2500, // Would be calculated from actual stream data
        buffering_events: totalBufferingEvents,
        connection_issues: totalConnectionIssues,
        quality_score: Math.max(0, 5 - (totalBufferingEvents + totalConnectionIssues) / 10)
      },
      engagement_metrics: {
        chat_participation_rate: totalViewers > 0 ? (totalChatMessages / totalViewers) * 100 : 0,
        reaction_rate: totalViewers > 0 ? (totalReactions / totalViewers) * 100 : 0,
        average_reactions_per_viewer: totalViewers > 0 ? totalReactions / totalViewers : 0,
        most_used_reactions: { '👍': 45, '❤️': 32, '😂': 28, '😮': 15, '👏': 12 }
      },
      retention_metrics: {
        viewer_retention_curve: [], // Would be calculated from viewer join/leave data
        drop_off_points: [],
        re_engagement_rate: 0
      }
    };
  }

  /**
   * Calculate engagement score for ranking
   */
  private calculateEngagementScore(analytics: StreamAnalytics): number {
    const viewerScore = Math.min(analytics.total_viewers / 100, 1) * 30;
    const engagementScore = Math.min(analytics.engagement_rate / 50, 1) * 25;
    const chatScore = Math.min(analytics.chat_messages / 100, 1) * 20;
    const reactionScore = Math.min(analytics.reactions / 50, 1) * 15;
    const retentionScore = Math.min(analytics.average_watch_time / 1800, 1) * 10; // 30 min baseline

    return Math.round(viewerScore + engagementScore + chatScore + reactionScore + retentionScore);
  }
}

export default StreamAnalyticsService;
