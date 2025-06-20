'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Survey {
  id: string
  title: string
  description: string
  type: string
  status: string
  isPublic: boolean
  startDate: string | null
  endDate: string | null
  totalResponses: number
  targetResponses: number
  createdAt: string
}

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    type: 'mixed',
    targetResponses: 100
  })

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockSurveys: Survey[] = [
      {
        id: '1',
        title: 'Community Infrastructure Priorities',
        description: 'Help us prioritize infrastructure improvements for 2025',
        type: 'multiple_choice',
        status: 'active',
        isPublic: true,
        startDate: '2024-12-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        totalResponses: 120,
        targetResponses: 200,
        createdAt: '2024-11-25T10:00:00Z'
      },
      {
        id: '2',
        title: 'Barangay Services Satisfaction Survey',
        description: 'Your feedback helps us improve our services',
        type: 'mixed',
        status: 'active',
        isPublic: true,
        startDate: '2024-12-10T00:00:00Z',
        endDate: '2025-01-10T23:59:59Z',
        totalResponses: 85,
        targetResponses: 150,
        createdAt: '2024-12-05T14:30:00Z'
      },
      {
        id: '3',
        title: 'Emergency Preparedness Assessment',
        description: 'Help us understand community preparedness for emergencies',
        type: 'assessment',
        status: 'draft',
        isPublic: false,
        startDate: null,
        endDate: null,
        totalResponses: 0,
        targetResponses: 100,
        createdAt: '2024-12-18T09:15:00Z'
      }
    ]

    setTimeout(() => {
      setSurveys(mockSurveys)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return '☑️'
      case 'mixed':
        return '📊'
      case 'assessment':
        return '📋'
      default:
        return '📝'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const handleCreateSurvey = () => {
    if (!newSurvey.title || !newSurvey.description) return

    const survey: Survey = {
      id: Date.now().toString(),
      title: newSurvey.title,
      description: newSurvey.description,
      type: newSurvey.type,
      status: 'draft',
      isPublic: false,
      startDate: null,
      endDate: null,
      totalResponses: 0,
      targetResponses: newSurvey.targetResponses,
      createdAt: new Date().toISOString()
    }

    setSurveys(prev => [survey, ...prev])
    setNewSurvey({ title: '', description: '', type: 'mixed', targetResponses: 100 })
    setShowCreateModal(false)
  }

  const handleUpdateStatus = (surveyId: string, newStatus: string) => {
    setSurveys(prev => prev.map(survey => 
      survey.id === surveyId 
        ? { ...survey, status: newStatus }
        : survey
    ))
  }

  const handleTogglePublic = (surveyId: string) => {
    setSurveys(prev => prev.map(survey => 
      survey.id === surveyId 
        ? { ...survey, isPublic: !survey.isPublic }
        : survey
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading surveys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surveys & Polls Management</h1>
          <p className="text-gray-600 mt-1">Create and manage community surveys and polls</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            📊 Analytics Report
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            ➕ Create Survey
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="government-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-xl font-bold text-gray-900">{surveys.length}</div>
            <div className="text-sm text-gray-600">Total Surveys</div>
          </CardContent>
        </Card>
        <Card className="government-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-xl font-bold text-gray-900">
              {surveys.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card className="government-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-xl font-bold text-gray-900">
              {surveys.filter(s => s.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </CardContent>
        </Card>
        <Card className="government-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-xl font-bold text-gray-900">
              {surveys.reduce((sum, s) => sum + s.totalResponses, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Responses</div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys List */}
      <div className="space-y-4">
        {surveys.map((survey) => (
          <Card key={survey.id} className="government-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getTypeIcon(survey.type)}</span>
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    <Badge className={getStatusColor(survey.status)}>
                      {survey.status}
                    </Badge>
                    {survey.isPublic && (
                      <Badge variant="outline">Public</Badge>
                    )}
                  </div>
                  <CardDescription>{survey.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedSurvey(survey)}
                  >
                    📊 Analytics
                  </Button>
                  {survey.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateStatus(survey.id, 'active')}
                    >
                      🚀 Publish
                    </Button>
                  )}
                  {survey.status === 'active' && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(survey.id, 'paused')}
                    >
                      ⏸️ Pause
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Start Date</div>
                  <div className="font-medium">{formatDate(survey.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">End Date</div>
                  <div className="font-medium">{formatDate(survey.endDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Responses</div>
                  <div className="font-medium">
                    {survey.totalResponses} / {survey.targetResponses}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-medium capitalize">{survey.type.replace('_', ' ')}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Progress</span>
                  <span className="font-medium">
                    {getProgressPercentage(survey.totalResponses, survey.targetResponses).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={getProgressPercentage(survey.totalResponses, survey.targetResponses)} 
                  className="h-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  ✏️ Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTogglePublic(survey.id)}
                >
                  {survey.isPublic ? '🔒 Make Private' : '🌐 Make Public'}
                </Button>
                <Button variant="outline" size="sm">
                  📋 View Questions
                </Button>
                <Button variant="outline" size="sm">
                  📤 Export Results
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Survey Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Create New Survey</CardTitle>
                  <CardDescription>Create a new survey or poll for the community</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCreateModal(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter survey title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this survey"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Survey Type</Label>
                  <Select 
                    value={newSurvey.type} 
                    onValueChange={(value) => setNewSurvey(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="mixed">Mixed Questions</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target">Target Responses</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newSurvey.targetResponses}
                    onChange={(e) => setNewSurvey(prev => ({ ...prev, targetResponses: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateSurvey}
                  disabled={!newSurvey.title || !newSurvey.description}
                >
                  Create Survey
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
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
