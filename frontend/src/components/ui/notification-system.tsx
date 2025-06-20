'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'update'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  requestId?: string
  priority: 'low' | 'medium' | 'high'
}

interface NotificationSystemProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onAction: (notification: Notification) => void
}

export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function NotificationPanel({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onAction 
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'high':
        return notification.priority === 'high'
      default:
        return true
    }
  })

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'update':
        return '🔄'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    const baseColors = {
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      error: 'border-red-200 bg-red-50',
      update: 'border-blue-200 bg-blue-50',
      info: 'border-gray-200 bg-gray-50',
    }

    if (priority === 'high') {
      return `${baseColors[type]} ring-2 ring-red-200`
    }

    return baseColors[type]
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        🔔
        <NotificationBadge count={unreadCount} />
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-80 sm:max-h-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {[
                { id: 'all', label: 'All', count: notifications.length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'high', label: 'Priority', count: highPriorityCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="w-full"
                >
                  Mark All as Read
                </Button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-48 sm:max-h-64 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🔕</div>
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      getNotificationColor(notification.type, notification.priority)
                    } ${!notification.read ? 'font-medium' : 'opacity-75'}`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {/* Action Button */}
                        {notification.actionLabel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onAction(notification)
                            }}
                            className="mt-2"
                          >
                            {notification.actionLabel}
                          </Button>
                        )}

                        {/* Priority Indicator */}
                        {notification.priority === 'high' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                            High Priority
                          </span>
                        )}

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function NotificationToast({ 
  notification, 
  onClose, 
  onAction 
}: { 
  notification: Notification
  onClose: () => void
  onAction: (notification: Notification) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) // Auto-close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <Card className={`fixed bottom-4 right-4 w-72 sm:w-80 z-50 ${getNotificationColor(notification.type, notification.priority)}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <span className="text-lg flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            
            {notification.actionLabel && (
              <div className="flex space-x-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction(notification)}
                >
                  {notification.actionLabel}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0"
          >
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get notification colors
function getNotificationColor(type: Notification['type'], priority: Notification['priority']) {
  const baseColors = {
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    update: 'border-blue-200 bg-blue-50',
    info: 'border-gray-200 bg-gray-50',
  }

  if (priority === 'high') {
    return `${baseColors[type]} ring-2 ring-red-200`
  }

  return baseColors[type]
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'success':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    case 'update':
      return '🔄'
    default:
      return 'ℹ️'
  }
}

export type { Notification }
