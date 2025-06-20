'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Survey {
  id: string
  title: string
  description: string
  type: string
  status: string
  startDate: string
  endDate: string
  totalResponses: number
  targetResponses: number
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockSurveys: Survey[] = [
      {
        id: '1',
        title: 'Community Infrastructure Priorities',
        description: 'Help us prioritize infrastructure improvements for 2025',
        type: 'multiple_choice',
        status: 'active',
        startDate: '2024-12-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        totalResponses: 120,
        targetResponses: 200
      },
      {
        id: '2',
        title: 'Barangay Services Satisfaction Survey',
        description: 'Your feedback helps us improve our services',
        type: 'mixed',
        status: 'active',
        startDate: '2024-12-10T00:00:00Z',
        endDate: '2025-01-10T23:59:59Z',
        totalResponses: 85,
        targetResponses: 150
      },
      {
        id: '3',
        title: 'Emergency Preparedness Assessment',
        description: 'Help us understand community preparedness for emergencies',
        type: 'assessment',
        status: 'completed',
        startDate: '2024-11-01T00:00:00Z',
        endDate: '2024-11-30T23:59:59Z',
        totalResponses: 156,
        targetResponses: 100
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading surveys...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Surveys</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Participate in community surveys to help shape the future of our barangay. Your opinions matter!
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="government-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-900">{surveys.length}</div>
              <div className="text-sm text-gray-600">Total Surveys</div>
            </CardContent>
          </Card>
          <Card className="government-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-gray-900">
                {surveys.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Surveys</div>
            </CardContent>
          </Card>
          <Card className="government-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-gray-900">
                {surveys.reduce((sum, s) => sum + s.totalResponses, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </CardContent>
          </Card>
        </div>

        {/* Surveys List */}
        <div className="space-y-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="government-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(survey.type)}</span>
                      <CardTitle className="text-xl">{survey.title}</CardTitle>
                      <Badge className={getStatusColor(survey.status)}>
                        {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {survey.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {survey.status === 'active' && (
                      <Button>
                        Take Survey
                      </Button>
                    )}
                    {survey.status === 'completed' && (
                      <Button variant="outline">
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                <div className="space-y-2">
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

                {/* Survey Status Message */}
                {survey.status === 'active' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      🟢 This survey is currently active. Your participation helps us make better decisions for our community.
                    </p>
                  </div>
                )}

                {survey.status === 'completed' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✅ This survey has been completed. Thank you to everyone who participated! Results are now available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Surveys Message */}
        {surveys.length === 0 && (
          <Card className="government-card">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Surveys Available</h3>
              <p className="text-gray-600 mb-6">
                There are currently no active surveys. Check back later for new community surveys.
              </p>
              <Button variant="outline">
                📧 Notify Me of New Surveys
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="government-card mt-8 bg-primary-50 border-primary-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-primary-800 mb-2">Have a Suggestion for a Survey?</h3>
            <p className="text-primary-700 mb-4">
              We value your input! If you have ideas for community surveys or topics you'd like us to explore, let us know.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" className="border-primary-300 text-primary-700 hover:bg-primary-100">
                📝 Suggest a Survey Topic
              </Button>
              <Button variant="outline" className="border-primary-300 text-primary-700 hover:bg-primary-100">
                💬 Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
