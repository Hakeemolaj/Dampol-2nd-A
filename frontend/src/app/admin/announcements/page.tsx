'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Mock announcements data
const mockAnnouncements = [
  {
    id: 'ANN-001',
    title: 'Barangay Assembly - January 15, 2025',
    summary: 'Monthly barangay assembly for Dampol 2nd A residents to discuss community matters',
    content: 'Join us for our monthly community meeting at the Dampol 2nd A Barangay Hall. We will discuss important matters affecting our community including upcoming infrastructure projects, community programs, and budget allocations for the next quarter. All residents are encouraged to attend.',
    category: 'Meeting',
    priority: 'normal',
    status: 'Published',
    author: 'Barangay Captain',
    publishedAt: '2025-01-10T08:00:00Z',
    expiresAt: '2025-01-15T18:00:00Z',
    createdAt: '2025-01-10T08:00:00Z',
    views: 245,
    targetAudience: 'All Residents',
    channels: ['Website', 'Facebook', 'SMS']
  },
  {
    id: 'ANN-002',
    title: 'Free Medical Mission - January 20, 2025',
    summary: 'Health program available for all Dampol 2nd A residents',
    content: 'We are pleased to announce a free medical mission for all Dampol 2nd A residents. This program includes basic health screening, blood pressure monitoring, consultation with licensed medical professionals, and free medicines. Venue: Dampol 2nd A Barangay Hall.',
    category: 'Health',
    priority: 'high',
    status: 'Published',
    author: 'Health Committee',
    publishedAt: '2025-01-12T09:00:00Z',
    expiresAt: '2025-01-20T17:00:00Z',
    createdAt: '2025-01-12T09:00:00Z',
    views: 189,
    targetAudience: 'All Residents',
    channels: ['Website', 'Facebook', 'Bulletin Board']
  },
  {
    id: 'ANN-003',
    title: 'Road Improvement Project - Dampol Road',
    summary: 'Road concreting project ongoing, expect traffic delays',
    content: 'Please be advised that road improvement work is currently ongoing on Dampol Road from 7:00 AM to 5:00 PM daily. The project includes road concreting and drainage improvement. Residents are advised to use alternative routes and expect minor traffic delays during this period. Expected completion: February 2025.',
    category: 'Infrastructure',
    priority: 'urgent',
    status: 'Published',
    author: 'Public Works',
    publishedAt: '2025-01-08T06:00:00Z',
    expiresAt: '2025-02-28T18:00:00Z',
    createdAt: '2025-01-08T06:00:00Z',
    views: 312,
    targetAudience: 'All Residents',
    channels: ['Website', 'Facebook', 'SMS', 'Loudspeaker']
  },
  {
    id: 'ANN-004',
    title: 'Emergency Preparedness Training',
    summary: 'Disaster preparedness training for household leaders',
    content: 'The Barangay Disaster Risk Reduction and Management Committee will conduct emergency preparedness training for all household leaders. Topics include earthquake safety, flood response, fire prevention, and first aid basics. Registration is required.',
    category: 'Emergency',
    priority: 'high',
    status: 'Draft',
    author: 'DRRM Committee',
    publishedAt: null,
    expiresAt: '2025-02-15T17:00:00Z',
    createdAt: '2025-01-16T14:30:00Z',
    views: 0,
    targetAudience: 'Household Leaders',
    channels: ['Website', 'Facebook']
  }
]

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
  'Published': 'bg-green-100 text-green-800 border-green-200',
  'Scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
  'Expired': 'bg-red-100 text-red-800 border-red-200',
  'Archived': 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const priorityColors = {
  'normal': 'bg-gray-100 text-gray-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800',
}

const categoryIcons = {
  'Meeting': '👥',
  'Health': '🏥',
  'Infrastructure': '🚧',
  'Emergency': '🚨',
  'Event': '🎉',
  'Environment': '🌱',
  'Education': '📚',
  'Safety': '🛡️'
}

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || announcement.status.toLowerCase() === filterStatus
    const matchesCategory = filterCategory === 'all' || announcement.category.toLowerCase() === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStats = () => {
    return {
      total: announcements.length,
      published: announcements.filter(a => a.status === 'Published').length,
      draft: announcements.filter(a => a.status === 'Draft').length,
      urgent: announcements.filter(a => a.priority === 'urgent').length,
      totalViews: announcements.reduce((sum, a) => sum + a.views, 0)
    }
  }

  const stats = getStats()

  const publishAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === id 
        ? { ...ann, status: 'Published', publishedAt: new Date().toISOString() }
        : ann
    ))
  }

  const archiveAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === id ? { ...ann, status: 'Archived' } : ann
    ))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcement Management</h1>
          <p className="text-gray-600 mt-1">Create and manage community announcements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            📊 Analytics
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            📢 Create Announcement
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="government-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search announcements by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="lg:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="meeting">Meeting</option>
                <option value="health">Health</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="emergency">Emergency</option>
                <option value="event">Event</option>
                <option value="environment">Environment</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="grid gap-6">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="government-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">
                    {categoryIcons[announcement.category as keyof typeof categoryIcons] || '📢'}
                  </span>
                  <div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {announcement.summary}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>By {announcement.author}</span>
                      <span>•</span>
                      <span>{announcement.views} views</span>
                      <span>•</span>
                      <span>{announcement.targetAudience}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[announcement.status as keyof typeof statusColors]}`}>
                    {announcement.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[announcement.priority as keyof typeof priorityColors]}`}>
                    {announcement.priority}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-700 line-clamp-2">
                {announcement.content}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-600">Channels:</span>
                {announcement.channels.map((channel) => (
                  <span key={channel} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {channel}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  {announcement.publishedAt ? (
                    <span>Published: {new Date(announcement.publishedAt).toLocaleDateString()}</span>
                  ) : (
                    <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
                {announcement.expiresAt && (
                  <div>
                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedAnnouncement(announcement)}
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Edit
                </Button>
                {announcement.status === 'Draft' && (
                  <Button 
                    size="sm" 
                    onClick={() => publishAnnouncement(announcement.id)}
                    className="flex-1"
                  >
                    Publish
                  </Button>
                )}
                {announcement.status === 'Published' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => archiveAnnouncement(announcement.id)}
                    className="flex-1"
                  >
                    Archive
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary-800 mb-3">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              🚨 Emergency Alert
            </Button>
            <Button variant="outline" className="justify-start">
              📱 SMS Broadcast
            </Button>
            <Button variant="outline" className="justify-start">
              📊 View Analytics
            </Button>
            <Button variant="outline" className="justify-start">
              📋 Templates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">
                      {categoryIcons[selectedAnnouncement.category as keyof typeof categoryIcons] || '📢'}
                    </span>
                    {selectedAnnouncement.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedAnnouncement.summary}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedAnnouncement(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-700">{selectedAnnouncement.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Author:</span>
                  <p className="font-medium">{selectedAnnouncement.author}</p>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium">{selectedAnnouncement.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">Target Audience:</span>
                  <p className="font-medium">{selectedAnnouncement.targetAudience}</p>
                </div>
                <div>
                  <span className="text-gray-600">Views:</span>
                  <p className="font-medium">{selectedAnnouncement.views}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button className="flex-1">Edit Announcement</Button>
                <Button variant="outline" className="flex-1">Duplicate</Button>
                <Button variant="outline" className="flex-1">Share</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
