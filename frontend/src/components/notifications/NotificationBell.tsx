'use client';

import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 sm:w-96">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dropdown Content */}
              <NotificationDropdown onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
