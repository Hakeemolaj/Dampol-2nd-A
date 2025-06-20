'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface TimelineStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'pending' | 'skipped'
  timestamp?: string
  estimatedTime?: string
  assignedTo?: string
  notes?: string[]
}

interface ProgressTimelineProps {
  steps: TimelineStep[]
  currentStep?: string
  showEstimates?: boolean
  compact?: boolean
}

export function ProgressTimeline({ 
  steps, 
  currentStep, 
  showEstimates = true, 
  compact = false 
}: ProgressTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const getStepIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'current':
        return '⚙️'
      case 'pending':
        return '⏳'
      case 'skipped':
        return '⏭️'
      default:
        return '⭕'
    }
  }

  const getStepColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50'
      case 'current':
        return 'border-orange-500 bg-orange-50'
      case 'pending':
        return 'border-gray-300 bg-gray-50'
      case 'skipped':
        return 'border-gray-400 bg-gray-100'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  const getConnectorColor = (currentStatus: TimelineStep['status'], nextStatus?: TimelineStep['status']) => {
    if (currentStatus === 'completed') {
      return 'bg-green-500'
    }
    if (currentStatus === 'current') {
      return 'bg-gradient-to-b from-orange-500 to-gray-300'
    }
    return 'bg-gray-300'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Processing Timeline</h3>
        {showEstimates && (
          <div className="text-sm text-gray-600">
            📅 Estimated completion varies by step
          </div>
        )}
      </div>

      <div className="relative">
        {steps.map((step, index) => {
          const isExpanded = expandedStep === step.id
          const isLast = index === steps.length - 1
          const nextStep = steps[index + 1]

          return (
            <div key={step.id} className="relative">
              {/* Timeline connector */}
              {!isLast && (
                <div 
                  className={`absolute left-6 top-12 w-0.5 h-8 ${getConnectorColor(step.status, nextStep?.status)}`}
                  style={{ zIndex: 1 }}
                />
              )}

              {/* Step content */}
              <div 
                className={`relative flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${getStepColor(step.status)} ${
                  step.status === 'current' ? 'ring-2 ring-orange-200' : ''
                }`}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                {/* Step icon */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-lg">
                  {getStepIcon(step.status)}
                </div>

                {/* Step details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                    {step.status === 'current' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        In Progress
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>

                  {/* Timestamp and estimates */}
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    {step.timestamp && (
                      <span>📅 {new Date(step.timestamp).toLocaleString()}</span>
                    )}
                    {step.estimatedTime && showEstimates && (
                      <span>⏱️ Est. {step.estimatedTime}</span>
                    )}
                    {step.assignedTo && (
                      <span>👤 {step.assignedTo}</span>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && step.notes && step.notes.length > 0 && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Notes & Updates:</h5>
                      <ul className="space-y-1">
                        {step.notes.map((note, noteIndex) => (
                          <li key={noteIndex} className="text-xs text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                <div className="flex-shrink-0">
                  <span className="text-gray-400 text-sm">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">Overall Progress</h4>
              <p className="text-xs text-blue-700">
                {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-900">
                {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
              </div>
              <div className="text-xs text-blue-700">Complete</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Compact version for smaller spaces
export function CompactProgressTimeline({ steps, currentStep }: ProgressTimelineProps) {
  const getStepIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'current':
        return '⚙️'
      case 'pending':
        return '⏳'
      case 'skipped':
        return '⏭️'
      default:
        return '⭕'
    }
  }

  const getStepColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50'
      case 'current':
        return 'border-orange-500 bg-orange-50'
      case 'pending':
        return 'border-gray-300 bg-gray-50'
      case 'skipped':
        return 'border-gray-400 bg-gray-100'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  const getConnectorColor = (currentStatus: TimelineStep['status'], nextStatus?: TimelineStep['status']) => {
    if (currentStatus === 'completed') {
      return 'bg-green-500'
    }
    if (currentStatus === 'current') {
      return 'bg-gradient-to-r from-orange-500 to-gray-300'
    }
    return 'bg-gray-300'
  }

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        
        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${getStepColor(step.status)}`}
              title={`${step.title} - ${step.status}`}
            >
              {getStepIcon(step.status)}
            </div>
            
            {!isLast && (
              <div className={`w-8 h-0.5 ${getConnectorColor(step.status, steps[index + 1]?.status)}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export type { TimelineStep, ProgressTimelineProps }
