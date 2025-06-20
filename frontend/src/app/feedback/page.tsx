'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    subject: '',
    message: '',
    rating: '',
    submitterName: '',
    submitterEmail: '',
    submitterPhone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const feedbackTypes = [
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'inquiry', label: 'General Inquiry' },
    { value: 'compliment', label: 'Compliment' }
  ]

  const categories = [
    { value: 'Service Quality', label: 'Service Quality' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Health Services', label: 'Health Services' },
    { value: 'General Inquiry', label: 'General Inquiry' },
    { value: 'Emergency Services', label: 'Emergency Services' },
    { value: 'Document Processing', label: 'Document Processing' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Feedback submitted:', formData)
      setSubmitted(true)
      
      // Reset form
      setFormData({
        type: '',
        category: '',
        subject: '',
        message: '',
        rating: '',
        submitterName: '',
        submitterEmail: '',
        submitterPhone: ''
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="government-card">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback Submitted Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your feedback. We will review your submission and respond within 3-5 business days.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setSubmitted(false)}>
                  Submit Another Feedback
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Feedback</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your voice matters! Share your suggestions, concerns, or inquiries to help us improve our barangay services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <Card className="government-card">
              <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>
                  Please provide detailed information to help us address your feedback effectively.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Type and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Feedback Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {feedbackTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your feedback"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide detailed information about your feedback..."
                      rows={5}
                      required
                    />
                  </div>

                  {/* Rating (optional) */}
                  {(formData.type === 'suggestion' || formData.type === 'compliment') && (
                    <div>
                      <Label htmlFor="rating">Rating (Optional)</Label>
                      <Select value={formData.rating} onValueChange={(value) => handleInputChange('rating', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate our service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                          <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                          <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                          <SelectItem value="2">⭐⭐ Poor</SelectItem>
                          <SelectItem value="1">⭐ Very Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Contact Information (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="submitterName">Full Name</Label>
                        <Input
                          id="submitterName"
                          value={formData.submitterName}
                          onChange={(e) => handleInputChange('submitterName', e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="submitterEmail">Email Address</Label>
                        <Input
                          id="submitterEmail"
                          type="email"
                          value={formData.submitterEmail}
                          onChange={(e) => handleInputChange('submitterEmail', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="submitterPhone">Phone Number</Label>
                      <Input
                        id="submitterPhone"
                        value={formData.submitterPhone}
                        onChange={(e) => handleInputChange('submitterPhone', e.target.value)}
                        placeholder="+63 912 345 6789"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Providing contact information helps us follow up on your feedback more effectively.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !formData.type || !formData.category || !formData.subject || !formData.message}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setFormData({
                        type: '',
                        category: '',
                        subject: '',
                        message: '',
                        rating: '',
                        submitterName: '',
                        submitterEmail: '',
                        submitterPhone: ''
                      })}
                    >
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Barangay Office</h4>
                  <p className="text-sm text-gray-600">Dampol 2nd A, Pulilan, Bulacan</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Phone</h4>
                  <p className="text-sm text-gray-600">+63 44 123 4567</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-sm text-gray-600">dampol2nda@pulilan.gov.ph</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Office Hours</h4>
                  <p className="text-sm text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p className="text-sm text-gray-600">Saturday: 8:00 AM - 12:00 PM</p>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">General Inquiries</span>
                    <span className="text-sm font-medium">1-2 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Suggestions</span>
                    <span className="text-sm font-medium">3-5 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Complaints</span>
                    <span className="text-sm font-medium">1-3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Emergency Issues</span>
                    <span className="text-sm font-medium text-red-600">Same day</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle>Feedback Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Be specific and provide details</li>
                  <li>• Use respectful language</li>
                  <li>• Include relevant dates and locations</li>
                  <li>• Provide contact info for follow-up</li>
                  <li>• For emergencies, call directly</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
