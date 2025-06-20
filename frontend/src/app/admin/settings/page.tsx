'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    barangayName: 'Dampol 2nd A',
    municipality: 'Pulilan',
    province: 'Bulacan',
    region: 'Region III (Central Luzon)',
    contactNumber: '+63 44 123 4567',
    emailAddress: 'dampol2nda@pulilan.gov.ph',
    address: 'Dampol 2nd A, Pulilan, Bulacan',
    
    // System Settings
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 30,
    maxFileUploadSize: 10,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    announcementNotifications: true,
    documentStatusNotifications: true,
    
    // Security Settings
    passwordMinLength: 8,
    requireSpecialCharacters: true,
    enableTwoFactor: false,
    loginAttemptLimit: 5,
    accountLockoutDuration: 15,
    
    // Business Hours
    mondayStart: '08:00',
    mondayEnd: '17:00',
    tuesdayStart: '08:00',
    tuesdayEnd: '17:00',
    wednesdayStart: '08:00',
    wednesdayEnd: '17:00',
    thursdayStart: '08:00',
    thursdayEnd: '17:00',
    fridayStart: '08:00',
    fridayEnd: '17:00',
    saturdayStart: '08:00',
    saturdayEnd: '12:00',
    sundayStart: '',
    sundayEnd: '',
    
    // Document Processing
    defaultProcessingDays: 3,
    urgentProcessingDays: 1,
    documentFees: {
      barangayClearance: 50,
      certificateOfResidency: 30,
      indigencyCertificate: 25,
      businessPermit: 100,
      buildingPermit: 500
    }
  })

  const [activeTab, setActiveTab] = useState('general')

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings)
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    // TODO: Implement reset to defaults
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      console.log('Resetting settings to defaults')
      alert('Settings reset to defaults!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure barangay system preferences and parameters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            🔄 Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            💾 Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {[
          { id: 'general', label: '🏛️ General', desc: 'Basic information' },
          { id: 'system', label: '⚙️ System', desc: 'System configuration' },
          { id: 'notifications', label: '🔔 Notifications', desc: 'Alert settings' },
          { id: 'security', label: '🔒 Security', desc: 'Security policies' },
          { id: 'business', label: '🕒 Business Hours', desc: 'Operating hours' },
          { id: 'documents', label: '📄 Documents', desc: 'Document settings' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Barangay Information</CardTitle>
              <CardDescription>Basic barangay details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="barangayName">Barangay Name</Label>
                  <Input
                    id="barangayName"
                    value={settings.barangayName}
                    onChange={(e) => setSettings({...settings, barangayName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="municipality">Municipality</Label>
                  <Input
                    id="municipality"
                    value={settings.municipality}
                    onChange={(e) => setSettings({...settings, municipality: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={settings.province}
                    onChange={(e) => setSettings({...settings, province: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={settings.region}
                    onChange={(e) => setSettings({...settings, region: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Complete Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={settings.contactNumber}
                    onChange={(e) => setSettings({...settings, contactNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={settings.emailAddress}
                    onChange={(e) => setSettings({...settings, emailAddress: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system information and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">System Version:</span>
                  <div className="font-medium">v1.0.0</div>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <div className="font-medium">June 20, 2025</div>
                </div>
                <div>
                  <span className="text-gray-600">Database Status:</span>
                  <div className="font-medium text-green-600">✅ Connected</div>
                </div>
                <div>
                  <span className="text-gray-600">Server Status:</span>
                  <div className="font-medium text-green-600">✅ Online</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Users:</span>
                  <div className="font-medium">1,234</div>
                </div>
                <div>
                  <span className="text-gray-600">Active Sessions:</span>
                  <div className="font-medium">45</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Core system settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Temporarily disable public access</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistration">Allow Registration</Label>
                    <p className="text-sm text-gray-600">Enable new user registrations</p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireEmailVerification">Email Verification</Label>
                    <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
                  <Input
                    id="maxFileUploadSize"
                    type="number"
                    value={settings.maxFileUploadSize}
                    onChange={(e) => setSettings({...settings, maxFileUploadSize: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure notification preferences and delivery methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Notification Types</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Send browser push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Notification Events</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="announcementNotifications">Announcements</Label>
                    <p className="text-sm text-gray-600">Notify about new announcements</p>
                  </div>
                  <Switch
                    id="announcementNotifications"
                    checked={settings.announcementNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, announcementNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="documentStatusNotifications">Document Status</Label>
                    <p className="text-sm text-gray-600">Notify about document status changes</p>
                  </div>
                  <Switch
                    id="documentStatusNotifications"
                    checked={settings.documentStatusNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, documentStatusNotifications: checked})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security policies and authentication requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Password Policy</h4>
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="20"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireSpecialCharacters">Require Special Characters</Label>
                    <p className="text-sm text-gray-600">Passwords must contain special characters</p>
                  </div>
                  <Switch
                    id="requireSpecialCharacters"
                    checked={settings.requireSpecialCharacters}
                    onCheckedChange={(checked) => setSettings({...settings, requireSpecialCharacters: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Enable 2FA for admin accounts</p>
                  </div>
                  <Switch
                    id="enableTwoFactor"
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings({...settings, enableTwoFactor: checked})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Account Security</h4>
                <div>
                  <Label htmlFor="loginAttemptLimit">Login Attempt Limit</Label>
                  <Input
                    id="loginAttemptLimit"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.loginAttemptLimit}
                    onChange={(e) => setSettings({...settings, loginAttemptLimit: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="accountLockoutDuration">Account Lockout Duration (minutes)</Label>
                  <Input
                    id="accountLockoutDuration"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.accountLockoutDuration}
                    onChange={(e) => setSettings({...settings, accountLockoutDuration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Hours Settings */}
      {activeTab === 'business' && (
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>Configure barangay office operating hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { day: 'Monday', startKey: 'mondayStart', endKey: 'mondayEnd' },
              { day: 'Tuesday', startKey: 'tuesdayStart', endKey: 'tuesdayEnd' },
              { day: 'Wednesday', startKey: 'wednesdayStart', endKey: 'wednesdayEnd' },
              { day: 'Thursday', startKey: 'thursdayStart', endKey: 'thursdayEnd' },
              { day: 'Friday', startKey: 'fridayStart', endKey: 'fridayEnd' },
              { day: 'Saturday', startKey: 'saturdayStart', endKey: 'saturdayEnd' },
              { day: 'Sunday', startKey: 'sundayStart', endKey: 'sundayEnd' }
            ].map((dayConfig) => (
              <div key={dayConfig.day} className="flex items-center gap-4">
                <div className="w-24 font-medium">{dayConfig.day}</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={settings[dayConfig.startKey as keyof typeof settings] as string}
                    onChange={(e) => setSettings({...settings, [dayConfig.startKey]: e.target.value})}
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={settings[dayConfig.endKey as keyof typeof settings] as string}
                    onChange={(e) => setSettings({...settings, [dayConfig.endKey]: e.target.value})}
                    className="w-32"
                  />
                  {!settings[dayConfig.startKey as keyof typeof settings] && (
                    <span className="text-sm text-gray-500">Closed</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document Settings */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Processing</CardTitle>
              <CardDescription>Configure document processing times and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultProcessingDays">Default Processing Days</Label>
                  <Input
                    id="defaultProcessingDays"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.defaultProcessingDays}
                    onChange={(e) => setSettings({...settings, defaultProcessingDays: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="urgentProcessingDays">Urgent Processing Days</Label>
                  <Input
                    id="urgentProcessingDays"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.urgentProcessingDays}
                    onChange={(e) => setSettings({...settings, urgentProcessingDays: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Fees</CardTitle>
              <CardDescription>Set fees for different document types (in PHP)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="barangayClearance">Barangay Clearance</Label>
                  <Input
                    id="barangayClearance"
                    type="number"
                    min="0"
                    value={settings.documentFees.barangayClearance}
                    onChange={(e) => setSettings({
                      ...settings,
                      documentFees: {
                        ...settings.documentFees,
                        barangayClearance: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="certificateOfResidency">Certificate of Residency</Label>
                  <Input
                    id="certificateOfResidency"
                    type="number"
                    min="0"
                    value={settings.documentFees.certificateOfResidency}
                    onChange={(e) => setSettings({
                      ...settings,
                      documentFees: {
                        ...settings.documentFees,
                        certificateOfResidency: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="indigencyCertificate">Indigency Certificate</Label>
                  <Input
                    id="indigencyCertificate"
                    type="number"
                    min="0"
                    value={settings.documentFees.indigencyCertificate}
                    onChange={(e) => setSettings({
                      ...settings,
                      documentFees: {
                        ...settings.documentFees,
                        indigencyCertificate: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="businessPermit">Business Permit</Label>
                  <Input
                    id="businessPermit"
                    type="number"
                    min="0"
                    value={settings.documentFees.businessPermit}
                    onChange={(e) => setSettings({
                      ...settings,
                      documentFees: {
                        ...settings.documentFees,
                        businessPermit: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="buildingPermit">Building Permit</Label>
                  <Input
                    id="buildingPermit"
                    type="number"
                    min="0"
                    value={settings.documentFees.buildingPermit}
                    onChange={(e) => setSettings({
                      ...settings,
                      documentFees: {
                        ...settings.documentFees,
                        buildingPermit: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
