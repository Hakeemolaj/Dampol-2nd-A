'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Mock resident data
const mockResidents = [
  {
    id: 'RES-001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    middleName: 'Santos',
    dateOfBirth: '1985-03-15',
    age: 39,
    gender: 'Male',
    civilStatus: 'Married',
    address: 'Block 1, Lot 15, Dampol 2nd A',
    contactNumber: '09171234567',
    email: 'juan.delacruz@email.com',
    occupation: 'Construction Worker',
    monthlyIncome: '₱18,000',
    householdHead: true,
    householdSize: 4,
    voterStatus: 'Registered',
    pwdStatus: false,
    seniorCitizen: false,
    indigent: false,
    registrationDate: '2020-01-15',
    status: 'Active'
  },
  {
    id: 'RES-002',
    firstName: 'Maria',
    lastName: 'Santos',
    middleName: 'Garcia',
    dateOfBirth: '1990-07-22',
    age: 34,
    gender: 'Female',
    civilStatus: 'Single',
    address: 'Block 2, Lot 8, Dampol 2nd A',
    contactNumber: '09189876543',
    email: 'maria.santos@email.com',
    occupation: 'Teacher',
    monthlyIncome: '₱25,000',
    householdHead: true,
    householdSize: 2,
    voterStatus: 'Registered',
    pwdStatus: false,
    seniorCitizen: false,
    indigent: false,
    registrationDate: '2019-05-10',
    status: 'Active'
  },
  {
    id: 'RES-003',
    firstName: 'Pedro',
    lastName: 'Garcia',
    middleName: 'Reyes',
    dateOfBirth: '1955-12-03',
    age: 69,
    gender: 'Male',
    civilStatus: 'Widowed',
    address: 'Block 3, Lot 22, Dampol 2nd A',
    contactNumber: '09156789012',
    email: '',
    occupation: 'Retired',
    monthlyIncome: '₱8,000',
    householdHead: true,
    householdSize: 1,
    voterStatus: 'Registered',
    pwdStatus: false,
    seniorCitizen: true,
    indigent: true,
    registrationDate: '2018-03-20',
    status: 'Active'
  },
  {
    id: 'RES-004',
    firstName: 'Ana',
    lastName: 'Reyes',
    middleName: 'Cruz',
    dateOfBirth: '1992-09-18',
    age: 32,
    gender: 'Female',
    civilStatus: 'Married',
    address: 'Block 1, Lot 30, Dampol 2nd A',
    contactNumber: '09123456789',
    email: 'ana.reyes@email.com',
    occupation: 'Housewife',
    monthlyIncome: '₱0',
    householdHead: false,
    householdSize: 5,
    voterStatus: 'Registered',
    pwdStatus: true,
    seniorCitizen: false,
    indigent: true,
    registrationDate: '2021-08-12',
    status: 'Active'
  }
]

export default function ResidentsManagement() {
  const [residents, setResidents] = useState(mockResidents)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedResident, setSelectedResident] = useState<any>(null)

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || resident.status.toLowerCase() === filterStatus
    
    let matchesCategory = true
    if (filterCategory === 'senior') matchesCategory = resident.seniorCitizen
    else if (filterCategory === 'pwd') matchesCategory = resident.pwdStatus
    else if (filterCategory === 'indigent') matchesCategory = resident.indigent
    else if (filterCategory === 'household-head') matchesCategory = resident.householdHead
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStats = () => {
    return {
      total: residents.length,
      active: residents.filter(r => r.status === 'Active').length,
      seniors: residents.filter(r => r.seniorCitizen).length,
      pwd: residents.filter(r => r.pwdStatus).length,
      indigent: residents.filter(r => r.indigent).length,
      voters: residents.filter(r => r.voterStatus === 'Registered').length,
      households: residents.filter(r => r.householdHead).length,
      totalPopulation: residents.reduce((sum, r) => sum + r.householdSize, 0)
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resident Management</h1>
          <p className="text-gray-600 mt-1">Manage resident database and demographics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            📊 Export Data
          </Button>
          <Button>
            👤 Add Resident
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Residents</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.households}</div>
              <div className="text-xs text-gray-600">Households</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalPopulation}</div>
              <div className="text-xs text-gray-600">Population</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.seniors}</div>
              <div className="text-xs text-gray-600">Senior Citizens</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.pwd}</div>
              <div className="text-xs text-gray-600">PWD</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.indigent}</div>
              <div className="text-xs text-gray-600">Indigent</div>
            </div>
          </CardContent>
        </Card>

        <Card className="government-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.voters}</div>
              <div className="text-xs text-gray-600">Voters</div>
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
                placeholder="Search by name, ID, or address..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="moved">Moved Out</option>
              </select>
            </div>
            <div className="lg:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="senior">Senior Citizens</option>
                <option value="pwd">PWD</option>
                <option value="indigent">Indigent</option>
                <option value="household-head">Household Heads</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Residents Table */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Resident Database</CardTitle>
          <CardDescription>
            Complete list of registered residents in Barangay Dampol 2nd A
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResidents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No residents found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Resident ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Age/Gender</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Address</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Categories</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResidents.map((resident) => (
                    <tr key={resident.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-medium">{resident.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {resident.firstName} {resident.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{resident.occupation}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm">{resident.age} years old</p>
                          <p className="text-sm text-gray-600">{resident.gender}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{resident.address}</p>
                        <p className="text-xs text-gray-600">
                          {resident.householdHead ? 'Household Head' : 'Member'} 
                          ({resident.householdSize} members)
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm">{resident.contactNumber}</p>
                          {resident.email && (
                            <p className="text-xs text-gray-600">{resident.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {resident.seniorCitizen && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Senior
                            </span>
                          )}
                          {resident.pwdStatus && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              PWD
                            </span>
                          )}
                          {resident.indigent && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Indigent
                            </span>
                          )}
                          {resident.voterStatus === 'Registered' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Voter
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          resident.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {resident.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedResident(resident)}
                          >
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
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

      {/* Quick Actions */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary-800 mb-3">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              📊 Generate Census Report
            </Button>
            <Button variant="outline" className="justify-start">
              👥 Household Survey
            </Button>
            <Button variant="outline" className="justify-start">
              📋 Voter Registration
            </Button>
            <Button variant="outline" className="justify-start">
              📧 Send Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resident Detail Modal (simplified) */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Resident Details</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedResident(null)}
                className="absolute top-4 right-4"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="font-medium">
                    {selectedResident.firstName} {selectedResident.middleName} {selectedResident.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p>{new Date(selectedResident.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Civil Status</label>
                  <p>{selectedResident.civilStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Occupation</label>
                  <p>{selectedResident.occupation}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Monthly Income</label>
                  <p>{selectedResident.monthlyIncome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Household Size</label>
                  <p>{selectedResident.householdSize} members</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Complete Address</label>
                <p>{selectedResident.address}, Dampol 2nd A, Pulilan, Bulacan</p>
              </div>
              <div className="flex gap-4 pt-4">
                <Button className="flex-1">Edit Information</Button>
                <Button variant="outline" className="flex-1">Print Profile</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
