'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useSupabase';
import { 
  PaperAirplaneIcon, 
  FaceSmileIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
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

interface StreamChatProps {
  streamId: string;
  isLive: boolean;
  className?: string;
  maxHeight?: string;
}

export default function StreamChat({ 
  streamId, 
  isLive, 
  className = '',
  maxHeight = 'h-96'
}: StreamChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  // Common emojis for quick reactions
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉', '🔥', '💯'];

  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();
  }, [streamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/messages?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`stream:${streamId}`)
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

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (message: string, messageType: 'text' | 'emoji' = 'text') => {
    if (!user || !message.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: message.trim(),
          message_type: messageType
        })
      });

      if (response.ok) {
        setNewMessage('');
        setShowEmojiPicker(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleEmojiClick = (emoji: string) => {
    sendMessage(emoji, 'emoji');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (message: ChatMessage) => {
    if (message.user?.user_metadata?.full_name) {
      return message.user.user_metadata.full_name;
    }
    if (message.user?.email) {
      return message.user.email.split('@')[0];
    }
    return 'Anonymous';
  };

  const getUserInitials = (message: ChatMessage) => {
    const name = getUserDisplayName(message);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Live Chat</h3>
        </div>
        <div className="p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow flex flex-col ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Live Chat</h3>
          {isLive && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">LIVE</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {messages.length} messages
        </div>
      </div>

      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${maxHeight}`}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.user?.user_metadata?.avatar_url ? (
                  <img
                    src={message.user.user_metadata.avatar_url}
                    alt={getUserDisplayName(message)}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {getUserInitials(message)}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {getUserDisplayName(message)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {formatTime(message.timestamp)}
                  </span>
                  {message.is_moderated && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" title="Moderated message" />
                  )}
                </div>
                
                <div className={`text-sm ${message.is_moderated ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                  {message.message_type === 'emoji' ? (
                    <span className="text-2xl">{message.message}</span>
                  ) : message.message_type === 'system' ? (
                    <span className="text-blue-600 font-medium">{message.message}</span>
                  ) : (
                    message.message
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Chat Input */}
      {isLive ? (
        user ? (
          <div className="p-4 border-t border-gray-200">
            {/* Quick Emoji Reactions */}
            <div className="flex gap-1 mb-3 overflow-x-auto">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="flex-shrink-0 p-2 hover:bg-gray-100 rounded text-lg"
                  disabled={sending}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                  disabled={sending}
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaceSmileIcon className="h-5 w-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4" />
                )}
              </button>
            </form>

            <div className="text-xs text-gray-500 mt-2">
              Press Enter to send • {500 - newMessage.length} characters remaining
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-2">Please log in to participate in chat</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Sign In
            </button>
          </div>
        )
      ) : (
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-gray-500">Chat is only available during live streams</p>
        </div>
      )}
    </div>
  );
}
