'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressTimeline, CompactProgressTimeline, type TimelineStep } from '@/components/ui/progress-timeline'

interface DocumentRequest {
  id: string
  type: string
  status: string
  submittedAt?: string // Support both formats
  submittedDate?: string
  updatedAt?: string
  estimatedCompletion?: string
  expectedDate?: string
  fee: string | number // Support both formats
  purpose: string
  progress?: number
  applicantName?: string
  contactNumber?: string
  email?: string
  trackingNumber?: string
  applicant?: {
    name: string
    address: string
    contact: string
  }
  documents?: {
    name: string
    status?: 'verified' | 'pending' | 'missing'
    url?: string
    uploadedAt?: string
    uploadedDate?: string
  }[]
  timeline?: TimelineStep[]
  notes?: string | string[]
  paymentStatus?: 'paid' | 'pending' | 'overdue' | 'unpaid' | 'refunded'
  pickupLocation?: string
  contactPerson?: string
}

interface DocumentDetailModalProps {
  request: DocumentRequest | null
  isOpen: boolean
  onClose: () => void
  onAction?: (action: string, requestId: string) => void
}

export function DocumentDetailModal({ 
  request, 
  isOpen, 
  onClose, 
  onAction 
}: DocumentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'history'>('overview')

  if (!isOpen || !request) return null

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
    'Processing': 'bg-orange-100 text-orange-800 border-orange-200',
    'Ready for Pickup': 'bg-green-100 text-green-800 border-green-200',
    'Completed': 'bg-gray-100 text-gray-800 border-gray-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
  }

  const paymentStatusColors = {
    'paid': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
    'unpaid': 'bg-red-100 text-red-800',
    'refunded': 'bg-gray-100 text-gray-800',
  }

  const documentStatusColors = {
    'verified': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'missing': 'bg-red-100 text-red-800',
  }

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action, request.id)
    }
  }

  const defaultTimeline: TimelineStep[] = [
    {
      id: '1',
      title: 'Request Submitted',
      description: 'Your document request has been received and is being reviewed.',
      status: 'completed',
      timestamp: request.submittedDate,
      assignedTo: 'System',
    },
    {
      id: '2',
      title: 'Initial Review',
      description: 'Staff is reviewing your request and required documents.',
      status: request.status === 'Pending' ? 'current' : 'completed',
      estimatedTime: '1-2 business days',
      assignedTo: 'Document Officer',
    },
    {
      id: '3',
      title: 'Document Processing',
      description: 'Your document is being prepared and processed.',
      status: request.status === 'Processing' ? 'current' : 
              ['Ready for Pickup', 'Completed'].includes(request.status) ? 'completed' : 'pending',
      estimatedTime: '2-3 business days',
      assignedTo: 'Processing Team',
    },
    {
      id: '4',
      title: 'Quality Check',
      description: 'Final review and quality assurance of the processed document.',
      status: request.status === 'Ready for Pickup' ? 'current' : 
              request.status === 'Completed' ? 'completed' : 'pending',
      estimatedTime: '1 business day',
      assignedTo: 'QA Officer',
    },
    {
      id: '5',
      title: 'Ready for Release',
      description: 'Document is ready for pickup or delivery.',
      status: request.status === 'Completed' ? 'completed' : 'pending',
      estimatedTime: 'Upon completion',
      assignedTo: 'Release Officer',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                📄 {request.type}
              </CardTitle>
              <CardDescription className="mt-1">
                Request ID: <span className="font-mono font-medium">{request.id}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[request.status as keyof typeof statusColors]}`}>
                {request.status}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClose}
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-2 sm:space-x-8 px-3 sm:px-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'timeline', label: 'Timeline', icon: '📅' },
              { id: 'documents', label: 'Documents', icon: '📎' },
              { id: 'history', label: 'History', icon: '📜' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="sm:hidden">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.icon} {tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <CardContent className="p-3 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">Submitted</h4>
                  <p className="text-lg font-semibold">
                    {new Date(request.submittedAt || request.submittedDate || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">Expected</h4>
                  <p className="text-lg font-semibold">
                    {new Date(request.estimatedCompletion || request.expectedDate || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">Fee</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-primary-600">
                    {typeof request.fee === 'number' ? `₱${request.fee}` : request.fee}
                  </p>
                    {request.paymentStatus && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[request.paymentStatus as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {request.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Purpose</h4>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{request.purpose}</p>
              </div>

              {/* Applicant Info */}
              {request.applicant && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Applicant Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Name:</span> {request.applicant.name}</p>
                    <p><span className="font-medium">Address:</span> {request.applicant.address}</p>
                    <p><span className="font-medium">Contact:</span> {request.applicant.contact}</p>
                  </div>
                </div>
              )}

              {/* Compact Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Progress</h4>
                <CompactProgressTimeline steps={request.timeline || defaultTimeline} />
              </div>

              {/* Contact Info */}
              {(request.contactPerson || request.pickupLocation) && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">📞 Contact Information</h4>
                  {request.contactPerson && (
                    <p className="text-blue-800 text-sm">Contact Person: {request.contactPerson}</p>
                  )}
                  {request.pickupLocation && (
                    <p className="text-blue-800 text-sm">Pickup Location: {request.pickupLocation}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <ProgressTimeline 
              steps={request.timeline || defaultTimeline}
              showEstimates={true}
            />
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Required Documents</h4>
              {request.documents && request.documents.length > 0 ? (
                <div className="space-y-3">
                  {request.documents.map((doc, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        {doc.uploadedDate && (
                          <p className="text-sm text-gray-600">Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${doc.status ? documentStatusColors[doc.status as keyof typeof documentStatusColors] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                        {doc.status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No additional documents required.</p>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Request History</h4>
              {request.notes ? (
                <div className="space-y-3">
                  {(Array.isArray(request.notes) ? request.notes : [request.notes]).map((note: string, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{note}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {new Date().toLocaleDateString()} - System Update
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No history available.</p>
              )}
            </div>
          )}
        </CardContent>

        {/* Action Buttons */}
        <div className="border-t p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {request.status === 'Ready for Pickup' && (
              <Button 
                onClick={() => handleAction('schedule-pickup')}
                className="flex-1"
              >
                📅 Schedule Pickup
              </Button>
            )}
            {(request.status === 'Pending' || request.status === 'Under Review') && (
              <Button 
                variant="outline"
                onClick={() => handleAction('edit-request')}
                className="flex-1"
              >
                ✏️ Edit Request
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => handleAction('download-receipt')}
              className="flex-1"
            >
              📄 Download Receipt
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleAction('contact-support')}
              className="flex-1"
            >
              💬 Contact Support
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export type { DocumentRequest }
