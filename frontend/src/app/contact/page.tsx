'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const contactInfo = [
    {
      title: 'Barangay Hall Address',
      icon: '📍',
      details: [
        'Barangay Hall, Dampol 2nd A',
        'Pulilan, Bulacan 3005',
        'Philippines'
      ]
    },
    {
      title: 'Phone Numbers',
      icon: '📞',
      details: [
        'Main Office: (044) 815-1234',
        'Mobile: +63 917 123 4567',
        'Emergency: +63 918 123 4567'
      ]
    },
    {
      title: 'Email Addresses',
      icon: '📧',
      details: [
        'General: info@dampol2nda.gov.ph',
        'Captain: captain@dampol2nda.gov.ph',
        'Secretary: secretary@dampol2nda.gov.ph'
      ]
    },
    {
      title: 'Office Hours',
      icon: '🕒',
      details: [
        'Monday - Friday: 8:00 AM - 5:00 PM',
        'Saturday: 8:00 AM - 12:00 PM',
        'Sunday: Closed',
        'Lunch Break: 12:00 PM - 1:00 PM'
      ]
    }
  ]

  const emergencyContacts = [
    { service: 'Barangay Emergency Hotline', number: '(044) 815-1234' },
    { service: 'Fire Department', number: '116' },
    { service: 'Police (PNP)', number: '117' },
    { service: 'Medical Emergency', number: '911' },
    { service: 'NDRRMC Hotline', number: '911-1406' },
    { service: 'Red Cross', number: '143' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Your message has been sent successfully! We will get back to you within 24 hours.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      })
    } catch (err) {
      setError('Failed to send message. Please try again or contact us directly.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">📞</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with Barangay Dampol 2nd A for inquiries, assistance, or feedback. 
            We're here to serve our community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+63 912 345 6789"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="documents">Document Services</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="suggestion">Suggestion</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry or concern..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      disabled={isLoading}
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            {/* Contact Details */}
            {contactInfo.map((info, index) => (
              <Card key={index} className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-600">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Emergency Contacts */}
            <Card className="shadow-lg border-0 border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-lg text-red-700">🚨 Emergency Contacts</CardTitle>
                <CardDescription>
                  For urgent matters and emergencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{contact.service}</span>
                      <a 
                        href={`tel:${contact.number}`}
                        className="text-sm font-bold text-red-600 hover:text-red-700"
                      >
                        {contact.number}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/services">📄 Document Services</a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/track">🔍 Track Document</a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/announcements">📢 Announcements</a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/about">ℹ️ About Us</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        <Card className="shadow-xl border-0 mt-8">
          <CardHeader>
            <CardTitle className="text-xl">📍 Location</CardTitle>
            <CardDescription>
              Find us at the Barangay Hall in Dampol 2nd A, Pulilan, Bulacan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="font-medium">Interactive Map</p>
                <p className="text-sm">Map integration coming soon</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <a
                  href="https://maps.google.com/?q=Dampol+2nd+A,+Pulilan,+Bulacan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🌐 View on Google Maps
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
