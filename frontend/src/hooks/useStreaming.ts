import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useSupabase';

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
  hls_url?: string;
  rtmp_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  stream_id: string;
  user_id?: string;
  message: string;
  message_type: 'text' | 'emoji' | 'reaction' | 'system';
  is_moderated: boolean;
  timestamp: string;
  user?: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface UseStreamingReturn {
  // Stream management
  streams: Stream[];
  currentStream: Stream | null;
  loading: boolean;
  error: string | null;
  
  // Stream operations
  fetchStreams: (filters?: any) => Promise<void>;
  fetchStream: (id: string) => Promise<void>;
  createStream: (data: Partial<Stream>) => Promise<Stream | null>;
  updateStream: (id: string, data: Partial<Stream>) => Promise<void>;
  deleteStream: (id: string) => Promise<void>;
  
  // Viewer operations
  joinStream: (streamId: string) => Promise<string | null>;
  leaveStream: (viewerId: string) => Promise<void>;
  
  // Chat operations
  messages: ChatMessage[];
  sendMessage: (streamId: string, message: string, type?: 'text' | 'emoji') => Promise<void>;
  
  // Real-time subscriptions
  subscribeToStream: (streamId: string) => () => void;
  subscribeToChat: (streamId: string) => () => void;
}

export function useStreaming(): UseStreamingReturn {
  const { user } = useAuth();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const subscriptionsRef = useRef<{ [key: string]: any }>({});
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token');

  // Fetch streams with optional filters
  const fetchStreams = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE}/streams?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStreams(data.data || []);
      } else {
        throw new Error('Failed to fetch streams');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch streams');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // Fetch single stream
  const fetchStream = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/streams/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCurrentStream(data.data);
      } else if (response.status === 404) {
        throw new Error('Stream not found');
      } else {
        throw new Error('Failed to fetch stream');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stream');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // Create new stream
  const createStream = useCallback(async (data: Partial<Stream>): Promise<Stream | null> => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/streams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        const newStream = result.data;
        setStreams(prev => [newStream, ...prev]);
        return newStream;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create stream');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stream');
      return null;
    }
  }, [API_BASE]);

  // Update stream
  const updateStream = useCallback(async (id: string, data: Partial<Stream>) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/streams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        const updatedStream = result.data;
        
        setStreams(prev => prev.map(s => s.id === id ? updatedStream : s));
        if (currentStream?.id === id) {
          setCurrentStream(updatedStream);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stream');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stream');
    }
  }, [API_BASE, currentStream]);

  // Delete stream
  const deleteStream = useCallback(async (id: string) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/streams/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        setStreams(prev => prev.filter(s => s.id !== id));
        if (currentStream?.id === id) {
          setCurrentStream(null);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete stream');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete stream');
    }
  }, [API_BASE, currentStream]);

  // Join stream as viewer
  const joinStream = useCallback(async (streamId: string): Promise<string | null> => {
    try {
      const deviceInfo = {
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'
      };

      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ device_info: deviceInfo })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.viewer_id;
      }
    } catch (err) {
      console.error('Error joining stream:', err);
    }
    return null;
  }, [API_BASE]);

  // Leave stream
  const leaveStream = useCallback(async (viewerId: string) => {
    try {
      await fetch(`${API_BASE}/stream-chat/${currentStream?.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ viewer_id: viewerId })
      });
    } catch (err) {
      console.error('Error leaving stream:', err);
    }
  }, [API_BASE, currentStream]);

  // Send chat message
  const sendMessage = useCallback(async (streamId: string, message: string, type: 'text' | 'emoji' = 'text') => {
    if (!user || !message.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          message: message.trim(),
          message_type: type
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [API_BASE, user]);

  // Subscribe to stream updates
  const subscribeToStream = useCallback((streamId: string) => {
    const channel = supabase
      .channel(`stream:${streamId}`)
      .on('broadcast', { event: 'viewer_joined' }, (payload) => {
        if (currentStream?.id === streamId) {
          setCurrentStream(prev => prev ? {
            ...prev,
            viewer_count: payload.payload.viewer_count
          } : null);
        }
      })
      .on('broadcast', { event: 'viewer_left' }, (payload) => {
        if (currentStream?.id === streamId) {
          setCurrentStream(prev => prev ? {
            ...prev,
            viewer_count: Math.max(0, prev.viewer_count - 1)
          } : null);
        }
      })
      .on('broadcast', { event: 'stream_started' }, (payload) => {
        setStreams(prev => prev.map(s => 
          s.id === streamId ? { ...s, status: 'live' as const } : s
        ));
      })
      .on('broadcast', { event: 'stream_ended' }, (payload) => {
        setStreams(prev => prev.map(s => 
          s.id === streamId ? { ...s, status: 'ended' as const } : s
        ));
      })
      .subscribe();

    subscriptionsRef.current[`stream:${streamId}`] = channel;

    return () => {
      supabase.removeChannel(channel);
      delete subscriptionsRef.current[`stream:${streamId}`];
    };
  }, [currentStream]);

  // Subscribe to chat messages
  const subscribeToChat = useCallback((streamId: string) => {
    const channel = supabase
      .channel(`stream:${streamId}:chat`)
      .on('broadcast', { event: 'chat_message' }, (payload) => {
        const newMessage = payload.payload as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
      })
      .on('broadcast', { event: 'message_moderated' }, (payload) => {
        const { message_id } = payload.payload;
        setMessages(prev => prev.map(msg => 
          msg.id === message_id 
            ? { ...msg, is_moderated: true, message: '[Message removed by moderator]' }
            : msg
        ));
      })
      .subscribe();

    subscriptionsRef.current[`chat:${streamId}`] = channel;

    return () => {
      supabase.removeChannel(channel);
      delete subscriptionsRef.current[`chat:${streamId}`];
    };
  }, []);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      Object.values(subscriptionsRef.current).forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return {
    // State
    streams,
    currentStream,
    messages,
    loading,
    error,
    
    // Stream operations
    fetchStreams,
    fetchStream,
    createStream,
    updateStream,
    deleteStream,
    
    // Viewer operations
    joinStream,
    leaveStream,
    
    // Chat operations
    sendMessage,
    
    // Real-time subscriptions
    subscribeToStream,
    subscribeToChat
  };
}

export default useStreaming;
