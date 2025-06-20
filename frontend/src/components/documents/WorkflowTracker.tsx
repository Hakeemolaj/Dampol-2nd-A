'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface WorkflowStep {
  id: string
  name: string
  description: string
  order: number
  requiredRole: string
  estimatedDuration: number
  isRequired: boolean
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rejected'
  assignedTo?: string
  startedAt?: string
  completedAt?: string
  notes?: string
  duration?: number
}

interface WorkflowData {
  id: string
  workflowId: string
  documentRequestId: string
  currentStepId: string
  status: 'active' | 'completed' | 'cancelled' | 'on_hold'
  startedAt: string
  completedAt?: string
  assignedTo?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  steps: WorkflowStep[]
}

interface WorkflowProgress {
  totalSteps: number
  completedSteps: number
  currentStep: string
  progressPercentage: number
  estimatedCompletion?: string
}

interface WorkflowTrackerProps {
  requestId: string
  isAdmin?: boolean
  onStepAction?: (stepId: string, action: 'start' | 'complete', data?: any) => void
}

export default function WorkflowTracker({
  requestId,
  isAdmin = false,
  onStepAction
}: WorkflowTrackerProps) {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null)
  const [progress, setProgress] = useState<WorkflowProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkflowData()
  }, [requestId])

  const fetchWorkflowData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/requests/${requestId}/workflow`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflow data')
      }

      const data = await response.json()
      if (data.success) {
        setWorkflow(data.data.workflow)
        setProgress(data.data.progress)
      } else {
        throw new Error(data.message || 'Failed to load workflow')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleStepAction = async (stepId: string, action: 'start' | 'complete', data?: any) => {
    try {
      const endpoint = action === 'start' 
        ? `/api/v1/documents/requests/${requestId}/workflow/steps/${stepId}/start`
        : `/api/v1/documents/requests/${requestId}/workflow/steps/${stepId}/complete`

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {})
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} step`)
      }

      // Refresh workflow data
      await fetchWorkflowData()

      // Call parent callback
      if (onStepAction) {
        onStepAction(stepId, action, data)
      }
    } catch (err) {
      console.error(`Error ${action}ing step:`, err)
      setError(err instanceof Error ? err.message : `Failed to ${action} step`)
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'skipped':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStepIcon = (status: string, order: number) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'in_progress':
        return '🔄'
      case 'rejected':
        return '❌'
      case 'skipped':
        return '⏭️'
      default:
        return order.toString()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-green-100 text-green-800'
    }
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

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`
    } else if (hours < 24) {
      return `${hours.toFixed(1)} hours`
    } else {
      return `${Math.round(hours / 24)} days`
    }
  }

  if (loading) {
    return (
      <Card className="government-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="government-card border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-800">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium">Error Loading Workflow</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchWorkflowData}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!workflow || !progress) {
    return (
      <Card className="government-card">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workflow Found</h3>
          <p className="text-gray-600">This document request doesn't have an associated workflow.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="government-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Document Processing Workflow</CardTitle>
            <CardDescription>
              Track the progress of your document request through our processing workflow
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(workflow.priority)}>
              {workflow.priority.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {workflow.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {progress.completedSteps} of {progress.totalSteps} steps completed
            </span>
          </div>
          <Progress value={progress.progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Current: {progress.currentStep}</span>
            <span>{progress.progressPercentage}% Complete</span>
          </div>
          {progress.estimatedCompletion && (
            <p className="text-sm text-gray-600">
              Estimated completion: {formatDate(progress.estimatedCompletion)}
            </p>
          )}
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Processing Steps</h4>
          <div className="space-y-3">
            {workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-all ${getStepStatusColor(step.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center font-medium text-sm">
                      {getStepIcon(step.status, step.order)}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{step.name}</h5>
                      <p className="text-sm opacity-90 mt-1">{step.description}</p>
                      
                      {/* Step Details */}
                      <div className="mt-2 space-y-1 text-xs opacity-75">
                        <div>Required role: {step.requiredRole}</div>
                        <div>Estimated duration: {formatDuration(step.estimatedDuration)}</div>
                        {step.assignedTo && (
                          <div>Assigned to: {step.assignedTo}</div>
                        )}
                        {step.startedAt && (
                          <div>Started: {formatDate(step.startedAt)}</div>
                        )}
                        {step.completedAt && (
                          <div>Completed: {formatDate(step.completedAt)}</div>
                        )}
                        {step.duration && (
                          <div>Actual duration: {formatDuration(step.duration)}</div>
                        )}
                      </div>

                      {/* Notes */}
                      {step.notes && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                          <strong>Notes:</strong> {step.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && step.status === 'pending' && workflow.currentStepId === step.id && (
                    <Button
                      size="sm"
                      onClick={() => handleStepAction(step.id, 'start')}
                    >
                      Start Step
                    </Button>
                  )}

                  {isAdmin && step.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleStepAction(step.id, 'complete', {
                        notes: 'Step completed via admin interface'
                      })}
                    >
                      Complete Step
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Info */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Started:</strong> {formatDate(workflow.startedAt)}
            </div>
            {workflow.completedAt && (
              <div>
                <strong>Completed:</strong> {formatDate(workflow.completedAt)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
