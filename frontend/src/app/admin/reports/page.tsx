'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import analyticsService, {
  AnalyticsOverview,
  DemographicsData,
  ServicesData,
  FinancialData,
  CommunicationData,
  OperationalData
} from '@/services/analyticsService'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

// Chart colors
const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899'
}

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// Mock data for analytics
const analyticsData = {
  overview: {
    totalResidents: 8542,
    totalHouseholds: 2134,
    activeRequests: 47,
    completedRequests: 1256,
    monthlyRevenue: 45230,
    pendingDocuments: 23
  },
  demographics: {
    ageGroups: [
      { range: '0-17', count: 2156, percentage: 25.2 },
      { range: '18-35', count: 2734, percentage: 32.0 },
      { range: '36-55', count: 2389, percentage: 28.0 },
      { range: '56+', count: 1263, percentage: 14.8 }
    ],
    gender: [
      { type: 'Male', count: 4321, percentage: 50.6 },
      { type: 'Female', count: 4221, percentage: 49.4 }
    ]
  },
  services: {
    popularDocuments: [
      {
        type: 'Barangay Clearance',
        requests: 456,
        avgProcessingDays: 3,
        completionRate: 98.5,
        revenue: 22800,
        satisfaction: 4.8
      },
      {
        type: 'Certificate of Residency',
        requests: 234,
        avgProcessingDays: 2,
        completionRate: 99.1,
        revenue: 7020,
        satisfaction: 4.9
      },
      {
        type: 'Business Permit',
        requests: 123,
        avgProcessingDays: 7,
        completionRate: 94.3,
        revenue: 12300,
        satisfaction: 4.2
      },
      {
        type: 'Certificate of Indigency',
        requests: 89,
        avgProcessingDays: 2,
        completionRate: 100,
        revenue: 0,
        satisfaction: 4.7
      }
    ],
    monthlyTrends: [
      { month: 'Jan', requests: 145, completed: 142, pending: 3 },
      { month: 'Feb', requests: 167, completed: 164, pending: 3 },
      { month: 'Mar', requests: 189, completed: 185, pending: 4 },
      { month: 'Apr', requests: 156, completed: 152, pending: 4 },
      { month: 'May', requests: 178, completed: 174, pending: 4 },
      { month: 'Jun', requests: 203, completed: 196, pending: 7 }
    ],
    processingTimes: [
      { step: 'Application Received', avgHours: 0.5 },
      { step: 'Document Review', avgHours: 24 },
      { step: 'Verification', avgHours: 12 },
      { step: 'Approval', avgHours: 6 },
      { step: 'Document Preparation', avgHours: 4 },
      { step: 'Ready for Pickup', avgHours: 1 }
    ],
    statusDistribution: [
      { status: 'Completed', count: 1256, percentage: 78.5 },
      { status: 'Processing', count: 234, percentage: 14.6 },
      { status: 'Pending', count: 89, percentage: 5.6 },
      { status: 'Rejected', count: 21, percentage: 1.3 }
    ]
  },
  financial: {
    monthlyRevenue: [
      { month: 'Jan', revenue: 38450 },
      { month: 'Feb', revenue: 42100 },
      { month: 'Mar', revenue: 39800 },
      { month: 'Apr', revenue: 41200 },
      { month: 'May', revenue: 43600 },
      { month: 'Jun', revenue: 45230 }
    ],
    revenueByService: [
      { service: 'Document Fees', amount: 28450, percentage: 62.9 },
      { service: 'Business Permits', amount: 12300, percentage: 27.2 },
      { service: 'Other Services', amount: 4480, percentage: 9.9 }
    ]
  }
}

const reportCategories = [
  { id: 'overview', name: 'Overview', icon: '📊', description: 'General statistics and KPIs' },
  { id: 'demographics', name: 'Demographics', icon: '👥', description: 'Population and resident data' },
  { id: 'services', name: 'Services', icon: '📄', description: 'Document and service analytics' },
  { id: 'financial', name: 'Financial', icon: '💰', description: 'Revenue and budget reports' },
  { id: 'operational', name: 'Operational', icon: '⚙️', description: 'Performance and efficiency' },
  { id: 'communication', name: 'Communication', icon: '📢', description: 'Announcements and engagement' }
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('overview')
  const [dateRange, setDateRange] = useState('last30days')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    overview: null as AnalyticsOverview | null,
    demographics: null as DemographicsData | null,
    services: null as ServicesData | null,
    financial: null as FinancialData | null,
    communication: null as CommunicationData | null,
    operational: null as OperationalData | null
  })

  // Fetch analytics data
  const fetchAnalyticsData = async (category: string) => {
    setLoading(true)
    setError(null)

    try {
      switch (category) {
        case 'overview':
          if (!analyticsData.overview) {
            const data = await analyticsService.getOverview(dateRange)
            setAnalyticsData(prev => ({ ...prev, overview: data }))
          }
          break
        case 'demographics':
          if (!analyticsData.demographics) {
            const data = await analyticsService.getDemographics()
            setAnalyticsData(prev => ({ ...prev, demographics: data }))
          }
          break
        case 'services':
          if (!analyticsData.services) {
            const data = await analyticsService.getServices(dateRange)
            setAnalyticsData(prev => ({ ...prev, services: data }))
          }
          break
        case 'financial':
          if (!analyticsData.financial) {
            const data = await analyticsService.getFinancial(dateRange)
            setAnalyticsData(prev => ({ ...prev, financial: data }))
          }
          break
        case 'communication':
          if (!analyticsData.communication) {
            const data = await analyticsService.getCommunication(dateRange)
            setAnalyticsData(prev => ({ ...prev, communication: data }))
          }
          break
        case 'operational':
          if (!analyticsData.operational) {
            const data = await analyticsService.getOperational(dateRange)
            setAnalyticsData(prev => ({ ...prev, operational: data }))
          }
          break
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchAnalyticsData(selectedCategory)
  }, [selectedCategory, dateRange])

  // Handle export functionality
  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      await analyticsService.downloadExport(format, selectedCategory, dateRange)
    } catch (err) {
      console.error('Error exporting data:', err)
      setError('Failed to export data. Please try again.')
    }
  }

  const filteredCategories = reportCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Data insights and performance metrics for Barangay Dampol 2nd A</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            disabled={loading}
          >
            📤 Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={loading}
          >
            📊 Export CSV
          </Button>
          <Button variant="outline" size="sm" disabled>
            📅 Schedule Report
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="government-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search reports and analytics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="lg:w-48">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last3months">Last 3 Months</option>
                <option value="last6months">Last 6 Months</option>
                <option value="lastyear">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="lg:w-32">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setAnalyticsData({
                    overview: null,
                    demographics: null,
                    services: null,
                    financial: null,
                    communication: null,
                    operational: null
                  })
                  fetchAnalyticsData(selectedCategory)
                }}
                disabled={loading}
              >
                {loading ? '⏳' : '🔄'} Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="government-card border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Error Loading Analytics</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Card className="government-card">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading analytics data...</p>
          </CardContent>
        </Card>
      )}

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <Card 
            key={category.id} 
            className={`government-card cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedCategory === category.id 
                ? 'ring-2 ring-primary-500 bg-primary-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  selectedCategory === category.id 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    selectedCategory === category.id ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {category.name}
                  </h3>
                  <p className={`text-sm ${
                    selectedCategory === category.id ? 'text-primary-700' : 'text-gray-600'
                  }`}>
                    {category.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview Dashboard */}
      {selectedCategory === 'overview' && analyticsData.overview && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="government-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Residents</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalResidents.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{analyticsData.overview.totalHouseholds.toLocaleString()} households</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Document Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeRequests}</p>
                    <p className="text-xs text-green-600">+{analyticsData.overview.completedRequests} completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₱{analyticsData.overview.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-xs text-purple-600">+12% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-xl font-bold text-gray-900">{analyticsData.overview.pendingDocuments}</div>
                <div className="text-sm text-gray-600">Pending Documents</div>
              </CardContent>
            </Card>
            
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-xl font-bold text-gray-900">2.5</div>
                <div className="text-sm text-gray-600">Avg Processing Days</div>
              </CardContent>
            </Card>
            
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-xl font-bold text-green-600">94%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </CardContent>
            </Card>
            
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">😊</div>
                <div className="text-xl font-bold text-blue-600">4.8</div>
                <div className="text-sm text-gray-600">Satisfaction Score</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Demographics Dashboard */}
      {selectedCategory === 'demographics' && analyticsData.demographics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Distribution Chart */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Age Distribution
                </CardTitle>
                <CardDescription>Population breakdown by age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.demographics.ageGroups}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value.toLocaleString(), 'Population']}
                        labelFormatter={(label) => `Age Group: ${label}`}
                      />
                      <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.demographics.ageGroups.map((group, index) => (
                    <div key={group.range} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS.primary }}
                        ></div>
                        <span>{group.range} years</span>
                      </div>
                      <span className="font-medium">{group.count.toLocaleString()} ({group.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gender Distribution Pie Chart */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  Gender Distribution
                </CardTitle>
                <CardDescription>Population breakdown by gender</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.demographics.gender}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.demographics.gender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.primary : COLORS.pink} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Population']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.demographics.gender.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: index === 0 ? COLORS.primary : COLORS.pink }}
                        ></div>
                        <span>{item.type}</span>
                      </div>
                      <span className="font-medium">{item.count.toLocaleString()} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Services Analytics */}
      {selectedCategory === 'services' && analyticsData.services && (
        <div className="space-y-6">
          {/* Service Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📄</div>
                <div className="text-xl font-bold text-gray-900">{analyticsData.services.popularDocuments.reduce((sum, doc) => sum + doc.requests, 0)}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-xl font-bold text-gray-900">
                  {(analyticsData.services.popularDocuments.reduce((sum, doc) => sum + doc.avgProcessingDays, 0) / analyticsData.services.popularDocuments.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Processing Days</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-xl font-bold text-green-600">
                  {(analyticsData.services.popularDocuments.reduce((sum, doc) => sum + doc.completionRate, 0) / analyticsData.services.popularDocuments.length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">😊</div>
                <div className="text-xl font-bold text-blue-600">
                  {(analyticsData.services.popularDocuments.reduce((sum, doc) => sum + doc.satisfaction, 0) / analyticsData.services.popularDocuments.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Satisfaction Score</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Requests Chart */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  Document Requests
                </CardTitle>
                <CardDescription>Popular document types by request volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.services.popularDocuments} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="type" type="category" width={120} />
                      <Tooltip
                        formatter={(value, name) => [value, 'Requests']}
                        labelFormatter={(label) => `Document: ${label}`}
                      />
                      <Bar dataKey="requests" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Request Status Distribution
                </CardTitle>
                <CardDescription>Current status of all document requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.services.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) => `${status}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.services.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Requests']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.services.statusDistribution.map((item, index) => (
                    <div key={item.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        ></div>
                        <span>{item.status}</span>
                      </div>
                      <span className="font-medium">{item.count.toLocaleString()} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card className="government-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Monthly Request & Completion Trends
              </CardTitle>
              <CardDescription>Document request and completion trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.services.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, name === 'requests' ? 'Requests' : name === 'completed' ? 'Completed' : 'Pending']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                      name="Requests"
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="2"
                      stroke={COLORS.secondary}
                      fill={COLORS.secondary}
                      fillOpacity={0.6}
                      name="Completed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Processing Workflow Analytics */}
          <Card className="government-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Processing Workflow Analysis
              </CardTitle>
              <CardDescription>Average time spent at each processing step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.services.processingTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" angle={-45} textAnchor="end" height={100} />
                    <YAxis
                      tickFormatter={(value) => `${value}h`}
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} hours`, 'Processing Time']}
                      labelFormatter={(label) => `Step: ${label}`}
                    />
                    <Bar dataKey="avgHours" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Process Time:</span>
                  <p className="font-semibold text-gray-900">
                    {analyticsData.services.processingTimes.reduce((sum, step) => sum + step.avgHours, 0)} hours
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Longest Step:</span>
                  <p className="font-semibold text-gray-900">Document Review</p>
                </div>
                <div>
                  <span className="text-gray-600">Efficiency Score:</span>
                  <p className="font-semibold text-green-600">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card className="government-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Document Processing Details
              </CardTitle>
              <CardDescription>Comprehensive breakdown of document types and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Document Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Requests</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Processing</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Completion Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Satisfaction</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.services.popularDocuments.map((doc, index) => (
                      <tr key={doc.type} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-medium">{doc.type}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900 font-semibold">{doc.requests}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.avgProcessingDays <= 3
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.avgProcessingDays} days
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${doc.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-900">
                              {doc.completionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900 font-medium">
                            {doc.revenue > 0 ? `₱${doc.revenue.toLocaleString()}` : 'Free'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm font-medium">{doc.satisfaction}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            index % 2 === 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {index % 2 === 0 ? '↗ Increasing' : '→ Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Statistics */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {analyticsData.services.popularDocuments.reduce((sum, doc) => sum + doc.requests, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(analyticsData.services.popularDocuments.reduce((sum, doc) => sum + doc.completionRate, 0) / analyticsData.services.popularDocuments.length).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₱{analyticsData.services.popularDocuments.reduce((sum, doc) => sum + doc.revenue, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {(analyticsData.services.popularDocuments.reduce((sum, doc) => sum + doc.satisfaction, 0) / analyticsData.services.popularDocuments.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Analytics */}
      {selectedCategory === 'financial' && analyticsData.financial && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Service Pie Chart */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Revenue by Service
                </CardTitle>
                <CardDescription>Income breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.financial.revenueByService}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ service, percentage }) => `${service}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {analyticsData.financial.revenueByService.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Service: ${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.financial.revenueByService.map((item, index) => (
                    <div key={item.service} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        ></div>
                        <span>{item.service}</span>
                      </div>
                      <span className="font-medium">₱{item.amount.toLocaleString()} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Trend Line Chart */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  Monthly Revenue Trend
                </CardTitle>
                <CardDescription>Revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.financial.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS.secondary}
                        strokeWidth={3}
                        dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Average Monthly:</span>
                    <p className="font-semibold text-gray-900">
                      ₱{Math.round(analyticsData.financial.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / analyticsData.financial.monthlyRevenue.length).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Growth Rate:</span>
                    <p className="font-semibold text-green-600">+12.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">💵</div>
                <div className="text-xl font-bold text-gray-900">₱{analyticsData.overview?.monthlyRevenue?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-600">Current Month</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-xl font-bold text-gray-900">₱{((analyticsData.overview?.monthlyRevenue || 0) * 12).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Projected Annual</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-xl font-bold text-green-600">+12%</div>
                <div className="text-sm text-gray-600">Growth Rate</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-gray-600">Collection Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Communication Analytics */}
      {selectedCategory === 'communication' && analyticsData.communication && (
        <div className="space-y-6">
          {/* Communication Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📢</div>
                <div className="text-xl font-bold text-gray-900">{analyticsData.communication.announcements.totalPublished}</div>
                <div className="text-sm text-gray-600">Total Announcements</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">👀</div>
                <div className="text-xl font-bold text-blue-600">{analyticsData.communication.announcements.totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-xl font-bold text-green-600">{analyticsData.communication.announcements.totalEngagements}</div>
                <div className="text-sm text-gray-600">Total Engagements</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-xl font-bold text-purple-600">{analyticsData.communication.announcements.engagementRate}%</div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Announcement Category Breakdown */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Announcement Categories
                </CardTitle>
                <CardDescription>Performance by announcement category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.communication.announcements.categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'views' ? value.toLocaleString() : value,
                          name === 'views' ? 'Views' : name === 'engagements' ? 'Engagements' : 'Count'
                        ]}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="views" fill={COLORS.primary} name="Views" />
                      <Bar dataKey="engagements" fill={COLORS.secondary} name="Engagements" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.communication.announcements.categoryBreakdown.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        ></div>
                        <span>{category.category}</span>
                      </div>
                      <span className="font-medium">{category.count} posts • {category.avgEngagement}% engagement</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Priority Distribution
                </CardTitle>
                <CardDescription>Announcements by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.communication.announcements.priorityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ priority, percentage }) => `${priority}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.communication.announcements.priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Announcements']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.communication.announcements.priorityDistribution.map((item, index) => (
                    <div key={item.priority} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        ></div>
                        <span>{item.priority}</span>
                      </div>
                      <span className="font-medium">{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback Sentiment Analysis */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">😊</span>
                  Feedback Sentiment
                </CardTitle>
                <CardDescription>Resident feedback sentiment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.communication.feedback.sentimentAnalysis}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ sentiment, percentage }) => `${sentiment}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.communication.feedback.sentimentAnalysis.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.sentiment === 'Positive' ? COLORS.secondary :
                                  entry.sentiment === 'Neutral' ? COLORS.accent : COLORS.danger}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Feedback']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.communication.feedback.sentimentAnalysis.map((item, index) => (
                    <div key={item.sentiment} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: item.sentiment === 'Positive' ? COLORS.secondary :
                                           item.sentiment === 'Neutral' ? COLORS.accent : COLORS.danger
                          }}
                        ></div>
                        <span>{item.sentiment}</span>
                      </div>
                      <span className="font-medium">{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Categories */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Feedback Categories
                </CardTitle>
                <CardDescription>Feedback breakdown by category and resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.communication.feedback.categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value, name === 'count' ? 'Total' : 'Resolved']}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="count" fill={COLORS.primary} name="Total" />
                      <Bar dataKey="resolved" fill={COLORS.secondary} name="Resolved" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Feedback:</span>
                    <p className="font-semibold text-gray-900">{analyticsData.communication.feedback.totalSubmissions}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Rating:</span>
                    <p className="font-semibold text-yellow-600">⭐ {analyticsData.communication.feedback.averageRating}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Response Rate:</span>
                    <p className="font-semibold text-green-600">{analyticsData.communication.feedback.responseRate}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Resolution:</span>
                    <p className="font-semibold text-blue-600">{analyticsData.communication.feedback.resolutionTime} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Website Traffic */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🌐</span>
                  Website Traffic
                </CardTitle>
                <CardDescription>Website engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Visitors</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.websiteTraffic.totalVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unique Visitors</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.websiteTraffic.uniqueVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Page Views</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.websiteTraffic.pageViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Session</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.websiteTraffic.avgSessionDuration} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                    <span className="font-semibold text-yellow-600">{analyticsData.communication.engagement.websiteTraffic.bounceRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Return Rate</span>
                    <span className="font-semibold text-green-600">{analyticsData.communication.engagement.websiteTraffic.returnVisitorRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  Social Media
                </CardTitle>
                <CardDescription>Social media engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Followers</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.socialMedia.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Posts</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.socialMedia.posts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Likes</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.socialMedia.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Shares</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.socialMedia.shares}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comments</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.socialMedia.comments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Engagement Rate</span>
                    <span className="font-semibold text-blue-600">{analyticsData.communication.engagement.socialMedia.engagementRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Digital Services */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💻</span>
                  Digital Services
                </CardTitle>
                <CardDescription>Online service adoption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Online Applications</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.digitalServices.onlineApplications.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Digital Adoption</span>
                    <span className="font-semibold text-green-600">{analyticsData.communication.engagement.digitalServices.digitalAdoption}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">User Satisfaction</span>
                    <span className="font-semibold text-yellow-600">⭐ {analyticsData.communication.engagement.digitalServices.userSatisfaction}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-semibold text-blue-600">{analyticsData.communication.engagement.digitalServices.completionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Completion</span>
                    <span className="font-semibold">{analyticsData.communication.engagement.digitalServices.avgCompletionTime} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reach Metrics Summary */}
          <Card className="government-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Communication Reach & Impact
              </CardTitle>
              <CardDescription>Overall communication effectiveness metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{analyticsData.communication.announcements.reachMetrics.totalReach.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analyticsData.communication.announcements.reachMetrics.uniqueViewers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Unique Viewers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{analyticsData.communication.announcements.reachMetrics.viewerRetentionRate}%</div>
                  <div className="text-sm text-gray-600">Retention Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{analyticsData.communication.announcements.reachMetrics.avgTimeOnAnnouncement}s</div>
                  <div className="text-sm text-gray-600">Avg Read Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{analyticsData.communication.announcements.engagementRate}%</div>
                  <div className="text-sm text-gray-600">Engagement Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Operational Performance Dashboard */}
      {selectedCategory === 'operational' && analyticsData.operational && (
        <div className="space-y-6">
          {/* Operational Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-xl font-bold text-gray-900">{analyticsData.operational.staffPerformance.totalStaff}</div>
                <div className="text-sm text-gray-600">Total Staff</div>
                <div className="text-xs text-green-600">{analyticsData.operational.staffPerformance.activeStaff} active</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-xl font-bold text-blue-600">{analyticsData.operational.staffPerformance.avgProductivityScore}%</div>
                <div className="text-sm text-gray-600">Avg Productivity</div>
                <div className="text-xs text-blue-600">{analyticsData.operational.staffPerformance.staffUtilization}% utilization</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-xl font-bold text-green-600">{analyticsData.operational.serviceDelivery.avgDeliveryTime}</div>
                <div className="text-sm text-gray-600">Avg Delivery (days)</div>
                <div className="text-xs text-green-600">{analyticsData.operational.serviceDelivery.onTimeDeliveryRate}% on-time</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-xl font-bold text-purple-600">{analyticsData.operational.workflowEfficiency.automationRate}%</div>
                <div className="text-sm text-gray-600">Automation Rate</div>
                <div className="text-xs text-purple-600">{analyticsData.operational.workflowEfficiency.automatedWorkflows}/{analyticsData.operational.workflowEfficiency.totalWorkflows} workflows</div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance & Service Delivery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Performance by Department */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👨‍💼</span>
                  Staff Performance by Department
                </CardTitle>
                <CardDescription>Productivity and efficiency metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.operational.staffPerformance.staffBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'productivityScore' ? `${value}%` : value,
                          name === 'productivityScore' ? 'Productivity Score' :
                          name === 'efficiency' ? 'Efficiency' : 'Tasks Completed'
                        ]}
                        labelFormatter={(label) => `Department: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="tasksCompleted" fill={COLORS.primary} name="Tasks Completed" />
                      <Bar dataKey="productivityScore" fill={COLORS.secondary} name="Productivity Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.operational.staffPerformance.staffBreakdown.map((dept, index) => (
                    <div key={dept.department} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        ></div>
                        <span>{dept.department}</span>
                      </div>
                      <span className="font-medium">{dept.staff} staff • {dept.efficiency}% efficiency</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Delivery Performance */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  Service Delivery Performance
                </CardTitle>
                <CardDescription>Service efficiency and satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.operational.serviceDelivery.serviceBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'onTimeRate' ? `${value}%` :
                          name === 'satisfaction' ? `${value}/5` :
                          name === 'avgDeliveryTime' ? `${value} days` : value,
                          name === 'onTimeRate' ? 'On-Time Rate' :
                          name === 'satisfaction' ? 'Satisfaction' :
                          name === 'avgDeliveryTime' ? 'Avg Delivery Time' : 'Requests'
                        ]}
                        labelFormatter={(label) => `Service: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="requests" fill={COLORS.primary} name="Requests" />
                      <Bar dataKey="onTimeRate" fill={COLORS.secondary} name="On-Time Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Avg Satisfaction:</span>
                    <p className="font-semibold text-yellow-600">⭐ {analyticsData.operational.serviceDelivery.customerSatisfaction}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">SLA Compliance:</span>
                    <p className="font-semibold text-green-600">{analyticsData.operational.serviceDelivery.slaCompliance}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Efficiency & Administrative Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflow Efficiency */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⚙️</span>
                  Workflow Efficiency
                </CardTitle>
                <CardDescription>Process automation and optimization metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.operational.workflowEfficiency.workflowBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="workflow" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'automationLevel' ? `${value}%` :
                          name === 'efficiency' ? `${value}%` :
                          name === 'avgTime' ? `${value} hours` : value,
                          name === 'automationLevel' ? 'Automation Level' :
                          name === 'efficiency' ? 'Efficiency' :
                          name === 'avgTime' ? 'Avg Time' : 'Steps'
                        ]}
                        labelFormatter={(label) => `Workflow: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="efficiency" fill={COLORS.primary} name="Efficiency %" />
                      <Bar dataKey="automationLevel" fill={COLORS.secondary} name="Automation %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Improvement Areas:</span>
                    <div className="mt-1 space-y-1">
                      {analyticsData.operational.workflowEfficiency.improvementAreas.map((area, index) => (
                        <div key={area.area} className="flex items-center justify-between">
                          <span className="text-gray-900">{area.area}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            area.priority === 'High' ? 'bg-red-100 text-red-800' :
                            area.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {area.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI Tracking */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  KPI Performance Tracking
                </CardTitle>
                <CardDescription>Key performance indicators vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.operational.administrativeMetrics.kpiTracking.map((kpi, index) => (
                    <div key={kpi.kpi} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{kpi.kpi}</span>
                        <span className={`text-sm font-semibold ${
                          kpi.performance >= 100 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {kpi.performance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            kpi.performance >= 100 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(kpi.performance, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Target: {kpi.target}</span>
                        <span>Actual: {kpi.actual}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Compliance Rate:</span>
                    <p className="font-semibold text-green-600">{analyticsData.operational.administrativeMetrics.complianceRate}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Audit Score:</span>
                    <p className="font-semibold text-blue-600">{analyticsData.operational.administrativeMetrics.auditScore}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Utilization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facility Usage */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🏢</span>
                  Facility Utilization
                </CardTitle>
                <CardDescription>Facility usage and capacity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.operational.resourceUtilization.facilityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="facility" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'usage' ? `${value}%` :
                          name === 'efficiency' ? `${value}%` : value,
                          name === 'usage' ? 'Usage Rate' :
                          name === 'efficiency' ? 'Efficiency' : 'Capacity'
                        ]}
                        labelFormatter={(label) => `Facility: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="usage" fill={COLORS.primary} name="Usage %" />
                      <Bar dataKey="efficiency" fill={COLORS.secondary} name="Efficiency %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Overall Usage:</span>
                      <p className="font-semibold text-blue-600">{analyticsData.operational.resourceUtilization.facilityUsage}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Optimization:</span>
                      <p className="font-semibold text-green-600">{analyticsData.operational.resourceUtilization.resourceOptimization}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Status */}
            <Card className="government-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🖥️</span>
                  Equipment Status
                </CardTitle>
                <CardDescription>Equipment functionality and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.operational.resourceUtilization.equipmentStatus.map((equipment, index) => (
                    <div key={equipment.equipment} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{equipment.equipment}</span>
                        <span className="text-sm text-gray-600">
                          {equipment.functional}/{equipment.total} functional
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            equipment.efficiency >= 90 ? 'bg-green-500' :
                            equipment.efficiency >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${equipment.efficiency}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Efficiency: {equipment.efficiency}%</span>
                        <span className={`font-medium ${
                          equipment.efficiency >= 90 ? 'text-green-600' :
                          equipment.efficiency >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {equipment.efficiency >= 90 ? 'Excellent' :
                           equipment.efficiency >= 75 ? 'Good' : 'Needs Attention'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Equipment Efficiency:</span>
                    <p className="font-semibold text-blue-600">{analyticsData.operational.resourceUtilization.equipmentEfficiency}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tech Adoption:</span>
                    <p className="font-semibold text-purple-600">{analyticsData.operational.resourceUtilization.technologyAdoption}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card className="government-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Operational Performance Summary
              </CardTitle>
              <CardDescription>Overall operational efficiency and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{analyticsData.operational.staffPerformance.avgProductivityScore}%</div>
                  <div className="text-sm text-gray-600">Staff Productivity</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analyticsData.operational.serviceDelivery.serviceEfficiency}%</div>
                  <div className="text-sm text-gray-600">Service Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{analyticsData.operational.workflowEfficiency.workflowOptimization}%</div>
                  <div className="text-sm text-gray-600">Workflow Optimization</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{analyticsData.operational.administrativeMetrics.governanceEfficiency}%</div>
                  <div className="text-sm text-gray-600">Governance Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{analyticsData.operational.resourceUtilization.resourceOptimization}%</div>
                  <div className="text-sm text-gray-600">Resource Optimization</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {Math.round((
                      analyticsData.operational.staffPerformance.avgProductivityScore +
                      analyticsData.operational.serviceDelivery.serviceEfficiency +
                      analyticsData.operational.workflowEfficiency.workflowOptimization +
                      analyticsData.operational.administrativeMetrics.governanceEfficiency +
                      analyticsData.operational.resourceUtilization.resourceOptimization
                    ) / 5)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary-800 mb-3">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              📊 Generate Monthly Report
            </Button>
            <Button variant="outline" className="justify-start">
              📤 Export All Data
            </Button>
            <Button variant="outline" className="justify-start">
              📅 Schedule Reports
            </Button>
            <Button variant="outline" className="justify-start">
              🔔 Set Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
