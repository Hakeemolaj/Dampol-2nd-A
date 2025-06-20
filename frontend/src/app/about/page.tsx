'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  const officials = [
    {
      name: 'Hon. Maria Santos',
      position: 'Barangay Captain',
      image: '👩‍💼',
      description: 'Leading Dampol 2nd A with dedication and transparency since 2019.'
    },
    {
      name: 'Jose Reyes',
      position: 'Barangay Secretary',
      image: '👨‍💼',
      description: 'Managing administrative affairs and document processing.'
    },
    {
      name: 'Ana Cruz',
      position: 'Barangay Treasurer',
      image: '👩‍💼',
      description: 'Overseeing financial management and budget allocation.'
    },
    {
      name: 'Pedro Garcia',
      position: 'SK Chairman',
      image: '👨‍💼',
      description: 'Representing the youth and organizing community programs.'
    }
  ]

  const services = [
    {
      title: 'Document Services',
      icon: '📄',
      description: 'Barangay clearance, certificates, and permits',
      features: ['Barangay Clearance', 'Certificate of Residency', 'Certificate of Indigency', 'Business Permits']
    },
    {
      title: 'Community Programs',
      icon: '🤝',
      description: 'Social services and community development',
      features: ['Senior Citizen Programs', 'Youth Development', 'Livelihood Training', 'Health Services']
    },
    {
      title: 'Public Safety',
      icon: '🛡️',
      description: 'Peace and order maintenance',
      features: ['Barangay Tanod', 'CCTV Monitoring', 'Emergency Response', 'Dispute Resolution']
    },
    {
      title: 'Infrastructure',
      icon: '🏗️',
      description: 'Community facilities and maintenance',
      features: ['Road Maintenance', 'Street Lighting', 'Drainage Systems', 'Public Facilities']
    }
  ]

  const achievements = [
    {
      year: '2024',
      title: 'Digital Transformation',
      description: 'Launched online document request system for faster service delivery.'
    },
    {
      year: '2023',
      title: 'Community Health Program',
      description: 'Implemented comprehensive health monitoring for all residents.'
    },
    {
      year: '2022',
      title: 'Infrastructure Development',
      description: 'Completed major road improvements and street lighting project.'
    },
    {
      year: '2021',
      title: 'COVID-19 Response',
      description: 'Successfully managed pandemic response with zero community transmission.'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Barangay Dampol 2nd A
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Serving our community with integrity, transparency, and dedication since 1975
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">2,847</div>
              <div className="text-gray-600">Total Population</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">1,234</div>
              <div className="text-gray-600">Registered Households</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">49</div>
              <div className="text-gray-600">Years of Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="government-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              To provide efficient, transparent, and responsive governance that promotes the welfare 
              and development of our community. We are committed to delivering quality public services 
              while fostering unity, peace, and progress in Barangay Dampol 2nd A.
            </p>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👁️ Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              A progressive, peaceful, and prosperous barangay where every resident enjoys a high 
              quality of life, sustainable development, and equal opportunities for growth and 
              participation in community affairs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barangay Officials */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Barangay Officials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {officials.map((official, index) => (
            <Card key={index} className="government-card text-center">
              <CardContent className="p-6">
                <div className="text-6xl mb-4">{official.image}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{official.name}</h3>
                <p className="text-primary-600 font-medium mb-3">{official.position}</p>
                <p className="text-sm text-gray-600">{official.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Services Overview */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">{service.icon}</span>
                  {service.title}
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recent Achievements</h2>
        <div className="space-y-6">
          {achievements.map((achievement, index) => (
            <Card key={index} className="government-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                    {achievement.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{achievement.title}</h3>
                    <p className="text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle className="text-center">📍 Contact Information</CardTitle>
          <CardDescription className="text-center">
            Get in touch with us for any inquiries or assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📍 Address</h4>
                <p className="text-gray-600">
                  Barangay Hall, Dampol 2nd A<br />
                  Pulilan, Bulacan 3005<br />
                  Philippines
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📞 Contact Numbers</h4>
                <p className="text-gray-600">
                  Landline: (044) 123-4567<br />
                  Mobile: +63 917 123 4567<br />
                  Emergency: +63 918 123 4567
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📧 Email</h4>
                <p className="text-gray-600">
                  info@dampol2nda.gov.ph<br />
                  captain@dampol2nda.gov.ph
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🕒 Office Hours</h4>
                <p className="text-gray-600">
                  Monday - Friday: 8:00 AM - 5:00 PM<br />
                  Saturday: 8:00 AM - 12:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/contact">
                📞 Contact Us
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
