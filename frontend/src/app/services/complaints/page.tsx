"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const serviceInfo = {
  title: "Complaint Filing",
  description: "File complaints and disputes for mediation and resolution",
  fee: "Free",
  processingTime: "3-5 business days",
  types: [
    "Noise complaints",
    "Property disputes",
    "Neighbor conflicts",
    "Business-related issues",
    "Public safety concerns",
    "Environmental violations",
    "Other community issues"
  ],
  process: [
    "Submit complaint form with details",
    "Barangay officials review the case",
    "Parties are notified and scheduled for mediation",
    "Mediation session conducted",
    "Resolution agreement or escalation decision"
  ]
}

export default function ComplaintsPage() {
  const [formData, setFormData] = useState({
    complainantFirstName: '',
    complainantLastName: '',
    complainantMiddleName: '',
    complainantAddress: '',
    complainantContactNumber: '',
    complainantEmail: '',
    respondentFirstName: '',
    respondentLastName: '',
    respondentMiddleName: '',
    respondentAddress: '',
    respondentContactNumber: '',
    complaintType: '',
    otherComplaintType: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    complaintDetails: '',
    desiredResolution: '',
    witnessName: '',
    witnessContactNumber: '',
    previousAttempts: '',
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
    console.log('Form submitted:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert('Complaint filed successfully! You will receive a confirmation and case number shortly.')
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/services" className="hover:text-primary-600">Services</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Complaint Filing</span>
      </nav>

      {/* Service Information */}
      <Card className="government-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⚖️</span>
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
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">{serviceInfo.processingTime}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Common Complaint Types</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {serviceInfo.types.slice(0, 5).map((type, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    {type}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Mediation Process</h3>
            <ol className="text-sm text-gray-600 space-y-2">
              {serviceInfo.process.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-500 mr-2 font-medium">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Complaint Form */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Complaint Form</CardTitle>
          <CardDescription>
            Please provide complete and accurate information. All parties will be contacted for mediation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Complainant Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Complainant Information</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="complainantFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    id="complainantFirstName"
                    name="complainantFirstName"
                    type="text"
                    required
                    value={formData.complainantFirstName}
                    onChange={handleInputChange}
                    placeholder="Your first name"
                  />
                </div>
                
                <div>
                  <label htmlFor="complainantLastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    id="complainantLastName"
                    name="complainantLastName"
                    type="text"
                    required
                    value={formData.complainantLastName}
                    onChange={handleInputChange}
                    placeholder="Your last name"
                  />
                </div>
                
                <div>
                  <label htmlFor="complainantMiddleName" className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <Input
                    id="complainantMiddleName"
                    name="complainantMiddleName"
                    type="text"
                    value={formData.complainantMiddleName}
                    onChange={handleInputChange}
                    placeholder="Your middle name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="complainantAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Complete Address *
                </label>
                <Input
                  id="complainantAddress"
                  name="complainantAddress"
                  type="text"
                  required
                  value={formData.complainantAddress}
                  onChange={handleInputChange}
                  placeholder="Your complete address in Dampol 2nd A"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="complainantContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <Input
                    id="complainantContactNumber"
                    name="complainantContactNumber"
                    type="tel"
                    required
                    value={formData.complainantContactNumber}
                    onChange={handleInputChange}
                    placeholder="09XX-XXX-XXXX"
                  />
                </div>
                
                <div>
                  <label htmlFor="complainantEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="complainantEmail"
                    name="complainantEmail"
                    type="email"
                    value={formData.complainantEmail}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Respondent Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Respondent Information</h3>
              <p className="text-sm text-gray-600">Information about the person/entity you are filing a complaint against</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="respondentFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    id="respondentFirstName"
                    name="respondentFirstName"
                    type="text"
                    required
                    value={formData.respondentFirstName}
                    onChange={handleInputChange}
                    placeholder="Respondent's first name"
                  />
                </div>
                
                <div>
                  <label htmlFor="respondentLastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    id="respondentLastName"
                    name="respondentLastName"
                    type="text"
                    required
                    value={formData.respondentLastName}
                    onChange={handleInputChange}
                    placeholder="Respondent's last name"
                  />
                </div>
                
                <div>
                  <label htmlFor="respondentMiddleName" className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <Input
                    id="respondentMiddleName"
                    name="respondentMiddleName"
                    type="text"
                    value={formData.respondentMiddleName}
                    onChange={handleInputChange}
                    placeholder="Respondent's middle name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="respondentAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Respondent's Address *
                </label>
                <Input
                  id="respondentAddress"
                  name="respondentAddress"
                  type="text"
                  required
                  value={formData.respondentAddress}
                  onChange={handleInputChange}
                  placeholder="Complete address of respondent"
                />
              </div>

              <div>
                <label htmlFor="respondentContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Respondent's Contact Number (if known)
                </label>
                <Input
                  id="respondentContactNumber"
                  name="respondentContactNumber"
                  type="tel"
                  value={formData.respondentContactNumber}
                  onChange={handleInputChange}
                  placeholder="09XX-XXX-XXXX"
                />
              </div>
            </div>

            {/* Complaint Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>

              <div>
                <label htmlFor="complaintType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Complaint *
                </label>
                <select
                  id="complaintType"
                  name="complaintType"
                  required
                  value={formData.complaintType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select complaint type</option>
                  {serviceInfo.types.map((type, index) => (
                    <option key={index} value={type.toLowerCase().replace(/\s+/g, '-')}>
                      {type}
                    </option>
                  ))}
                  <option value="other">Other (please specify)</option>
                </select>
              </div>

              {formData.complaintType === 'other' && (
                <div>
                  <label htmlFor="otherComplaintType" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify complaint type *
                  </label>
                  <Input
                    id="otherComplaintType"
                    name="otherComplaintType"
                    type="text"
                    required={formData.complaintType === 'other'}
                    value={formData.otherComplaintType}
                    onChange={handleInputChange}
                    placeholder="Specify the type of complaint"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Incident *
                  </label>
                  <Input
                    id="incidentDate"
                    name="incidentDate"
                    type="date"
                    required
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="incidentTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Time of Incident
                  </label>
                  <Input
                    id="incidentTime"
                    name="incidentTime"
                    type="time"
                    value={formData.incidentTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="incidentLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Location of Incident *
                </label>
                <Input
                  id="incidentLocation"
                  name="incidentLocation"
                  type="text"
                  required
                  value={formData.incidentLocation}
                  onChange={handleInputChange}
                  placeholder="Specific location where the incident occurred"
                />
              </div>

              <div>
                <label htmlFor="complaintDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description of Complaint *
                </label>
                <textarea
                  id="complaintDetails"
                  name="complaintDetails"
                  required
                  rows={6}
                  value={formData.complaintDetails}
                  onChange={handleInputChange}
                  placeholder="Please provide a detailed description of what happened, including specific facts and circumstances..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="desiredResolution" className="block text-sm font-medium text-gray-700 mb-1">
                  Desired Resolution *
                </label>
                <textarea
                  id="desiredResolution"
                  name="desiredResolution"
                  required
                  rows={3}
                  value={formData.desiredResolution}
                  onChange={handleInputChange}
                  placeholder="What outcome or resolution are you seeking?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="witnessName" className="block text-sm font-medium text-gray-700 mb-1">
                    Witness Name (if any)
                  </label>
                  <Input
                    id="witnessName"
                    name="witnessName"
                    type="text"
                    value={formData.witnessName}
                    onChange={handleInputChange}
                    placeholder="Name of witness"
                  />
                </div>

                <div>
                  <label htmlFor="witnessContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Witness Contact Number
                  </label>
                  <Input
                    id="witnessContactNumber"
                    name="witnessContactNumber"
                    type="tel"
                    value={formData.witnessContactNumber}
                    onChange={handleInputChange}
                    placeholder="09XX-XXX-XXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="previousAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Attempts to Resolve
                </label>
                <textarea
                  id="previousAttempts"
                  name="previousAttempts"
                  rows={3}
                  value={formData.previousAttempts}
                  onChange={handleInputChange}
                  placeholder="Have you tried to resolve this issue before? If yes, please describe what was done..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Filing Complaint...' : 'File Complaint'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-800 mb-3">⚖️ Important Legal Notes</h3>
          <ul className="space-y-2 text-sm text-amber-700">
            <li>• All information provided must be truthful and accurate</li>
            <li>• False accusations may result in counter-complaints</li>
            <li>• Both parties will be notified and invited for mediation</li>
            <li>• Mediation is voluntary but highly encouraged</li>
            <li>• If mediation fails, case may be referred to higher authorities</li>
            <li>• You will receive a case number for tracking purposes</li>
            <li>• Office hours: Monday-Friday, 8:00 AM - 5:00 PM</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
