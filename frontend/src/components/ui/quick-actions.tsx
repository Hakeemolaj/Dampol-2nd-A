'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface QuickAction {
  id: string
  label: string
  icon: string
  description: string
  action: () => void
  variant?: 'default' | 'outline' | 'secondary'
  disabled?: boolean
  badge?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
  layout?: 'grid' | 'list' | 'compact'
}

export function QuickActions({ 
  actions, 
  title = "Quick Actions", 
  layout = 'grid' 
}: QuickActionsProps) {
  if (layout === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.action}
            disabled={action.disabled}
            className="relative"
            title={action.description}
          >
            {action.icon} {action.label}
            {action.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </Button>
        ))}
      </div>
    )
  }

  if (layout === 'list') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              onClick={action.action}
              disabled={action.disabled}
              className="w-full justify-start relative"
            >
              <span className="mr-3 text-lg">{action.icon}</span>
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
              {action.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Grid layout (default)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              onClick={action.action}
              disabled={action.disabled}
              className="h-auto p-4 flex flex-col items-center space-y-2 relative"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-center">{action.label}</span>
              {action.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized quick actions for document tracking
export function DocumentQuickActions({ 
  requestId, 
  status, 
  onAction 
}: { 
  requestId: string
  status: string
  onAction: (action: string, requestId: string) => void 
}) {
  const getActionsForStatus = (status: string): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'view-details',
        label: 'View Details',
        icon: '👁️',
        description: 'View complete request information',
        action: () => onAction('view-details', requestId),
      },
      {
        id: 'download-receipt',
        label: 'Receipt',
        icon: '📄',
        description: 'Download request receipt',
        action: () => onAction('download-receipt', requestId),
      },
      {
        id: 'contact-support',
        label: 'Support',
        icon: '💬',
        description: 'Contact customer support',
        action: () => onAction('contact-support', requestId),
      },
    ]

    switch (status) {
      case 'Pending':
      case 'Under Review':
        return [
          ...baseActions,
          {
            id: 'edit-request',
            label: 'Edit',
            icon: '✏️',
            description: 'Edit request details',
            action: () => onAction('edit-request', requestId),
          },
          {
            id: 'cancel-request',
            label: 'Cancel',
            icon: '❌',
            description: 'Cancel this request',
            action: () => onAction('cancel-request', requestId),
            variant: 'outline',
          },
        ]

      case 'Processing':
        return [
          ...baseActions,
          {
            id: 'track-progress',
            label: 'Track',
            icon: '📍',
            description: 'Track processing progress',
            action: () => onAction('track-progress', requestId),
          },
          {
            id: 'upload-documents',
            label: 'Upload',
            icon: '📎',
            description: 'Upload additional documents',
            action: () => onAction('upload-documents', requestId),
          },
        ]

      case 'Ready for Pickup':
        return [
          ...baseActions,
          {
            id: 'schedule-pickup',
            label: 'Schedule',
            icon: '📅',
            description: 'Schedule document pickup',
            action: () => onAction('schedule-pickup', requestId),
            variant: 'default',
          },
          {
            id: 'pickup-info',
            label: 'Pickup Info',
            icon: '📍',
            description: 'View pickup location and hours',
            action: () => onAction('pickup-info', requestId),
          },
        ]

      case 'Completed':
        return [
          ...baseActions,
          {
            id: 'download-document',
            label: 'Download',
            icon: '⬇️',
            description: 'Download completed document',
            action: () => onAction('download-document', requestId),
            variant: 'default',
          },
          {
            id: 'rate-service',
            label: 'Rate',
            icon: '⭐',
            description: 'Rate our service',
            action: () => onAction('rate-service', requestId),
          },
        ]

      default:
        return baseActions
    }
  }

  return (
    <QuickActions 
      actions={getActionsForStatus(status)}
      title="Available Actions"
      layout="compact"
    />
  )
}

// Quick search and filter component
export function QuickSearch({ 
  onSearch, 
  onFilter, 
  filters = [],
  placeholder = "Search requests..." 
}: {
  onSearch: (term: string) => void
  onFilter: (filter: string) => void
  filters?: { value: string; label: string }[]
  placeholder?: string
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onSearch(value)
  }

  const handleFilter = (value: string) => {
    setSelectedFilter(value)
    onFilter(value)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          {filters.length > 0 && (
            <div className="sm:w-48">
              <select
                value={selectedFilter}
                onChange={(e) => handleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                {filters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Emergency contact quick actions
export function EmergencyActions() {
  const emergencyActions: QuickAction[] = [
    {
      id: 'call-barangay',
      label: 'Call Office',
      icon: '📞',
      description: 'Call barangay office directly',
      action: () => window.open('tel:+639171234567'),
      variant: 'default',
    },
    {
      id: 'emergency-hotline',
      label: 'Emergency',
      icon: '🚨',
      description: 'Emergency hotline',
      action: () => window.open('tel:911'),
      variant: 'default',
    },
    {
      id: 'text-support',
      label: 'Text Support',
      icon: '💬',
      description: 'Send SMS to support',
      action: () => window.open('sms:+639171234567'),
    },
    {
      id: 'email-support',
      label: 'Email',
      icon: '📧',
      description: 'Send email to office',
      action: () => window.open('mailto:dampol2nda@pulilan.gov.ph'),
    },
  ]

  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          🚨 Emergency Contact
        </CardTitle>
        <CardDescription className="text-red-700">
          Need immediate assistance? Use these quick contact options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {emergencyActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              onClick={action.action}
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export type { QuickAction }
