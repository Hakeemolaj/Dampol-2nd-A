'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import documentService from '@/services/documentService'
import { CompactProgressTimeline } from '@/components/ui/progress-timeline'

export default function TrackDocumentPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [documentRequest, setDocumentRequest] = useState<any>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number')
      return
    }

    setIsLoading(true)
    setError('')
    setDocumentRequest(null)

    try {
      const response = await documentService.trackRequest(trackingNumber.trim())
      
      if (response.success) {
        setDocumentRequest(response.data)
      } else {
        setError('Document request not found. Please check your tracking number.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to track document. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'under_review': 'bg-blue-100 text-blue-800 border-blue-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'ready_for_pickup': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-gray-100 text-gray-800 border-gray-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': '⏳',
      'under_review': '👀',
      'approved': '✅',
      'ready_for_pickup': '📦',
      'completed': '📋',
      'rejected': '❌',
    }
    return icons[status as keyof typeof icons] || '📄'
  }

  const getProgressSteps = (status: string): Array<{
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'pending' | 'skipped';
  }> => {
    const steps: Array<{
      id: string;
      title: string;
      description: string;
      status: 'completed' | 'current' | 'pending' | 'skipped';
    }> = [
      { id: '1', title: 'Submitted', description: 'Application received', status: 'completed' },
      { id: '2', title: 'Under Review', description: 'Documents being verified', status: 'pending' },
      { id: '3', title: 'Processing', description: 'Document being prepared', status: 'pending' },
      { id: '4', title: 'Ready for Pickup', description: 'Available at barangay hall', status: 'pending' },
      { id: '5', title: 'Completed', description: 'Document released', status: 'pending' }
    ]

    // Update step statuses based on current status
    switch (status) {
      case 'under_review':
        steps[1].status = 'current'
        break
      case 'approved':
      case 'processing':
        steps[1].status = 'completed'
        steps[2].status = 'current'
        break
      case 'ready_for_pickup':
        steps[1].status = 'completed'
        steps[2].status = 'completed'
        steps[3].status = 'current'
        break
      case 'completed':
        steps.forEach(step => step.status = 'completed')
        break
      case 'rejected':
        steps[1].status = 'skipped' // Use 'skipped' instead of 'error'
        break
    }

    return steps
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">🔍</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Document</h1>
          <p className="text-gray-600 mt-2">Enter your tracking number to check the status of your document request</p>
        </div>

        {/* Tracking Form */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-center">Document Tracking</CardTitle>
            <CardDescription className="text-center">
              Your tracking number was provided when you submitted your request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  type="text"
                  placeholder="e.g., TRK-001-2025"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                  disabled={isLoading}
                  leftIcon="🔍"
                />
                <p className="text-xs text-gray-600">
                  Format: TRK-XXX-YYYY (e.g., TRK-001-2025)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Tracking...' : 'Track Document'}
              </Button>
            </form>

            {/* Sample tracking numbers for demo */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Tracking Numbers:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>TRK-001-2025</strong> - Barangay Clearance (Processing)</p>
                <p><strong>TRK-002-2025</strong> - Certificate of Residency (Ready for Pickup)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Details */}
        {documentRequest && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon(documentRequest.status)}</span>
                    {documentRequest.type || 'Document Request'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Tracking Number: <span className="font-mono font-medium">{documentRequest.trackingNumber}</span>
                  </CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(documentRequest.status)}`}>
                  {documentRequest.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Request Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applicant:</span>
                        <span className="font-medium">{documentRequest.applicantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-medium">{documentRequest.contactNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purpose:</span>
                        <span className="font-medium">{documentRequest.purpose}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fee:</span>
                        <span className="font-medium text-primary-600">₱{documentRequest.fee}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">{new Date(documentRequest.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{new Date(documentRequest.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {documentRequest.estimatedCompletion && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Completion:</span>
                          <span className="font-medium">{new Date(documentRequest.estimatedCompletion).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Progress Status</h3>
                <CompactProgressTimeline steps={getProgressSteps(documentRequest.status)} />
              </div>

              {/* Notes */}
              {documentRequest.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">{documentRequest.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {documentRequest.status === 'ready_for_pickup' && (
                  <Button className="flex-1">
                    📍 Get Pickup Instructions
                  </Button>
                )}
                <Button variant="outline" className="flex-1">
                  📞 Contact Support
                </Button>
                <Button variant="outline" className="flex-1">
                  📧 Email Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-primary-600 font-medium"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
