import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Stream {
  id: string;
  title: string;
  description?: string;
  stream_key: string;
  category: 'meeting' | 'emergency' | 'event' | 'announcement' | 'education';
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  is_public: boolean;
  recording_enabled: boolean;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  viewer_count: number;
  peak_viewer_count: number;
  final_viewer_count: number;
  recording_url?: string;
  recording_path?: string;
  hls_url?: string;
  rtmp_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StreamViewer {
  id: string;
  stream_id: string;
  user_id?: string;
  session_id: string;
  joined_at: string;
  left_at?: string;
  watch_duration_seconds: number;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  location_data?: any;
  chat_messages_count: number;
  reactions_count: number;
}

export interface StreamChat {
  id: string;
  stream_id: string;
  user_id?: string;
  viewer_session_id?: string;
  message: string;
  message_type: 'text' | 'emoji' | 'reaction' | 'system';
  is_moderated: boolean;
  moderated_by?: string;
  moderated_at?: string;
  moderation_reason?: string;
  timestamp: string;
  edited_at?: string;
  reply_to_id?: string;
}

export interface StreamAnalytics {
  id: string;
  stream_id: string;
  hour_timestamp: string;
  unique_viewers: number;
  concurrent_viewers: number;
  peak_concurrent_viewers: number;
  total_watch_time_seconds: number;
  average_watch_time_seconds: number;
  chat_messages: number;
  reactions: number;
  new_joins: number;
  viewer_drops: number;
  stream_quality_score?: number;
  buffering_events: number;
  connection_issues: number;
  viewer_locations?: any;
  device_breakdown?: any;
  browser_breakdown?: any;
}

export class StreamsService {
  /**
   * Create a new stream
   */
  async createStream(data: Partial<Stream>): Promise<Stream> {
    const streamKey = uuidv4();
    
    const { data: stream, error } = await supabase
      .from('streams')
      .insert({
        ...data,
        stream_key: streamKey,
        status: 'scheduled',
        viewer_count: 0,
        peak_viewer_count: 0,
        final_viewer_count: 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create stream: ${error.message}`);
    }

    return stream;
  }

  /**
   * Get stream by ID
   */
  async getStreamById(id: string): Promise<Stream | null> {
    const { data: stream, error } = await supabase
      .from('streams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get stream: ${error.message}`);
    }

    return stream;
  }

  /**
   * Get stream by stream key
   */
  async getStreamByKey(streamKey: string): Promise<Stream | null> {
    const { data: stream, error } = await supabase
      .from('streams')
      .select('*')
      .eq('stream_key', streamKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get stream: ${error.message}`);
    }

    return stream;
  }

  /**
   * Update stream
   */
  async updateStream(id: string, data: Partial<Stream>): Promise<Stream> {
    const { data: stream, error } = await supabase
      .from('streams')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update stream: ${error.message}`);
    }

    return stream;
  }

  /**
   * Delete stream
   */
  async deleteStream(id: string): Promise<void> {
    const { error } = await supabase
      .from('streams')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete stream: ${error.message}`);
    }
  }

  /**
   * Get streams with filters
   */
  async getStreams(filters: {
    status?: string;
    category?: string;
    is_public?: boolean;
    created_by?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ streams: Stream[]; total: number }> {
    let query = supabase
      .from('streams')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }
    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: streams, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get streams: ${error.message}`);
    }

    return {
      streams: streams || [],
      total: count || 0
    };
  }

  /**
   * Add viewer to stream
   */
  async addViewer(streamId: string, viewerData: Partial<StreamViewer>): Promise<StreamViewer> {
    const { data: viewer, error } = await supabase
      .from('stream_viewers')
      .insert({
        stream_id: streamId,
        session_id: viewerData.session_id || uuidv4(),
        ...viewerData
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add viewer: ${error.message}`);
    }

    return viewer;
  }

  /**
   * Remove viewer from stream
   */
  async removeViewer(viewerId: string): Promise<void> {
    const { error } = await supabase
      .from('stream_viewers')
      .update({
        left_at: new Date().toISOString(),
        watch_duration_seconds: supabase.rpc('calculate_watch_duration', { viewer_id: viewerId })
      })
      .eq('id', viewerId);

    if (error) {
      throw new Error(`Failed to remove viewer: ${error.message}`);
    }
  }

  /**
   * Add chat message
   */
  async addChatMessage(messageData: Partial<StreamChat>): Promise<StreamChat> {
    const { data: message, error } = await supabase
      .from('stream_chat')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add chat message: ${error.message}`);
    }

    return message;
  }

  /**
   * Get chat messages for stream
   */
  async getChatMessages(streamId: string, limit: number = 50, offset: number = 0): Promise<StreamChat[]> {
    const { data: messages, error } = await supabase
      .from('stream_chat')
      .select('*')
      .eq('stream_id', streamId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get chat messages: ${error.message}`);
    }

    return messages || [];
  }

  /**
   * Moderate chat message
   */
  async moderateChatMessage(messageId: string, moderatorId: string, reason?: string): Promise<void> {
    const { error } = await supabase
      .from('stream_chat')
      .update({
        is_moderated: true,
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString(),
        moderation_reason: reason
      })
      .eq('id', messageId);

    if (error) {
      throw new Error(`Failed to moderate message: ${error.message}`);
    }
  }

  /**
   * Get stream analytics
   */
  async getStreamAnalytics(streamId: string): Promise<StreamAnalytics[]> {
    const { data: analytics, error } = await supabase
      .from('stream_analytics')
      .select('*')
      .eq('stream_id', streamId)
      .order('hour_timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to get stream analytics: ${error.message}`);
    }

    return analytics || [];
  }

  /**
   * Record analytics data
   */
  async recordAnalytics(analyticsData: Partial<StreamAnalytics>): Promise<void> {
    const { error } = await supabase
      .from('stream_analytics')
      .upsert(analyticsData, {
        onConflict: 'stream_id,hour_timestamp'
      });

    if (error) {
      throw new Error(`Failed to record analytics: ${error.message}`);
    }
  }

  /**
   * Get live streams
   */
  async getLiveStreams(): Promise<Stream[]> {
    const { data: streams, error } = await supabase
      .from('streams')
      .select('*')
      .eq('status', 'live')
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get live streams: ${error.message}`);
    }

    return streams || [];
  }

  /**
   * Get upcoming streams
   */
  async getUpcomingStreams(limit: number = 10): Promise<Stream[]> {
    const { data: streams, error } = await supabase
      .from('streams')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get upcoming streams: ${error.message}`);
    }

    return streams || [];
  }
}

export default StreamsService;
