'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Mock document requests with detailed workflow
const mockDocumentRequests = [
  {
    id: 'REQ-2025-001',
    type: 'Barangay Clearance',
    applicant: {
      name: 'Juan Dela Cruz',
      id: 'RES-001',
      address: 'Block 1, Lot 15, Dampol 2nd A',
      contact: '09171234567'
    },
    purpose: 'Employment application',
    submittedDate: '2025-01-15T08:30:00Z',
    expectedDate: '2025-01-17T17:00:00Z',
    fee: 50.00,
    status: 'Processing',
    priority: 'normal',
    workflow: {
      currentStep: 2,
      steps: [
        { id: 1, name: 'Application Received', completed: true, completedBy: 'Secretary', completedAt: '2025-01-15T08:30:00Z' },
        { id: 2, name: 'Document Review', completed: true, completedBy: 'Clerk', completedAt: '2025-01-15T14:20:00Z' },
        { id: 3, name: 'Background Verification', completed: false, assignedTo: 'Investigator', estimatedTime: '2 hours' },
        { id: 4, name: 'Captain Approval', completed: false, assignedTo: 'Barangay Captain', estimatedTime: '30 minutes' },
        { id: 5, name: 'Document Preparation', completed: false, assignedTo: 'Secretary', estimatedTime: '1 hour' },
        { id: 6, name: 'Ready for Release', completed: false, assignedTo: 'Clerk', estimatedTime: '5 minutes' }
      ]
    },
    documents: [
      { name: 'Valid ID Copy', status: 'verified', uploadedAt: '2025-01-15T08:30:00Z' },
      { name: 'Proof of Residency', status: 'verified', uploadedAt: '2025-01-15T08:30:00Z' },
      { name: 'Application Form', status: 'verified', uploadedAt: '2025-01-15T08:30:00Z' }
    ],
    notes: [
      { author: 'Secretary', timestamp: '2025-01-15T08:30:00Z', note: 'Application received and initial review completed.' },
      { author: 'Clerk', timestamp: '2025-01-15T14:20:00Z', note: 'All required documents verified and complete.' }
    ]
  },
  {
    id: 'REQ-2025-002',
    type: 'Business Permit',
    applicant: {
      name: 'Pedro Garcia',
      id: 'RES-003',
      address: 'Block 3, Lot 22, Dampol 2nd A',
      contact: '09156789012'
    },
    purpose: 'Sari-sari store operation',
    submittedDate: '2025-01-12T10:15:00Z',
    expectedDate: '2025-01-19T17:00:00Z',
    fee: 100.00,
    status: 'Under Review',
    priority: 'high',
    workflow: {
      currentStep: 3,
      steps: [
        { id: 1, name: 'Application Received', completed: true, completedBy: 'Secretary', completedAt: '2025-01-12T10:15:00Z' },
        { id: 2, name: 'Document Review', completed: true, completedBy: 'Clerk', completedAt: '2025-01-12T15:30:00Z' },
        { id: 3, name: 'Site Inspection', completed: false, assignedTo: 'Building Inspector', estimatedTime: '4 hours' },
        { id: 4, name: 'Compliance Check', completed: false, assignedTo: 'Regulatory Officer', estimatedTime: '2 hours' },
        { id: 5, name: 'Captain Approval', completed: false, assignedTo: 'Barangay Captain', estimatedTime: '1 hour' },
        { id: 6, name: 'Permit Preparation', completed: false, assignedTo: 'Secretary', estimatedTime: '2 hours' },
        { id: 7, name: 'Ready for Release', completed: false, assignedTo: 'Clerk', estimatedTime: '5 minutes' }
      ]
    },
    documents: [
      { name: 'Business Registration', status: 'verified', uploadedAt: '2025-01-12T10:15:00Z' },
      { name: 'Location Map', status: 'verified', uploadedAt: '2025-01-12T10:15:00Z' },
      { name: 'Fire Safety Certificate', status: 'pending', uploadedAt: null },
      { name: 'Sanitary Permit', status: 'verified', uploadedAt: '2025-01-12T10:15:00Z' }
    ],
    notes: [
      { author: 'Secretary', timestamp: '2025-01-12T10:15:00Z', note: 'Business permit application received.' },
      { author: 'Clerk', timestamp: '2025-01-12T15:30:00Z', note: 'Most documents verified. Fire safety certificate still pending.' },
      { author: 'Building Inspector', timestamp: '2025-01-13T09:00:00Z', note: 'Site inspection scheduled for January 16, 2025.' }
    ]
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

const priorityColors = {
  'normal': 'bg-gray-100 text-gray-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800',
}

export default function DocumentProcessingWorkflow() {
  const [requests, setRequests] = useState(mockDocumentRequests)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || request.status.toLowerCase().replace(' ', '-') === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const advanceWorkflow = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const currentStep = req.workflow.currentStep
        const nextStep = currentStep + 1

        if (nextStep <= req.workflow.steps.length) {
          const updatedSteps = req.workflow.steps.map((step: any) => {
            if (step.id === currentStep) {
              return {
                ...step,
                completed: true,
                completedBy: 'Current User',
                completedAt: new Date().toISOString(),
                assignedTo: step.assignedTo,
                estimatedTime: step.estimatedTime
              }
            }
            return step
          })

          return {
            ...req,
            workflow: {
              ...req.workflow,
              currentStep: nextStep,
              steps: updatedSteps
            },
            status: nextStep === req.workflow.steps.length ? 'Ready for Pickup' : req.status
          }
        }
      }
      return req
    }))
  }

  const addNote = (requestId: string, note: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          notes: [
            ...req.notes,
            {
              author: 'Current User',
              timestamp: new Date().toISOString(),
              note: note
            }
          ]
        }
      }
      return req
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Processing</h1>
          <p className="text-gray-600 mt-1">Manage document workflows and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            📊 Analytics
          </Button>
          <Button size="sm">
            ⚙️ Configure
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">⚙️</div>
              <div className="text-2xl font-bold text-orange-600">
                {requests.filter(r => r.status === 'Processing' || r.status === 'Under Review').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'Ready for Pickup').length}
              </div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="government-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by request ID, applicant name, or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under-review">Under Review</option>
                <option value="processing">Processing</option>
                <option value="ready-for-pickup">Ready for Pickup</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Requests List */}
      <div className="grid gap-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="government-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    {request.type} - {request.id}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Applicant: {request.applicant.name} | Purpose: {request.purpose}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[request.status as keyof typeof statusColors]}`}>
                    {request.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[request.priority as keyof typeof priorityColors]}`}>
                    {request.priority}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workflow Progress */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Workflow Progress</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {request.workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : step.id === request.workflow.currentStep
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.completed ? '✓' : step.id}
                      </div>
                      <div className="text-xs">
                        <div className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                          {step.name}
                        </div>
                        {step.completed ? (
                          <div className="text-gray-500">
                            {step.completedBy}
                          </div>
                        ) : step.id === request.workflow.currentStep ? (
                          <div className="text-orange-600">
                            {step.assignedTo}
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            {step.assignedTo}
                          </div>
                        )}
                      </div>
                      {index < request.workflow.steps.length - 1 && (
                        <div className="w-4 h-px bg-gray-300 mx-1"></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-600">
                  Current Step: {request.workflow.steps.find(s => s.id === request.workflow.currentStep)?.name || 'Completed'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  onClick={() => setSelectedRequest(request)}
                  className="flex-1"
                >
                  📋 Details
                </Button>
                {request.workflow.currentStep <= request.workflow.steps.length && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => advanceWorkflow(request.id)}
                    className="flex-1"
                  >
                    ⏭️ Advance
                  </Button>
                )}
                <Button size="sm" variant="outline" className="flex-1">
                  📝 Note
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedRequest.type} - {selectedRequest.id}</CardTitle>
                  <CardDescription>Detailed workflow and document information</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRequest(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Applicant Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedRequest.applicant.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Resident ID:</span>
                    <p className="font-medium">{selectedRequest.applicant.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium">{selectedRequest.applicant.address}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <p className="font-medium">{selectedRequest.applicant.contact}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Required Documents</h4>
                <div className="space-y-2">
                  {selectedRequest.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{doc.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Processing Notes</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {selectedRequest.notes.map((note: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">{note.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    advanceWorkflow(selectedRequest.id)
                    setSelectedRequest(null)
                  }}
                >
                  Approve & Advance
                </Button>
                <Button variant="outline" className="flex-1">Request Changes</Button>
                <Button variant="outline" className="flex-1">Print Document</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
