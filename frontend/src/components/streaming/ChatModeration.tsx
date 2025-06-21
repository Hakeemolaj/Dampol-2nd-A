'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  NoSymbolIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  ClockIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
  id: string;
  stream_id: string;
  user_id?: string;
  message: string;
  message_type: 'text' | 'emoji' | 'reaction' | 'system';
  is_moderated: boolean;
  moderated_by?: string;
  moderated_at?: string;
  moderation_reason?: string;
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

interface ChatModerationProps {
  streamId: string;
  className?: string;
}

export default function ChatModeration({ streamId, className = '' }: ChatModerationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [moderationReason, setModerationReason] = useState('');
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'moderated'>('all');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchMessages();
    // Set up real-time subscription for new messages
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [streamId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/messages?limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allMessages = data.data || [];
        setMessages(allMessages);
        
        // Filter flagged messages (you can implement auto-flagging logic here)
        const flagged = allMessages.filter((msg: ChatMessage) => 
          !msg.is_moderated && containsInappropriateContent(msg.message)
        );
        setFlaggedMessages(flagged);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple content filtering (in production, use more sophisticated AI/ML)
  const containsInappropriateContent = (message: string): boolean => {
    const inappropriateWords = [
      'spam', 'scam', 'fake', 'inappropriate', 'offensive'
      // Add more words as needed
    ];
    
    const lowerMessage = message.toLowerCase();
    return inappropriateWords.some(word => lowerMessage.includes(word));
  };

  const moderateMessage = async (messageId: string, reason: string) => {
    try {
      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/messages/${messageId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_moderated: true, moderation_reason: reason }
            : msg
        ));
        setFlaggedMessages(prev => prev.filter(msg => msg.id !== messageId));
        setShowModerationModal(false);
        setSelectedMessage(null);
        setModerationReason('');
      }
    } catch (error) {
      console.error('Error moderating message:', error);
    }
  };

  const handleModerateClick = (message: ChatMessage) => {
    setSelectedMessage(message);
    setShowModerationModal(true);
  };

  const getFilteredMessages = () => {
    switch (filter) {
      case 'flagged':
        return flaggedMessages;
      case 'moderated':
        return messages.filter(msg => msg.is_moderated);
      default:
        return messages;
    }
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Chat Moderation</h3>
        </div>
        <div className="p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Chat Moderation</h3>
          <div className="flex items-center gap-2">
            {flaggedMessages.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {flaggedMessages.length} flagged
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'flagged' 
                ? 'bg-red-100 text-red-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Flagged ({flaggedMessages.length})
          </button>
          <button
            onClick={() => setFilter('moderated')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'moderated' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Moderated ({messages.filter(m => m.is_moderated).length})
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-h-96 overflow-y-auto">
        {getFilteredMessages().length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages to moderate</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {getFilteredMessages().map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-gray-50 ${
                  message.is_moderated ? 'bg-yellow-50' : 
                  flaggedMessages.some(f => f.id === message.id) ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {getUserDisplayName(message)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {formatTime(message.timestamp)}
                      </span>
                      {flaggedMessages.some(f => f.id === message.id) && (
                        <FlagIcon className="h-4 w-4 text-red-500" title="Flagged content" />
                      )}
                      {message.is_moderated && (
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" title="Moderated" />
                      )}
                    </div>
                    
                    <div className={`text-sm ${
                      message.is_moderated ? 'text-gray-400 italic' : 'text-gray-700'
                    }`}>
                      {message.message_type === 'emoji' ? (
                        <span className="text-lg">{message.message}</span>
                      ) : (
                        message.message
                      )}
                    </div>

                    {message.is_moderated && message.moderation_reason && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Reason: {message.moderation_reason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    {!message.is_moderated && (
                      <button
                        onClick={() => handleModerateClick(message)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Moderate message"
                      >
                        <NoSymbolIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                      title="View user profile"
                    >
                      <UserIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      {showModerationModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Moderate Message</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {getUserDisplayName(selectedMessage)}
              </div>
              <div className="text-sm text-gray-700">
                {selectedMessage.message}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for moderation
              </label>
              <select
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a reason</option>
                <option value="inappropriate_content">Inappropriate content</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="off_topic">Off topic</option>
                <option value="misinformation">Misinformation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {moderationReason === 'other' && (
              <div className="mb-4">
                <textarea
                  placeholder="Please specify the reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  onChange={(e) => setModerationReason(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModerationModal(false);
                  setSelectedMessage(null);
                  setModerationReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => moderateMessage(selectedMessage.id, moderationReason)}
                disabled={!moderationReason}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Moderate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
