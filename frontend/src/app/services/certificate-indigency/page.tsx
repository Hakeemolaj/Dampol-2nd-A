"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const documentInfo = {
  title: "Certificate of Indigency",
  description: "Certificate for low-income residents to access government assistance programs",
  fee: "Free",
  processingTime: "2-3 business days",
  requirements: [
    "Valid government-issued ID (Driver's License, Passport, SSS ID, etc.)",
    "Proof of residency in Barangay Dampol 2nd A (Utility bill, lease contract, etc.)",
    "Income statement or affidavit of no income",
    "Completed application form",
    "2x2 ID picture (2 pieces)"
  ],
  purposes: [
    "Medical assistance applications",
    "Educational scholarships",
    "Government assistance programs",
    "Social services eligibility",
    "Legal aid applications",
    "Other social welfare purposes"
  ]
}

export default function CertificateIndigencyPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    civilStatus: '',
    address: '',
    contactNumber: '',
    email: '',
    purpose: '',
    otherPurpose: '',
    monthlyIncome: '',
    familySize: '',
    occupation: '',
    employmentStatus: '',
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
        <span className="text-gray-900">Certificate of Indigency</span>
      </nav>

      {/* Document Information */}
      <Card className="government-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🤝</span>
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
                  <span className="font-medium text-green-600">{documentInfo.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">{documentInfo.processingTime}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Common Uses</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {documentInfo.purposes.slice(0, 4).map((purpose, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    {purpose}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {documentInfo.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>
            Please fill out all required fields accurately. This certificate is for residents who need to prove their low-income status.
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
                  <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth *
                  </label>
                  <Input
                    id="placeOfBirth"
                    name="placeOfBirth"
                    type="text"
                    required
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    placeholder="Enter your place of birth"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select civil status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="familySize" className="block text-sm font-medium text-gray-700 mb-1">
                    Family Size *
                  </label>
                  <Input
                    id="familySize"
                    name="familySize"
                    type="number"
                    required
                    min="1"
                    value={formData.familySize}
                    onChange={handleInputChange}
                    placeholder="Number of family members"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Complete Address *
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address in Dampol 2nd A"
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

            {/* Economic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Economic Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Status *
                  </label>
                  <select
                    id="employmentStatus"
                    name="employmentStatus"
                    required
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select employment status</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="underemployed">Underemployed</option>
                    <option value="part-time">Part-time Worker</option>
                    <option value="informal">Informal Worker</option>
                    <option value="senior-citizen">Senior Citizen</option>
                    <option value="person-with-disability">Person with Disability</option>
                    <option value="student">Student</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation (if any)
                  </label>
                  <Input
                    id="occupation"
                    name="occupation"
                    type="text"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="Enter your occupation or 'None'"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Family Income *
                </label>
                <select
                  id="monthlyIncome"
                  name="monthlyIncome"
                  required
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select income range</option>
                  <option value="no-income">No Income</option>
                  <option value="below-5000">Below ₱5,000</option>
                  <option value="5000-10000">₱5,000 - ₱10,000</option>
                  <option value="10000-15000">₱10,000 - ₱15,000</option>
                  <option value="15000-20000">₱15,000 - ₱20,000</option>
                  <option value="above-20000">Above ₱20,000 (Please specify reason for indigency)</option>
                </select>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Purpose of Certificate</h3>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select purpose</option>
                  {documentInfo.purposes.map((purpose, index) => (
                    <option key={index} value={purpose.toLowerCase().replace(/\s+/g, '-')}>
                      {purpose}
                    </option>
                  ))}
                  <option value="other">Other (please specify)</option>
                </select>
              </div>

              {formData.purpose === 'other' && (
                <div>
                  <label htmlFor="otherPurpose" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify other purpose *
                  </label>
                  <Input
                    id="otherPurpose"
                    name="otherPurpose"
                    type="text"
                    required={formData.purpose === 'other'}
                    value={formData.otherPurpose}
                    onChange={handleInputChange}
                    placeholder="Please specify the purpose"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-green-800 mb-3">📋 Important Notes</h3>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• This certificate is FREE of charge for qualified residents</li>
            <li>• All information provided will be verified by barangay officials</li>
            <li>• False information may result in denial of application</li>
            <li>• You will be notified via SMS/email when your certificate is ready</li>
            <li>• Bring valid ID when claiming your certificate</li>
            <li>• Office hours: Monday-Friday, 8:00 AM - 5:00 PM</li>
            <li>• Certificate is valid for 6 months from date of issuance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
