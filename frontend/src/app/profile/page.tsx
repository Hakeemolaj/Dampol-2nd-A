'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface ResidentProfile {
  id: string
  resident_id: string
  user_id: string
  first_name: string
  last_name: string
  middle_name?: string
  date_of_birth: string
  gender: string
  civil_status: string
  address: string
  contact_number: string
  email?: string
  occupation?: string
  monthly_income?: number
  household_id?: string
  relationship_to_head?: string
  is_registered_voter: boolean
  voter_id?: string
  is_pwd: boolean
  pwd_id?: string
  is_senior_citizen: boolean
  is_4ps_beneficiary: boolean
  emergency_contact_name?: string
  emergency_contact_phone?: string
  status: string
  birth_place?: string
  nationality: string
  religion?: string
  ethnicity?: string
  mother_maiden_name?: string
  height_cm?: number
  weight_kg?: number
  distinguishing_marks?: string
}

interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  address?: string
  is_primary: boolean
}

interface FamilyMember {
  id: string
  name: string
  relationship: string
  age: number
  occupation?: string
  contact_number?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ResidentProfile | null>(null)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // Mock data for development
  useEffect(() => {
    const mockProfile: ResidentProfile = {
      id: 'res-001',
      resident_id: 'RES-2025-001',
      user_id: 'user-001',
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      middle_name: 'Santos',
      date_of_birth: '1985-03-15',
      gender: 'Male',
      civil_status: 'Married',
      address: 'Block 1, Lot 15, Dampol 2nd A',
      contact_number: '09171234567',
      email: 'juan.delacruz@email.com',
      occupation: 'Construction Worker',
      monthly_income: 18000,
      household_id: 'hh-001',
      relationship_to_head: 'Head',
      is_registered_voter: true,
      voter_id: 'V-2020-001234',
      is_pwd: false,
      is_senior_citizen: false,
      is_4ps_beneficiary: false,
      emergency_contact_name: 'Maria Dela Cruz',
      emergency_contact_phone: '09181234567',
      status: 'Active',
      birth_place: 'Pulilan, Bulacan',
      nationality: 'Filipino',
      religion: 'Roman Catholic',
      ethnicity: 'Filipino',
      mother_maiden_name: 'Santos',
      height_cm: 170,
      weight_kg: 65.5,
      distinguishing_marks: 'Scar on left arm'
    }

    const mockEmergencyContacts: EmergencyContact[] = [
      {
        id: 'ec-001',
        name: 'Maria Dela Cruz',
        relationship: 'Spouse',
        phone: '09181234567',
        address: 'Block 1, Lot 15, Dampol 2nd A',
        is_primary: true
      },
      {
        id: 'ec-002',
        name: 'Pedro Santos',
        relationship: 'Father',
        phone: '09191234567',
        address: 'Block 2, Lot 8, Dampol 2nd A',
        is_primary: false
      }
    ]

    const mockFamilyMembers: FamilyMember[] = [
      {
        id: 'fm-001',
        name: 'Maria Dela Cruz',
        relationship: 'Spouse',
        age: 32,
        occupation: 'Teacher',
        contact_number: '09181234567'
      },
      {
        id: 'fm-002',
        name: 'Jose Dela Cruz',
        relationship: 'Son',
        age: 12,
        occupation: 'Student'
      },
      {
        id: 'fm-003',
        name: 'Ana Dela Cruz',
        relationship: 'Daughter',
        age: 8,
        occupation: 'Student'
      }
    ]

    setTimeout(() => {
      setProfile(mockProfile)
      setEmergencyContacts(mockEmergencyContacts)
      setFamilyMembers(mockFamilyMembers)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaving(false)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
        <p className="text-gray-600 mb-4">
          Your resident profile could not be loaded.
        </p>
        <Button>Contact Support</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and family details
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card className="government-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">
                {profile.first_name[0]}{profile.last_name[0]}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.first_name} {profile.middle_name} {profile.last_name}
              </h2>
              <p className="text-gray-600">Resident ID: {profile.resident_id}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={profile.status === 'Active' ? 'default' : 'secondary'}>
                  {profile.status}
                </Badge>
                {profile.is_registered_voter && <Badge variant="outline">Registered Voter</Badge>}
                {profile.is_senior_citizen && <Badge variant="outline">Senior Citizen</Badge>}
                {profile.is_pwd && <Badge variant="outline">PWD</Badge>}
                {profile.is_4ps_beneficiary && <Badge variant="outline">4Ps Beneficiary</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="government">Government IDs</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="government-card">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your basic personal and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={profile.middle_name || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, middle_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile.date_of_birth}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender}
                    disabled={!isEditing}
                    onValueChange={(value) => setProfile({...profile, gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="civil_status">Civil Status</Label>
                  <Select
                    value={profile.civil_status}
                    disabled={!isEditing}
                    onValueChange={(value) => setProfile({...profile, civil_status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="birth_place">Place of Birth</Label>
                  <Input
                    id="birth_place"
                    value={profile.birth_place || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, birth_place: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Complete Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={profile.contact_number}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, contact_number: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_income">Monthly Income</Label>
                  <Input
                    id="monthly_income"
                    type="number"
                    value={profile.monthly_income || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, monthly_income: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Information Tab */}
        <TabsContent value="family" className="space-y-6">
          <Card className="government-card">
            <CardHeader>
              <CardTitle>Household Information</CardTitle>
              <CardDescription>
                Information about your household and family members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="household_id">Household ID</Label>
                  <Input
                    id="household_id"
                    value={profile.household_id || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, household_id: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="relationship_to_head">Relationship to Household Head</Label>
                  <Select
                    value={profile.relationship_to_head || ''}
                    disabled={!isEditing}
                    onValueChange={(value) => setProfile({...profile, relationship_to_head: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Head">Head</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Grandparent">Grandparent</SelectItem>
                      <SelectItem value="Grandchild">Grandchild</SelectItem>
                      <SelectItem value="Other Relative">Other Relative</SelectItem>
                      <SelectItem value="Non-Relative">Non-Relative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="mother_maiden_name">Mother's Maiden Name</Label>
                <Input
                  id="mother_maiden_name"
                  value={profile.mother_maiden_name || ''}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, mother_maiden_name: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="government-card">
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>
                Other family members in your household
              </CardDescription>
            </CardHeader>
            <CardContent>
              {familyMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                  <p className="text-gray-600">No family members added yet</p>
                  {isEditing && (
                    <Button className="mt-4" variant="outline">
                      Add Family Member
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">
                          {member.relationship} • {member.age} years old
                        </p>
                        {member.occupation && (
                          <p className="text-sm text-gray-500">{member.occupation}</p>
                        )}
                        {member.contact_number && (
                          <p className="text-sm text-gray-500">{member.contact_number}</p>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Remove</Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="outline" className="w-full">
                      + Add Family Member
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contacts Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <Card className="government-card">
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                People to contact in case of emergency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emergencyContacts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🚨</div>
                  <p className="text-gray-600">No emergency contacts added yet</p>
                  {isEditing && (
                    <Button className="mt-4" variant="outline">
                      Add Emergency Contact
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{contact.name}</h4>
                          {contact.is_primary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {contact.relationship} • {contact.phone}
                        </p>
                        {contact.address && (
                          <p className="text-sm text-gray-500">{contact.address}</p>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Remove</Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="outline" className="w-full">
                      + Add Emergency Contact
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Government IDs Tab */}
        <TabsContent value="government" className="space-y-6">
          <Card className="government-card">
            <CardHeader>
              <CardTitle>Government IDs & Status</CardTitle>
              <CardDescription>
                Your government identification and program participation status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Voter Registration</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_registered_voter"
                      checked={profile.is_registered_voter}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({...profile, is_registered_voter: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_registered_voter">Registered Voter</Label>
                  </div>
                  {profile.is_registered_voter && (
                    <div>
                      <Label htmlFor="voter_id">Voter ID Number</Label>
                      <Input
                        id="voter_id"
                        value={profile.voter_id || ''}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({...profile, voter_id: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">PWD Status</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_pwd"
                      checked={profile.is_pwd}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({...profile, is_pwd: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_pwd">Person with Disability</Label>
                  </div>
                  {profile.is_pwd && (
                    <div>
                      <Label htmlFor="pwd_id">PWD ID Number</Label>
                      <Input
                        id="pwd_id"
                        value={profile.pwd_id || ''}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({...profile, pwd_id: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Senior Citizen</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_senior_citizen"
                      checked={profile.is_senior_citizen}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({...profile, is_senior_citizen: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_senior_citizen">Senior Citizen (60+ years old)</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">4Ps Program</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_4ps_beneficiary"
                      checked={profile.is_4ps_beneficiary}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({...profile, is_4ps_beneficiary: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_4ps_beneficiary">4Ps Beneficiary</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={profile.nationality}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, nationality: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={profile.religion || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, religion: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ethnicity">Ethnicity</Label>
                  <Input
                    id="ethnicity"
                    value={profile.ethnicity || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, ethnicity: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input
                    id="height_cm"
                    type="number"
                    value={profile.height_cm || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, height_cm: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="weight_kg">Weight (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.1"
                    value={profile.weight_kg || ''}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, weight_kg: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="distinguishing_marks">Distinguishing Marks</Label>
                <Textarea
                  id="distinguishing_marks"
                  value={profile.distinguishing_marks || ''}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, distinguishing_marks: e.target.value})}
                  rows={2}
                  placeholder="Scars, tattoos, birthmarks, etc."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
