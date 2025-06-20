'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Feedback {
  id: string
  type: string
  category: string
  subject: string
  message: string
  rating?: number
  status: string
  submittedBy: {
    name: string
    email: string
    phone?: string
  }
  submittedAt: string
  respondedAt?: string
  response?: string
  priority: string
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [responseText, setResponseText] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockFeedback: Feedback[] = [
      {
        id: '1',
        type: 'suggestion',
        category: 'Service Quality',
        subject: 'Improve document processing time',
        message: 'The document processing takes too long. Can we have a faster option?',
        rating: 4,
        status: 'under_review',
        submittedBy: {
          name: 'Juan Dela Cruz',
          email: 'juan@email.com',
          phone: '+63 912 345 6789'
        },
        submittedAt: '2024-12-15T10:30:00Z',
        priority: 'medium'
      },
      {
        id: '2',
        type: 'complaint',
        category: 'Infrastructure',
        subject: 'Street light not working',
        message: 'The street light on Main Street has been broken for 2 weeks. It\'s getting dangerous at night.',
        rating: 2,
        status: 'resolved',
        submittedBy: {
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '+63 917 123 4567'
        },
        submittedAt: '2024-12-10T14:20:00Z',
        respondedAt: '2024-12-12T09:15:00Z',
        response: 'Thank you for reporting this. The street light has been repaired and is now working properly.',
        priority: 'high'
      },
      {
        id: '3',
        type: 'inquiry',
        category: 'General Inquiry',
        subject: 'Barangay clearance requirements',
        message: 'What are the requirements for getting a barangay clearance? How long does it take?',
        rating: 5,
        status: 'resolved',
        submittedBy: {
          name: 'Pedro Garcia',
          email: 'pedro@email.com',
          phone: '+63 905 987 6543'
        },
        submittedAt: '2024-12-08T16:45:00Z',
        respondedAt: '2024-12-09T08:30:00Z',
        response: 'For barangay clearance, you need: valid ID, proof of residency, and ₱50 fee. Processing takes 3-5 business days.',
        priority: 'low'
      }
    ]

    setTimeout(() => {
      setFeedback(mockFeedback)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-orange-100 text-orange-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return '💡'
      case 'complaint':
        return '⚠️'
      case 'inquiry':
        return '❓'
      case 'compliment':
        return '👍'
      default:
        return '💬'
    }
  }

  const filteredFeedback = feedback.filter(item => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus
    const typeMatch = filterType === 'all' || item.type === filterType
    return statusMatch && typeMatch
  })

  const handleUpdateStatus = (feedbackId: string, newStatus: string) => {
    setFeedback(prev => prev.map(item => 
      item.id === feedbackId 
        ? { ...item, status: newStatus }
        : item
    ))
  }

  const handleSubmitResponse = (feedbackId: string) => {
    if (!responseText.trim()) return

    setFeedback(prev => prev.map(item => 
      item.id === feedbackId 
        ? { 
            ...item, 
            status: 'resolved',
            response: responseText,
            respondedAt: new Date().toISOString()
          }
        : item
    ))

    setResponseText('')
    setSelectedFeedback(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-1">Manage community feedback, suggestions, and inquiries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            📊 Export Report
          </Button>
          <Button size="sm">
            📧 Send Notifications
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="government-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-xl font-bold text-gray-900">{feedback.length}</div>
            <div className="text-sm text-gray-600">Total Feedback</div>
          </CardContent>
        </Card>
        <Card className="government-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-xl font-bold text-gray-900">
              {feedback.filter(f => f.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="government-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-xl font-bold text-gray-900">
              {feedback.filter(f => f.status === 'under_review').length}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </CardContent>
        </Card>
        <Card className="government-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-xl font-bold text-gray-900">
              {feedback.filter(f => f.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="government-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="suggestion">Suggestions</SelectItem>
                  <SelectItem value="complaint">Complaints</SelectItem>
                  <SelectItem value="inquiry">Inquiries</SelectItem>
                  <SelectItem value="compliment">Compliments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <Card key={item.id} className="government-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getTypeIcon(item.type)}</span>
                    <CardTitle className="text-lg">{item.subject}</CardTitle>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                  <CardDescription>
                    {item.category} • Submitted by {item.submittedBy.name} • {formatDate(item.submittedAt)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedFeedback(item)}
                  >
                    View Details
                  </Button>
                  {item.status !== 'resolved' && (
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateStatus(item.id, 'under_review')}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{item.message}</p>
              {item.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < item.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {item.response && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Response:</h4>
                  <p className="text-green-700">{item.response}</p>
                  <p className="text-xs text-green-600 mt-2">
                    Responded on {formatDate(item.respondedAt!)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Respond to Feedback</CardTitle>
                  <CardDescription>{selectedFeedback.subject}</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedFeedback(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="response">Response</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={5}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSubmitResponse(selectedFeedback.id)}
                  disabled={!responseText.trim()}
                >
                  Send Response
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
