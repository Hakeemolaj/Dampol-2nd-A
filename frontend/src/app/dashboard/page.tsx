'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DocumentDetailModal, type DocumentRequest } from '@/components/ui/document-detail-modal'
import { NotificationPanel, NotificationToast, type Notification } from '@/components/ui/notification-system'
import { DocumentQuickActions, QuickSearch, EmergencyActions } from '@/components/ui/quick-actions'
import { CompactProgressTimeline, type TimelineStep } from '@/components/ui/progress-timeline'
import ExportPrintActions from '@/components/ui/export-print'
import { useAuth } from '@/hooks/use-auth'
import documentService from '@/services/documentService'
import { announcementsApi } from '@/lib/api'

// Enhanced mock data with detailed information
const mockRequests: DocumentRequest[] = [
  {
    id: 'REQ-2025-001',
    type: 'Barangay Clearance',
    status: 'Processing',
    submittedDate: '2025-01-15',
    expectedDate: '2025-01-17',
    fee: '₱50.00',
    purpose: 'Employment application',
    progress: 60,
    applicant: {
      name: 'Juan Dela Cruz',
      address: 'Block 1, Lot 15, Dampol 2nd A',
      contact: '09171234567'
    },
    documents: [
      { name: 'Valid ID', status: 'verified', uploadedDate: '2025-01-15' },
      { name: 'Proof of Residency', status: 'verified', uploadedDate: '2025-01-15' }
    ],
    paymentStatus: 'paid',
    contactPerson: 'Maria Santos',
    pickupLocation: 'Barangay Hall - Document Window'
  },
  {
    id: 'REQ-2025-002',
    type: 'Certificate of Residency',
    status: 'Ready for Pickup',
    submittedDate: '2025-01-14',
    expectedDate: '2025-01-15',
    fee: '₱30.00',
    purpose: 'School enrollment',
    progress: 100,
    applicant: {
      name: 'Maria Garcia',
      address: 'Block 2, Lot 8, Dampol 2nd A',
      contact: '09181234567'
    },
    documents: [
      { name: 'Birth Certificate', status: 'verified', uploadedDate: '2025-01-14' },
      { name: 'Valid ID', status: 'verified', uploadedDate: '2025-01-14' }
    ],
    paymentStatus: 'paid',
    contactPerson: 'Jose Reyes',
    pickupLocation: 'Barangay Hall - Document Window'
  },
  {
    id: 'REQ-2025-003',
    type: 'Business Permit',
    status: 'Under Review',
    submittedDate: '2025-01-12',
    expectedDate: '2025-01-19',
    fee: '₱100.00',
    purpose: 'Sari-sari store operation',
    progress: 30,
    applicant: {
      name: 'Pedro Santos',
      address: 'Block 3, Lot 12, Dampol 2nd A',
      contact: '09191234567'
    },
    documents: [
      { name: 'Business Plan', status: 'verified', uploadedDate: '2025-01-12' },
      { name: 'Location Sketch', status: 'pending', uploadedDate: '2025-01-12' },
      { name: 'Barangay Clearance', status: 'missing' }
    ],
    paymentStatus: 'pending',
    contactPerson: 'Ana Cruz',
    notes: ['Additional documents required for business permit approval']
  },
]

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'success',
    title: 'Document Ready for Pickup',
    message: 'Your Certificate of Residency (REQ-2025-002) is ready for pickup at the Barangay Hall.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    read: false,
    priority: 'high',
    actionLabel: 'Schedule Pickup',
    requestId: 'REQ-2025-002'
  },
  {
    id: 'notif-002',
    type: 'update',
    title: 'Processing Update',
    message: 'Your Barangay Clearance (REQ-2025-001) is currently being processed by our team.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    priority: 'medium',
    actionLabel: 'View Progress',
    requestId: 'REQ-2025-001'
  },
  {
    id: 'notif-003',
    type: 'warning',
    title: 'Additional Documents Required',
    message: 'Your Business Permit application needs additional documents. Please upload the missing requirements.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: true,
    priority: 'high',
    actionLabel: 'Upload Documents',
    requestId: 'REQ-2025-003'
  }
]

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
  'Processing': 'bg-orange-100 text-orange-800 border-orange-200',
  'Ready for Pickup': 'bg-green-100 text-green-800 border-green-200',
  'Completed': 'bg-gray-100 text-gray-800 border-gray-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
}

const statusIcons = {
  'Pending': '⏳',
  'Under Review': '👀',
  'Processing': '⚙️',
  'Ready for Pickup': '✅',
  'Completed': '📋',
  'Rejected': '❌',
}

export default function DashboardPage() {
  const [requests, setRequests] = useState(mockRequests)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null)
  const [toastNotification, setToastNotification] = useState<Notification | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0
  })

  const { user } = useAuth()

  // Load real data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load document requests (fallback to mock if API fails)
      try {
        const requestsResponse = await documentService.getUserRequests()
        if (requestsResponse.success && requestsResponse.data.length > 0) {
          setRequests(requestsResponse.data)
        }
      } catch (error) {
        console.log('Using mock data for document requests')
      }

      // Load announcements
      try {
        const announcementsResponse = await announcementsApi.getAll({ limit: 5 })
        if (announcementsResponse.status === 'success') {
          setAnnouncements(announcementsResponse.data.announcements)
        }
      } catch (error) {
        console.log('Failed to load announcements')
      }

      // Load stats
      try {
        const statsResponse = await documentService.getRequestStats()
        if (statsResponse.success) {
          setStats(statsResponse.data)
        }
      } catch (error) {
        console.log('Using mock stats')
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      // Reload data periodically
      loadDashboardData()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 60) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const handleNotificationAction = (notification: Notification) => {
    if (notification.requestId) {
      const request = requests.find(r => r.id === notification.requestId)
      if (request) {
        setSelectedRequest(request)
      }
    }
    handleMarkAsRead(notification.id)
  }

  // Quick action handlers
  const handleQuickAction = (action: string, requestId: string) => {
    const request = requests.find(r => r.id === requestId)

    switch (action) {
      case 'view-details':
        setSelectedRequest(request || null)
        break
      case 'schedule-pickup':
        // Simulate scheduling pickup
        setToastNotification({
          id: 'toast-pickup',
          type: 'success',
          title: 'Pickup Scheduled',
          message: `Pickup scheduled for ${request?.type} on tomorrow at 10:00 AM`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium'
        })
        break
      case 'download-receipt':
        // Simulate download
        setToastNotification({
          id: 'toast-download',
          type: 'info',
          title: 'Download Started',
          message: 'Your receipt is being downloaded...',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'low'
        })
        break
      case 'contact-support':
        // Open contact modal or redirect
        window.open('tel:+639171234567')
        break
      default:
        console.log(`Action ${action} for request ${requestId}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your document requests and applications
            <span className="text-xs text-gray-500 ml-2">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationPanel
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onAction={handleNotificationAction}
          />
          <Button asChild>
            <Link href="/services">
              📄 New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'Processing' || r.status === 'Under Review').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'Ready for Pickup').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-2xl">📄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'Completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <Card className="government-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📢 Recent Announcements
            </CardTitle>
            <CardDescription>
              Stay updated with the latest barangay news and announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-primary-500 pl-4 py-2">
                  <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button variant="outline" asChild className="w-full">
                <Link href="/announcements">
                  View All Announcements
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Search and Filters */}
      <QuickSearch
        onSearch={setSearchTerm}
        onFilter={setFilterStatus}
        filters={[
          { value: 'Pending', label: 'Pending' },
          { value: 'Under Review', label: 'Under Review' },
          { value: 'Processing', label: 'Processing' },
          { value: 'Ready for Pickup', label: 'Ready for Pickup' },
          { value: 'Completed', label: 'Completed' },
        ]}
        placeholder="Search by request ID, document type, or purpose..."
      />

      {/* Requests List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">My Requests</h2>
        
        {filteredRequests.length === 0 ? (
          <Card className="government-card">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You haven\'t submitted any document requests yet.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button asChild>
                  <Link href="/services">
                    Submit Your First Request
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="government-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">{statusIcons[request.status as keyof typeof statusIcons]}</span>
                        {request.type}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Request ID: <span className="font-mono font-medium">{request.id}</span>
                      </CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[request.status as keyof typeof statusColors]}`}>
                      {request.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <p className="font-medium">{new Date(request.submittedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected:</span>
                      <p className="font-medium">{new Date(request.expectedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fee:</span>
                      <p className="font-medium text-primary-600">{request.fee}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-600 text-sm">Purpose:</span>
                    <p className="font-medium">{request.purpose}</p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{request.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(request.progress)}`}
                        style={{ width: `${request.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Compact Progress Timeline */}
                  <div>
                    <span className="text-gray-600 text-sm mb-2 block">Progress Timeline:</span>
                    <CompactProgressTimeline
                      steps={request.timeline || [
                        { id: '1', title: 'Submitted', description: '', status: 'completed' },
                        { id: '2', title: 'Review', description: '', status: request.status === 'Pending' ? 'current' : 'completed' },
                        { id: '3', title: 'Processing', description: '', status: request.status === 'Processing' ? 'current' : ['Ready for Pickup', 'Completed'].includes(request.status) ? 'completed' : 'pending' },
                        { id: '4', title: 'Ready', description: '', status: request.status === 'Ready for Pickup' ? 'current' : request.status === 'Completed' ? 'completed' : 'pending' },
                        { id: '5', title: 'Complete', description: '', status: request.status === 'Completed' ? 'completed' : 'pending' }
                      ]}
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-2">
                    <DocumentQuickActions
                      requestId={request.id}
                      status={request.status}
                      onAction={handleQuickAction}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Export and Print Section */}
      <ExportPrintActions
        requests={requests}
        selectedRequest={selectedRequest}
      />

      {/* Emergency Contact Section */}
      <EmergencyActions />

      {/* Document Detail Modal */}
      <DocumentDetailModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onAction={handleQuickAction}
      />

      {/* Toast Notification */}
      {toastNotification && (
        <NotificationToast
          notification={toastNotification}
          onClose={() => setToastNotification(null)}
          onAction={handleNotificationAction}
        />
      )}
    </div>
  )
}
