'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface IncidentReport {
  id: string
  blotter_number: string
  incident_type: string
  complainant_id?: string
  respondent_name: string
  respondent_address?: string
  incident_date: string
  incident_location?: string
  description: string
  status: 'Open' | 'Under Investigation' | 'Mediation' | 'Resolved' | 'Referred' | 'Closed'
  investigating_officer?: string
  resolution?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

const statusColors = {
  'Open': 'bg-red-100 text-red-800',
  'Under Investigation': 'bg-yellow-100 text-yellow-800',
  'Mediation': 'bg-blue-100 text-blue-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Referred': 'bg-purple-100 text-purple-800',
  'Closed': 'bg-gray-100 text-gray-800'
}

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentReport[]>([])
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isUpdating, setIsUpdating] = useState(false)

  // Mock data for development
  useEffect(() => {
    const mockIncidents: IncidentReport[] = [
      {
        id: 'inc-001',
        blotter_number: 'BLT-2025-001',
        incident_type: 'Noise Complaint',
        complainant_id: 'user-001',
        respondent_name: 'Juan Dela Cruz',
        respondent_address: 'Block 2, Lot 5, Dampol 2nd A',
        incident_date: '2025-01-15T20:30:00Z',
        incident_location: 'Block 2, Dampol 2nd A',
        description: 'Loud music and karaoke until late hours disturbing neighbors. Multiple complaints received.',
        status: 'Open',
        created_at: '2025-01-16T08:00:00Z',
        updated_at: '2025-01-16T08:00:00Z'
      },
      {
        id: 'inc-002',
        blotter_number: 'BLT-2025-002',
        incident_type: 'Property Damage',
        complainant_id: 'user-002',
        respondent_name: 'Maria Santos',
        respondent_address: 'Block 1, Lot 12, Dampol 2nd A',
        incident_date: '2025-01-14T14:00:00Z',
        incident_location: 'Dampol Road',
        description: 'Damaged fence and gate due to vehicle accident. Driver fled the scene.',
        status: 'Under Investigation',
        investigating_officer: 'officer-001',
        created_at: '2025-01-14T16:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 'inc-003',
        blotter_number: 'BLT-2025-003',
        incident_type: 'Public Disturbance',
        respondent_name: 'Pedro Garcia',
        respondent_address: 'Block 3, Lot 8, Dampol 2nd A',
        incident_date: '2025-01-12T18:00:00Z',
        incident_location: 'Barangay Basketball Court',
        description: 'Verbal altercation during basketball game escalated to physical confrontation.',
        status: 'Mediation',
        investigating_officer: 'officer-002',
        created_at: '2025-01-12T19:00:00Z',
        updated_at: '2025-01-13T14:00:00Z'
      },
      {
        id: 'inc-004',
        blotter_number: 'BLT-2025-004',
        incident_type: 'Theft',
        complainant_id: 'user-003',
        respondent_name: 'Unknown suspect',
        incident_date: '2025-01-10T02:00:00Z',
        incident_location: 'Block 1, Lot 3, Dampol 2nd A',
        description: 'Bicycle stolen from front yard. No witnesses. Security camera footage being reviewed.',
        status: 'Resolved',
        investigating_officer: 'officer-001',
        resolution: 'Bicycle recovered and returned to owner. Suspect identified and warned.',
        resolved_at: '2025-01-14T16:00:00Z',
        created_at: '2025-01-10T08:00:00Z',
        updated_at: '2025-01-14T16:00:00Z'
      }
    ]

    setTimeout(() => {
      setIncidents(mockIncidents)
      setFilteredIncidents(mockIncidents)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter incidents based on search and filters
  useEffect(() => {
    let filtered = incidents

    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.blotter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.respondent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incident_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(incident => incident.incident_type === typeFilter)
    }

    setFilteredIncidents(filtered)
  }, [incidents, searchTerm, statusFilter, typeFilter])

  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    setIsUpdating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: newStatus as any, updated_at: new Date().toISOString() }
        : incident
    ))
    setIsUpdating(false)
  }

  const getIncidentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Theft': '🔓',
      'Assault': '👊',
      'Domestic Violence': '🏠',
      'Noise Complaint': '🔊',
      'Property Damage': '🏗️',
      'Public Disturbance': '⚠️',
      'Traffic Violation': '🚗',
      'Drug-related': '💊',
      'Other': '📋'
    }
    return icons[type] || '📋'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incident reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-600 mt-1">Manage incident reports and blotter entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            📊 Generate Report
          </Button>
          <Button>
            📝 New Incident
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'Open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🔍</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Investigation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'Under Investigation').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'Resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="government-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by blotter number, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                  <SelectItem value="Mediation">Mediation</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Referred">Referred</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Incident Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Assault">Assault</SelectItem>
                  <SelectItem value="Domestic Violence">Domestic Violence</SelectItem>
                  <SelectItem value="Noise Complaint">Noise Complaint</SelectItem>
                  <SelectItem value="Property Damage">Property Damage</SelectItem>
                  <SelectItem value="Public Disturbance">Public Disturbance</SelectItem>
                  <SelectItem value="Traffic Violation">Traffic Violation</SelectItem>
                  <SelectItem value="Drug-related">Drug-related</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
          <CardDescription>
            {filteredIncidents.length} of {incidents.length} incident reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No incident reports have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Blotter #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Respondent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{incident.blotter_number}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(incident.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getIncidentTypeIcon(incident.incident_type)}</span>
                          <span className="text-sm">{incident.incident_type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{incident.respondent_name}</p>
                          {incident.incident_location && (
                            <p className="text-sm text-gray-600">{incident.incident_location}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">
                          {new Date(incident.incident_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(incident.incident_date).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[incident.status]}>
                          {incident.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            View
                          </Button>
                          <Select
                            value={incident.status}
                            onValueChange={(value) => handleStatusUpdate(incident.id, value)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                              <SelectItem value="Mediation">Mediation</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                              <SelectItem value="Referred">Referred</SelectItem>
                              <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Incident Report Details</CardTitle>
                  <CardDescription>Blotter Number: {selectedIncident.blotter_number}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIncident(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Incident Type</Label>
                    <p className="flex items-center">
                      <span className="text-lg mr-2">{getIncidentTypeIcon(selectedIncident.incident_type)}</span>
                      {selectedIncident.incident_type}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                    <p>{new Date(selectedIncident.incident_date).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Location</Label>
                    <p>{selectedIncident.incident_location || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={statusColors[selectedIncident.status]}>
                      {selectedIncident.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Respondent Name</Label>
                    <p>{selectedIncident.respondent_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Respondent Address</Label>
                    <p>{selectedIncident.respondent_address || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Investigating Officer</Label>
                    <p>{selectedIncident.investigating_officer || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Reported On</Label>
                    <p>{new Date(selectedIncident.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedIncident.description}</p>
                </div>
              </div>

              {selectedIncident.resolution && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Resolution</Label>
                  <div className="mt-1 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm">{selectedIncident.resolution}</p>
                    {selectedIncident.resolved_at && (
                      <p className="text-xs text-gray-600 mt-2">
                        Resolved on: {new Date(selectedIncident.resolved_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button className="flex-1">Edit Details</Button>
                <Button variant="outline" className="flex-1">Assign Officer</Button>
                <Button variant="outline" className="flex-1">Print Report</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
