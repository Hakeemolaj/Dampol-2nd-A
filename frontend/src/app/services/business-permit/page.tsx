'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const documentInfo = {
  title: "Barangay Business Permit",
  description: "Permit for small business operations within Barangay Dampol 2nd A",
  fee: "₱100.00",
  processingTime: "3-5 business days",
  requirements: [
    "Valid government-issued ID of business owner",
    "Business registration documents (DTI/SEC/CDA)",
    "Location sketch/map of business premises",
    "Completed application form",
    "Proof of business location (lease contract/property title)",
    "Barangay clearance of business owner",
    "Fire safety inspection certificate (if applicable)"
  ],
  businessTypes: [
    "Retail store/sari-sari store",
    "Food establishment/carinderia",
    "Beauty salon/barbershop",
    "Internet cafe/computer shop",
    "Repair shop (electronics, appliances)",
    "Tailoring/dressmaking shop",
    "Home-based business",
    "Service provider",
    "Other small business"
  ]
}

export default function BusinessPermitPage() {
  const [formData, setFormData] = useState({
    // Business Owner Information
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    civilStatus: '',
    address: '',
    contactNumber: '',
    email: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    otherBusinessType: '',
    businessAddress: '',
    businessDescription: '',
    numberOfEmployees: '',
    capitalInvestment: '',
    
    // Additional Information
    hasFireSafety: '',
    hasSanitaryPermit: '',
    operatingHours: '',
    specialRequirements: '',
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
        <span className="text-gray-900">Business Permit</span>
      </nav>

      {/* Document Information */}
      <Card className="government-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">💼</span>
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
              <h3 className="font-semibold text-gray-900 mb-3">Permit Details</h3>
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
                  <span className="font-medium">1 year</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {documentInfo.requirements.slice(0, 5).map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-500 mr-2 mt-1">•</span>
                    {req}
                  </li>
                ))}
                <li className="text-primary-600 text-xs">
                  +{documentInfo.requirements.length - 5} more requirements
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Business Permit Application</CardTitle>
          <CardDescription>
            Please provide complete and accurate information about your business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Business Owner Information</h3>
              
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
                  Home Address *
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Complete home address"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
              
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type of Business *
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    required
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select business type</option>
                    {documentInfo.businessTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Employees *
                  </label>
                  <Input
                    id="numberOfEmployees"
                    name="numberOfEmployees"
                    type="number"
                    required
                    min="0"
                    value={formData.numberOfEmployees}
                    onChange={handleInputChange}
                    placeholder="Number of employees"
                  />
                </div>
              </div>

              {formData.businessType === 'Other small business' && (
                <div>
                  <label htmlFor="otherBusinessType" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify business type *
                  </label>
                  <Input
                    id="otherBusinessType"
                    name="otherBusinessType"
                    type="text"
                    required
                    value={formData.otherBusinessType}
                    onChange={handleInputChange}
                    placeholder="Specify your business type"
                  />
                </div>
              )}

              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address in Dampol 2nd A *
                </label>
                <Input
                  id="businessAddress"
                  name="businessAddress"
                  type="text"
                  required
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  placeholder="Complete business address"
                />
              </div>

              <div>
                <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description *
                </label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  required
                  rows={3}
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your business activities and services"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="capitalInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                    Capital Investment *
                  </label>
                  <Input
                    id="capitalInvestment"
                    name="capitalInvestment"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.capitalInvestment}
                    onChange={handleInputChange}
                    placeholder="Amount in PHP"
                  />
                </div>

                <div>
                  <label htmlFor="operatingHours" className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Hours *
                  </label>
                  <Input
                    id="operatingHours"
                    name="operatingHours"
                    type="text"
                    required
                    value={formData.operatingHours}
                    onChange={handleInputChange}
                    placeholder="e.g., 8:00 AM - 6:00 PM"
                  />
                </div>
              </div>
            </div>

            {/* Additional Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Requirements</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hasFireSafety" className="block text-sm font-medium text-gray-700 mb-1">
                    Fire Safety Inspection Certificate *
                  </label>
                  <select
                    id="hasFireSafety"
                    name="hasFireSafety"
                    required
                    value={formData.hasFireSafety}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select option</option>
                    <option value="yes">Yes, I have it</option>
                    <option value="no">No, not applicable</option>
                    <option value="pending">Pending application</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hasSanitaryPermit" className="block text-sm font-medium text-gray-700 mb-1">
                    Sanitary Permit (for food business) *
                  </label>
                  <select
                    id="hasSanitaryPermit"
                    name="hasSanitaryPermit"
                    required
                    value={formData.hasSanitaryPermit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select option</option>
                    <option value="yes">Yes, I have it</option>
                    <option value="no">No, not applicable</option>
                    <option value="pending">Pending application</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements or Notes
                </label>
                <textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  rows={3}
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or additional information"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
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
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-green-800 mb-3">💼 Business Permit Guidelines</h3>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• Business permit is valid for one (1) year from date of issuance</li>
            <li>• Annual renewal is required before expiration</li>
            <li>• Display permit prominently in your business premises</li>
            <li>• Comply with all barangay ordinances and regulations</li>
            <li>• Additional permits may be required from other agencies</li>
            <li>• Business inspection may be conducted before permit issuance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
