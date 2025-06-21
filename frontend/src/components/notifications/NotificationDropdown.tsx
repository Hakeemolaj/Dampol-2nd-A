'use client';

import React from 'react';
import { 
  CheckCheck, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Info, 
  Settings,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

const priorityColors = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const priorityIcons = {
  low: Info,
  normal: Info,
  high: AlertTriangle,
  urgent: AlertTriangle,
};

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    loadMore,
    hasMore,
  } = useNotifications();

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await markAsRead(id);
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await refreshNotifications();
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-6 h-6 mx-auto text-red-400 mb-2" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-hidden flex flex-col">
      {/* Actions Bar */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-500 hover:text-gray-700 rounded"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          
          <button
            onClick={() => {/* TODO: Open settings */}}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Notification Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No notifications</p>
            <p className="text-gray-400 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const PriorityIcon = priorityIcons[notification.priority];
              const isUnread = !notification.is_read;
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => !isUnread && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Priority Icon */}
                    <div className={`flex-shrink-0 mt-1 ${priorityColors[notification.priority]}`}>
                      <PriorityIcon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          isUnread ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-2">
                          {isUnread && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                              title="Mark as read"
                            >
                              <CheckCheck className="w-3 h-3" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-sm mt-1 ${
                        isUnread ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {notification.message}
                      </p>

                      {/* Timestamp */}
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>{loading ? 'Loading...' : 'Load more'}</span>
          </button>
        </div>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
}
