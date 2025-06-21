'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useSupabase';
import { 
  PaperAirplaneIcon, 
  FaceSmileIcon, 
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  HeartIcon
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

interface MobileStreamChatProps {
  streamId: string;
  isLive: boolean;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

export default function MobileStreamChat({ 
  streamId, 
  isLive, 
  isVisible,
  onClose,
  className = ''
}: MobileStreamChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  // Mobile-optimized emoji set
  const quickEmojis = ['👍', '❤️', '😂', '😮', '👏', '🔥'];
  const emojiCategories = {
    reactions: ['👍', '👎', '❤️', '😍', '😂', '😮', '😢', '😡'],
    gestures: ['👏', '🙌', '👋', '✋', '👌', '✌️', '🤝', '🙏'],
    symbols: ['🔥', '💯', '⭐', '✨', '💪', '🎉', '🎊', '🚀']
  };

  useEffect(() => {
    if (isVisible) {
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [streamId, isVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input when chat opens on mobile
  useEffect(() => {
    if (isVisible && !isMinimized && inputRef.current) {
      // Delay to ensure proper rendering
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isVisible, isMinimized]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/messages?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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
            ? { ...msg, is_moderated: true, message: '[Message removed]' }
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
      }
    } catch (error) {
      console.error('Error sending message:', error);
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

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 ${className}`}>
      <div className={`absolute bottom-0 left-0 right-0 bg-white transition-transform duration-300 ${
        isMinimized ? 'translate-y-[calc(100%-4rem)]' : 'translate-y-0'
      }`} style={{ height: isMinimized ? '4rem' : '70vh' }}>
        
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDownIcon className={`h-5 w-5 text-gray-600 transition-transform ${
                isMinimized ? 'rotate-180' : ''
              }`} />
            </button>
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
            {isLive && (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">LIVE</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ height: 'calc(70vh - 8rem)' }}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Be the first to say something!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-2">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.user?.user_metadata?.avatar_url ? (
                        <img
                          src={message.user.user_metadata.avatar_url}
                          alt={getUserDisplayName(message)}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {getUserInitials(message)}
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs text-gray-900 truncate">
                          {getUserDisplayName(message)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      
                      <div className={`text-sm ${message.is_moderated ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                        {message.message_type === 'emoji' ? (
                          <span className="text-xl">{message.message}</span>
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

            {/* Quick Emoji Reactions */}
            <div className="px-3 py-2 border-t border-gray-100">
              <div className="flex gap-2 overflow-x-auto">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 rounded text-lg"
                    disabled={sending || !user}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex-shrink-0 p-2 hover:bg-gray-100 rounded"
                >
                  <FaceSmileIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="border-t border-gray-200 bg-gray-50 p-3">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category} className="mb-3">
                    <div className="text-xs font-medium text-gray-600 mb-2 capitalize">{category}</div>
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(emoji)}
                          className="p-2 hover:bg-gray-200 rounded text-lg"
                          disabled={sending || !user}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message Input */}
            {isLive ? (
              user ? (
                <div className="p-3 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      maxLength={500}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <PaperAirplaneIcon className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {500 - newMessage.length} characters remaining
                  </div>
                </div>
              ) : (
                <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
                  <p className="text-gray-600 text-sm mb-2">Please log in to participate in chat</p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Sign In
                  </button>
                </div>
              )
            ) : (
              <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
                <p className="text-gray-500 text-sm">Chat is only available during live streams</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
