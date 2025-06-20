"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const documentInfo = {
  title: "Barangay ID",
  description: "Official identification card for Barangay Dampol 2nd A residents",
  fee: "₱25.00",
  processingTime: "5-7 business days",
  requirements: [
    "Valid government-issued ID (Driver's License, Passport, SSS ID, etc.)",
    "Proof of residency in Barangay Dampol 2nd A (Utility bill, lease contract, etc.)",
    "2x2 ID picture (3 pieces) - white background",
    "Completed application form",
    "Birth certificate (for first-time applicants)"
  ],
  features: [
    "Official barangay identification",
    "Access to barangay services",
    "Emergency contact information",
    "Valid for 3 years",
    "Renewable upon expiration",
    "Accepted as valid ID within the barangay"
  ]
}

export default function BarangayIdPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    civilStatus: '',
    address: '',
    contactNumber: '',
    email: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyContactRelation: '',
    bloodType: '',
    height: '',
    weight: '',
    applicationType: 'new',
    previousIdNumber: '',
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
        <span className="text-gray-900">Barangay ID</span>
      </nav>

      {/* Document Information */}
      <Card className="government-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🆔</span>
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
              <h3 className="font-semibold text-gray-900 mb-3">ID Details</h3>
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
                  <span className="font-medium">3 years</span>
                </div>
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

            {/* Physical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Physical Information</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    min="100"
                    max="250"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="e.g., 165"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="30"
                    max="200"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 65"
                  />
                </div>

                <div>
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contact Information</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    type="text"
                    required
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    placeholder="Full name of emergency contact"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <Input
                    id="emergencyContactNumber"
                    name="emergencyContactNumber"
                    type="tel"
                    required
                    value={formData.emergencyContactNumber}
                    onChange={handleInputChange}
                    placeholder="09XX-XXX-XXXX"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContactRelation" className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <select
                    id="emergencyContactRelation"
                    name="emergencyContactRelation"
                    required
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="relative">Relative</option>
                    <option value="friend">Friend</option>
                    <option value="neighbor">Neighbor</option>
                  </select>
                </div>
              </div>
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 mb-3">📋 Important Notes</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Processing fee of ₱25.00 must be paid upon ID release</li>
            <li>• Bring 3 pieces of 2x2 ID pictures with white background</li>
            <li>• ID is valid for 3 years from date of issuance</li>
            <li>• You will be notified via SMS/email when your ID is ready</li>
            <li>• Bring original documents for verification when claiming</li>
            <li>• Office hours: Monday-Friday, 8:00 AM - 5:00 PM</li>
            <li>• Lost or damaged IDs require replacement fee</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">ID Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {documentInfo.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    {feature}
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
          <CardTitle>ID Application Form</CardTitle>
          <CardDescription>
            Please fill out all required fields accurately. Information will appear on your Barangay ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Application Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Application Type</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="applicationType"
                    value="new"
                    checked={formData.applicationType === 'new'}
                    onChange={handleInputChange}
                    className="text-primary-600"
                  />
                  <span>New Application</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="applicationType"
                    value="renewal"
                    checked={formData.applicationType === 'renewal'}
                    onChange={handleInputChange}
                    className="text-primary-600"
                  />
                  <span>Renewal</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="applicationType"
                    value="replacement"
                    checked={formData.applicationType === 'replacement'}
                    onChange={handleInputChange}
                    className="text-primary-600"
                  />
                  <span>Replacement</span>
                </label>
              </div>

              {(formData.applicationType === 'renewal' || formData.applicationType === 'replacement') && (
                <div>
                  <label htmlFor="previousIdNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Previous ID Number *
                  </label>
                  <Input
                    id="previousIdNumber"
                    name="previousIdNumber"
                    type="text"
                    required
                    value={formData.previousIdNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your previous Barangay ID number"
                  />
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid md:grid-cols-4 gap-4">
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
                    placeholder="First name"
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
                    placeholder="Last name"
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
                    placeholder="Middle name"
                  />
                </div>

                <div>
                  <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 mb-1">
                    Suffix
                  </label>
                  <select
                    id="suffix"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
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
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
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
              </div>
