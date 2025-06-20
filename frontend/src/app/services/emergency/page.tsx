"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const serviceInfo = {
  title: "Emergency Assistance",
  description: "Request emergency assistance and support from the barangay",
  fee: "Free",
  responseTime: "Immediate to 24 hours",
  emergencyTypes: [
    "Medical emergencies",
    "Fire incidents",
    "Natural disasters",
    "Security threats",
    "Accidents",
    "Utility emergencies",
    "Other urgent situations"
  ],
  emergencyContacts: [
    { service: "Barangay Emergency Hotline", number: "(044) 815-1234" },
    { service: "Fire Department", number: "116" },
    { service: "Police", number: "117" },
    { service: "Medical Emergency", number: "911" },
    { service: "NDRRMC", number: "911-1406" }
  ]
}

export default function EmergencyPage() {
  const [formData, setFormData] = useState({
    reporterFirstName: '',
    reporterLastName: '',
    reporterContactNumber: '',
    reporterEmail: '',
    emergencyType: '',
    otherEmergencyType: '',
    emergencyLocation: '',
    emergencyDescription: '',
    peopleInvolved: '',
    injuriesReported: '',
    immediateNeedsRequested: '',
    currentStatus: '',
    additionalInfo: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Implement actual form submission to backend
    console.log('Emergency report submitted:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert('Emergency report submitted successfully! Barangay officials have been notified and will respond accordingly.')
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/services" className="hover:text-primary-600">Services</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Emergency Assistance</span>
      </nav>

      {/* Emergency Alert */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">🚨</span>
            <h2 className="text-xl font-bold text-red-800">EMERGENCY ALERT</h2>
          </div>
          <p className="text-red-700 mb-4">
            <strong>For life-threatening emergencies, call 911 immediately!</strong>
          </p>
          <p className="text-red-600 text-sm">
            This form is for reporting emergencies to the barangay and requesting assistance. 
            For immediate medical, fire, or police emergencies, contact the appropriate emergency services directly.
          </p>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle className="text-xl">Emergency Contact Numbers</CardTitle>
          <CardDescription>
            Keep these numbers handy for different types of emergencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {serviceInfo.emergencyContacts.map((contact, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{contact.service}</span>
                <a 
                  href={`tel:${contact.number}`}
                  className="text-primary-600 font-bold hover:text-primary-700"
                >
                  {contact.number}
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card className="government-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🚨</span>
            <div>
              <CardTitle className="text-2xl">{serviceInfo.title}</CardTitle>
              <CardDescription className="text-lg mt-1">
                {serviceInfo.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee:</span>
                  <span className="font-medium text-green-600">{serviceInfo.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">{serviceInfo.responseTime}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Emergency Types</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {serviceInfo.emergencyTypes.slice(0, 5).map((type, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {type}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Report Form */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Emergency Report Form</CardTitle>
          <CardDescription>
            Please provide as much detail as possible to help us respond effectively to the emergency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reporter Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Reporter Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reporterFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    id="reporterFirstName"
                    name="reporterFirstName"
                    type="text"
                    required
                    value={formData.reporterFirstName}
                    onChange={handleInputChange}
                    placeholder="Your first name"
                  />
                </div>
                
                <div>
                  <label htmlFor="reporterLastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    id="reporterLastName"
                    name="reporterLastName"
                    type="text"
                    required
                    value={formData.reporterLastName}
                    onChange={handleInputChange}
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reporterContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <Input
                    id="reporterContactNumber"
                    name="reporterContactNumber"
                    type="tel"
                    required
                    value={formData.reporterContactNumber}
                    onChange={handleInputChange}
                    placeholder="09XX-XXX-XXXX"
                  />
                </div>
                
                <div>
                  <label htmlFor="reporterEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="reporterEmail"
                    name="reporterEmail"
                    type="email"
                    value={formData.reporterEmail}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Details</h3>
              
              <div>
                <label htmlFor="emergencyType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Emergency *
                </label>
                <select
                  id="emergencyType"
                  name="emergencyType"
                  required
                  value={formData.emergencyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select emergency type</option>
                  {serviceInfo.emergencyTypes.map((type, index) => (
                    <option key={index} value={type.toLowerCase().replace(/\s+/g, '-')}>
                      {type}
                    </option>
                  ))}
                  <option value="other">Other (please specify)</option>
                </select>
              </div>

              {formData.emergencyType === 'other' && (
                <div>
                  <label htmlFor="otherEmergencyType" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify emergency type *
                  </label>
                  <Input
                    id="otherEmergencyType"
                    name="otherEmergencyType"
                    type="text"
                    required={formData.emergencyType === 'other'}
                    value={formData.otherEmergencyType}
                    onChange={handleInputChange}
                    placeholder="Specify the type of emergency"
                  />
                </div>
              )}

              <div>
                <label htmlFor="emergencyLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Location *
                </label>
                <Input
                  id="emergencyLocation"
                  name="emergencyLocation"
                  type="text"
                  required
                  value={formData.emergencyLocation}
                  onChange={handleInputChange}
                  placeholder="Exact location of the emergency (address, landmarks, etc.)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="peopleInvolved" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of People Involved
                  </label>
                  <Input
                    id="peopleInvolved"
                    name="peopleInvolved"
                    type="number"
                    min="0"
                    value={formData.peopleInvolved}
                    onChange={handleInputChange}
                    placeholder="e.g., 3"
                  />
                </div>

                <div>
                  <label htmlFor="injuriesReported" className="block text-sm font-medium text-gray-700 mb-1">
                    Injuries Reported
                  </label>
                  <select
                    id="injuriesReported"
                    name="injuriesReported"
                    value={formData.injuriesReported}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select injury status</option>
                    <option value="none">No injuries</option>
                    <option value="minor">Minor injuries</option>
                    <option value="serious">Serious injuries</option>
                    <option value="critical">Critical injuries</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="currentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status *
                </label>
                <select
                  id="currentStatus"
                  name="currentStatus"
                  required
                  value={formData.currentStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select current status</option>
                  <option value="ongoing">Emergency is ongoing</option>
                  <option value="contained">Emergency is contained</option>
                  <option value="resolved">Emergency is resolved</option>
                  <option value="escalating">Emergency is escalating</option>
                </select>
              </div>
            </div>

            {/* Assistance Requested */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Assistance Requested</h3>

              <div>
                <label htmlFor="immediateNeedsRequested" className="block text-sm font-medium text-gray-700 mb-1">
                  Immediate Needs/Assistance Requested *
                </label>
                <textarea
                  id="immediateNeedsRequested"
                  name="immediateNeedsRequested"
                  required
                  rows={4}
                  value={formData.immediateNeedsRequested}
                  onChange={handleInputChange}
                  placeholder="What specific assistance or resources do you need? (e.g., medical aid, evacuation, rescue equipment, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Any other relevant information that might help responders..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Emergency Report...' : 'Submit Emergency Report'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-red-800 mb-3">🚨 Important Emergency Guidelines</h3>
          <ul className="space-y-2 text-sm text-red-700">
            <li>• <strong>Life-threatening emergencies:</strong> Call 911 immediately</li>
            <li>• <strong>Fire emergencies:</strong> Call 116 (Fire Department)</li>
            <li>• <strong>Police emergencies:</strong> Call 117</li>
            <li>• This form notifies barangay officials for coordination and support</li>
            <li>• Provide accurate location information for faster response</li>
            <li>• Stay calm and follow instructions from emergency responders</li>
            <li>• Keep your phone accessible for follow-up calls</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

              <div>
                <label htmlFor="emergencyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Description *
                </label>
                <textarea
                  id="emergencyDescription"
                  name="emergencyDescription"
                  required
                  rows={5}
                  value={formData.emergencyDescription}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the emergency situation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
