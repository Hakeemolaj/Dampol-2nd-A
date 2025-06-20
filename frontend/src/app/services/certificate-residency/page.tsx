'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const documentInfo = {
  title: "Certificate of Residency",
  description: "Official proof of residence in Barangay Dampol 2nd A for various applications",
  fee: "₱30.00",
  processingTime: "1 business day",
  requirements: [
    "Valid government-issued ID (Driver's License, Passport, SSS ID, etc.)",
    "Utility bill or lease contract as proof of residence",
    "Completed application form",
    "Barangay clearance (if required by requesting agency)"
  ],
  purposes: [
    "School enrollment",
    "Employment verification",
    "Bank account opening",
    "Government benefits application",
    "Insurance claims",
    "Legal proceedings",
    "Other official purposes"
  ]
}

export default function CertificateResidencyPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    civilStatus: '',
    address: '',
    yearsOfResidency: '',
    contactNumber: '',
    email: '',
    purpose: '',
    otherPurpose: '',
    requestingAgency: '',
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
    
    alert('Application submitted successfully! You will receive a confirmation email shortly.')
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/services" className="hover:text-primary-600">Services</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Certificate of Residency</span>
      </nav>

      {/* Document Information */}
      <Card className="government-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🏠</span>
            <div>
              <CardTitle className="text-2xl">{documentInfo.title}</CardTitle>
              <CardDescription className="text-lg mt-1">
                {documentInfo.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Document Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-medium text-primary-600">{documentInfo.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">{documentInfo.processingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validity:</span>
                  <span className="font-medium">3 months</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {documentInfo.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-500 mr-2 mt-1">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>
            Please fill out all required fields accurately. All information will be verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <Input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Enter your middle name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="civilStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Civil Status *
                  </label>
                  <select
                    id="civilStatus"
                    name="civilStatus"
                    required
                    value={formData.civilStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select civil status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Complete Address in Dampol 2nd A *
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House No., Street, Dampol 2nd A, Pulilan, Bulacan"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="yearsOfResidency" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Residency *
                  </label>
                  <Input
                    id="yearsOfResidency"
                    name="yearsOfResidency"
                    type="number"
                    required
                    min="0"
                    value={formData.yearsOfResidency}
                    onChange={handleInputChange}
                    placeholder="Number of years"
                  />
                </div>
                
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="09XX-XXX-XXXX"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Purpose and Agency */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Purpose of Request</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose *
                  </label>
                  <select
                    id="purpose"
                    name="purpose"
                    required
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select purpose</option>
                    {documentInfo.purposes.map((purpose) => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="requestingAgency" className="block text-sm font-medium text-gray-700 mb-1">
                    Requesting Agency/Institution *
                  </label>
                  <Input
                    id="requestingAgency"
                    name="requestingAgency"
                    type="text"
                    required
                    value={formData.requestingAgency}
                    onChange={handleInputChange}
                    placeholder="Name of agency or institution"
                  />
                </div>
              </div>

              {formData.purpose === 'Other official purposes' && (
                <div>
                  <label htmlFor="otherPurpose" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify *
                  </label>
                  <Input
                    id="otherPurpose"
                    name="otherPurpose"
                    type="text"
                    required
                    value={formData.otherPurpose}
                    onChange={handleInputChange}
                    placeholder="Please specify the purpose"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                className="flex-1"
              >
                <Link href="/services">
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 mb-3">📋 Important Notes</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Certificate is valid for 3 months from date of issuance</li>
            <li>• Processing fee must be paid upon document release</li>
            <li>• Bring original documents for verification when claiming</li>
            <li>• You will be notified via SMS/email when ready for pickup</li>
            <li>• Office hours: Monday-Friday, 8:00 AM - 5:00 PM</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
