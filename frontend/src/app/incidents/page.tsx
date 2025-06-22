'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface IncidentForm {
  incident_type: string
  respondent_name: string
  respondent_address: string
  incident_date: string
  incident_location: string
  description: string
  complainant_name?: string
  complainant_contact?: string
  complainant_email?: string
}

const incidentTypes = [
  'Theft',
  'Assault', 
  'Domestic Violence',
  'Noise Complaint',
  'Property Damage',
  'Public Disturbance',
  'Traffic Violation',
  'Drug-related',
  'Other'
]

export default function IncidentsPage() {
  const [formData, setFormData] = useState<IncidentForm>({
    incident_type: '',
    respondent_name: '',
    respondent_address: '',
    incident_date: '',
    incident_location: '',
    description: '',
    complainant_name: '',
    complainant_contact: '',
    complainant_email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handleInputChange = (field: keyof IncidentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setFormData({
          incident_type: '',
          respondent_name: '',
          respondent_address: '',
          incident_date: '',
          incident_location: '',
          description: '',
          complainant_name: '',
          complainant_contact: '',
          complainant_email: ''
        })
      } else {
        setSubmitError(data.message || 'Failed to submit incident report')
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Incident Report Submitted</h1>
          <p className="text-gray-600 mt-2">Your report has been successfully submitted</p>
        </div>

        <Card className="government-card">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Report Submitted Successfully
            </h3>
            <p className="text-gray-600 mb-6">
              Your incident report has been received and will be reviewed by barangay officials. 
              You will be contacted if additional information is needed.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setSubmitSuccess(false)}
                className="w-full"
              >
                Submit Another Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Report an Incident</h1>
        <p className="text-gray-600 mt-2">
          Submit an incident report to the barangay for investigation and resolution
        </p>
      </div>

      {/* Important Notice */}
      <Alert>
        <AlertDescription>
          <strong>Important:</strong> For emergencies requiring immediate attention, 
          please call our emergency hotline at <strong>(044) 815-1234</strong> or dial <strong>911</strong>.
          This form is for non-emergency incident reporting.
        </AlertDescription>
      </Alert>

      {/* Report Form */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Incident Report Form</CardTitle>
          <CardDescription>
            Please provide as much detail as possible to help us investigate the incident
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymous Reporting Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="anonymous">Submit anonymously (no contact information required)</Label>
            </div>

            {/* Complainant Information (if not anonymous) */}
            {!isAnonymous && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="complainant_name">Full Name</Label>
                    <Input
                      id="complainant_name"
                      value={formData.complainant_name || ''}
                      onChange={(e) => handleInputChange('complainant_name', e.target.value)}
                      required={!isAnonymous}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complainant_contact">Contact Number</Label>
                    <Input
                      id="complainant_contact"
                      value={formData.complainant_contact || ''}
                      onChange={(e) => handleInputChange('complainant_contact', e.target.value)}
                      placeholder="09XX-XXX-XXXX"
                      required={!isAnonymous}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="complainant_email">Email Address (Optional)</Label>
                  <Input
                    id="complainant_email"
                    type="email"
                    value={formData.complainant_email || ''}
                    onChange={(e) => handleInputChange('complainant_email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            )}

            {/* Incident Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Incident Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incident_type">Type of Incident *</Label>
                  <Select
                    value={formData.incident_type}
                    onValueChange={(value) => handleInputChange('incident_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="incident_date">Date and Time of Incident *</Label>
                  <Input
                    id="incident_date"
                    type="datetime-local"
                    value={formData.incident_date}
                    onChange={(e) => handleInputChange('incident_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="incident_location">Location of Incident</Label>
                <Input
                  id="incident_location"
                  value={formData.incident_location}
                  onChange={(e) => handleInputChange('incident_location', e.target.value)}
                  placeholder="Street, block, landmark, etc."
                />
              </div>
            </div>

            {/* Respondent Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Person(s) Involved</h3>
              
              <div>
                <Label htmlFor="respondent_name">Name of Person(s) Involved *</Label>
                <Input
                  id="respondent_name"
                  value={formData.respondent_name}
                  onChange={(e) => handleInputChange('respondent_name', e.target.value)}
                  placeholder="Full name or description if name is unknown"
                  required
                />
              </div>

              <div>
                <Label htmlFor="respondent_address">Address (if known)</Label>
                <Textarea
                  id="respondent_address"
                  value={formData.respondent_address}
                  onChange={(e) => handleInputChange('respondent_address', e.target.value)}
                  placeholder="Complete address or general location"
                  rows={2}
                />
              </div>
            </div>

            {/* Incident Description */}
            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please provide a detailed description of what happened, including any witnesses, evidence, or other relevant information..."
                rows={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum 10 characters required. Be as specific as possible.
              </p>
            </div>

            {/* Error Message */}
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 mb-3">📋 What Happens Next?</h3>
          <ul className="space-y-2 text-blue-700">
            <li>• Your report will be reviewed by barangay officials within 24 hours</li>
            <li>• An investigating officer may be assigned to your case</li>
            <li>• You may be contacted for additional information or clarification</li>
            <li>• Updates on the investigation will be provided as available</li>
            <li>• Mediation or resolution proceedings may be scheduled if appropriate</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
