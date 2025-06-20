'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Mock data for demonstration
const mockRequests = [
  {
    id: 'REQ-2025-001',
    type: 'Barangay Clearance',
    status: 'Processing',
    applicant: 'Juan Dela Cruz',
    submittedDate: '2025-01-15',
    expectedDate: '2025-01-17',
    fee: '₱50.00',
    purpose: 'Employment application',
    priority: 'normal',
  },
  {
    id: 'REQ-2025-002',
    type: 'Certificate of Residency',
    status: 'Ready for Pickup',
    applicant: 'Maria Santos',
    submittedDate: '2025-01-14',
    expectedDate: '2025-01-15',
    fee: '₱30.00',
    purpose: 'School enrollment',
    priority: 'normal',
  },
  {
    id: 'REQ-2025-003',
    type: 'Business Permit',
    status: 'Under Review',
    applicant: 'Pedro Garcia',
    submittedDate: '2025-01-12',
    expectedDate: '2025-01-19',
    fee: '₱100.00',
    purpose: 'Sari-sari store operation',
    priority: 'high',
  },
  {
    id: 'REQ-2025-004',
    type: 'Certificate of Indigency',
    status: 'Pending',
    applicant: 'Ana Reyes',
    submittedDate: '2025-01-16',
    expectedDate: '2025-01-19',
    fee: 'Free',
    purpose: 'Medical assistance',
    priority: 'urgent',
  },
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

export default function AdminDashboard() {
  const [requests, setRequests] = useState(mockRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const updateRequestStatus = (requestId: string, newStatus: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    ))
  }

  const getStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'Pending').length,
      processing: requests.filter(r => r.status === 'Processing' || r.status === 'Under Review').length,
      ready: requests.filter(r => r.status === 'Ready for Pickup').length,
      urgent: requests.filter(r => r.priority === 'urgent').length,
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrative Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of barangay operations and services</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            📊 Generate Report
          </Button>
          <Button>
            📢 New Announcement
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Residents</p>
                <p className="text-2xl font-bold text-gray-900">8,542</p>
                <p className="text-xs text-gray-500">2,134 households</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₱45,230</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Announcements</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">3 urgent alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🏗️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-xs text-gray-500">2 infrastructure</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="government-card">
        <CardContent className="p-6">
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
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Processing">Processing</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="lg:w-48">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Priority</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Document Requests</CardTitle>
          <CardDescription>
            Manage and process document requests from residents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Request ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Applicant</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Document Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-medium">{request.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{request.applicant}</p>
                          <p className="text-sm text-gray-600">{request.purpose}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium">{request.type}</span>
                        <p className="text-sm text-gray-600">{request.fee}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[request.status as keyof typeof statusColors]}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[request.priority as keyof typeof priorityColors]}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{new Date(request.submittedDate).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <select
                            value={request.status}
                            onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Processing">Processing</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary-800 mb-3">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              📊 Generate Daily Report
            </Button>
            <Button variant="outline" className="justify-start">
              📧 Send Notifications
            </Button>
            <Button variant="outline" className="justify-start">
              📋 Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
