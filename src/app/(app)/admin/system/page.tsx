'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Clock, 
  Bell, 
  Shield, 
  Save,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface OperatingHour {
  day: string
  open: string
  close: string
  closed: boolean
}

interface TenantSettings {
  id: number
  name: string
  address: string
  phone: string
  description: string
  business_description: string
  business_license: string
  tax_id: string
  license_status: string
  approval_status: string
  is_active: boolean
  operating_hours?: OperatingHour[]
}

export default function SystemSettings() {
  const { user } = useAuth({ middleware: 'auth' })
  const [settings, setSettings] = useState<TenantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([
    { day: 'Monday', open: '09:00', close: '18:00', closed: false },
    { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
    { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
    { day: 'Thursday', open: '09:00', close: '18:00', closed: false },
    { day: 'Friday', open: '09:00', close: '18:00', closed: false },
    { day: 'Saturday', open: '09:00', close: '17:00', closed: false },
    { day: 'Sunday', open: '10:00', close: '16:00', closed: true },
  ])

  // Check if user has system access
  const hasSystemAccess = user?.roles?.some(role => ['Owner', 'Admin', 'IT Support'].includes(role as string))

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/tenant/profile')
      setSettings(response.data.tenant)
      if (response.data.tenant.operating_hours) {
        setOperatingHours(response.data.tenant.operating_hours)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: string, data: any) => {
    try {
      setSaving(true)
      await axios.put('/api/tenant/profile', data)
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      fetchSettings()
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (!hasSystemAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
            <p className="text-red-600">You don't have permission to access system settings.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your salon profile and system configuration
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        {/* License Status Banner */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-lg">License Status</h3>
                  <p className="text-sm text-gray-600">Your salon license information</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-gray-600">License</p>
                  <Badge className={
                    settings?.license_status === 'approved' ? 'bg-green-100 text-green-800' :
                    settings?.license_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {settings?.license_status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {settings?.license_status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {settings?.license_status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {settings?.license_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account</p>
                  <Badge className={settings?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {settings?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Salon Profile</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Business Info</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Operating Hours</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Salon Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Salon Profile</CardTitle>
                <CardDescription>Update your salon's basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Salon Name *</Label>
                  <Input
                    id="name"
                    value={settings?.name || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, name: e.target.value} : null)}
                    placeholder="Enter salon name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={settings?.phone || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, phone: e.target.value} : null)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={settings?.address || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, address: e.target.value} : null)}
                    placeholder="Enter salon address"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settings?.description || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, description: e.target.value} : null)}
                    placeholder="Brief description of your salon"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={() => handleSave('profile', {
                    name: settings?.name,
                    phone: settings?.phone,
                    address: settings?.address,
                    description: settings?.description
                  })}
                  disabled={saving}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Info Tab */}
          <TabsContent value="business">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Manage your business registration details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business_description">Business Description</Label>
                  <Textarea
                    id="business_description"
                    value={settings?.business_description || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, business_description: e.target.value} : null)}
                    placeholder="Describe your business"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
                  <Input
                    id="tax_id"
                    value={settings?.tax_id || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, tax_id: e.target.value} : null)}
                    placeholder="Enter tax ID"
                  />
                </div>

                <div>
                  <Label htmlFor="business_license">Business License Number</Label>
                  <Input
                    id="business_license"
                    value={settings?.business_license || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, business_license: e.target.value} : null)}
                    placeholder="Enter business license number"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Important</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Business information is used for legal compliance and verification purposes. 
                        Ensure all details are accurate and up-to-date.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSave('business', {
                    business_description: settings?.business_description,
                    tax_id: settings?.tax_id,
                    business_license: settings?.business_license
                  })}
                  disabled={saving}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operating Hours Tab */}
          <TabsContent value="hours">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>Set your salon's business hours for each day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {operatingHours.map((hour, index) => (
                    <div key={hour.day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-32 font-medium">{hour.day}</div>
                      <Input 
                        type="time" 
                        className="w-32" 
                        value={hour.open}
                        onChange={(e) => {
                          const newHours = [...operatingHours]
                          newHours[index].open = e.target.value
                          setOperatingHours(newHours)
                        }}
                        disabled={hour.closed}
                      />
                      <span className="text-gray-500">to</span>
                      <Input 
                        type="time" 
                        className="w-32" 
                        value={hour.close}
                        onChange={(e) => {
                          const newHours = [...operatingHours]
                          newHours[index].close = e.target.value
                          setOperatingHours(newHours)
                        }}
                        disabled={hour.closed}
                      />
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={hour.closed}
                          onChange={(e) => {
                            const newHours = [...operatingHours]
                            newHours[index].closed = e.target.checked
                            setOperatingHours(newHours)
                          }}
                        />
                        <span className="text-sm text-gray-600">Closed</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Operating Hours</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Set your salon's business hours. Customers will only be able to book appointments during these times.
                        Mark days as "Closed" when your salon is not operating.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSave('hours', { operating_hours: operatingHours })}
                  disabled={saving}
                  className="mt-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Operating Hours'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure email and notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">New Bookings</div>
                          <div className="text-sm text-gray-600">Receive emails when customers book appointments</div>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Cancellations</div>
                          <div className="text-sm text-gray-600">Get notified when appointments are cancelled</div>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Payment Confirmations</div>
                          <div className="text-sm text-gray-600">Receive payment confirmation emails</div>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Daily Summary</div>
                          <div className="text-sm text-gray-600">Get a daily summary of bookings and revenue</div>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Weekly Reports</div>
                          <div className="text-sm text-gray-600">Receive weekly performance reports</div>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Note</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Notification preferences will be saved to your profile. 
                          You can update these settings at any time.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    disabled
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
