'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Download,
  Clock,
  Star,
  Target,
  Award
} from 'lucide-react'
import axios from '@/lib/axios'

interface FinancialData {
  revenue_by_day: Array<{ date: string; revenue: number }>
  revenue_by_service: Array<{ name: string; revenue: number; bookings: number }>
  revenue_by_staff: Array<{ name: string; revenue: number; appointments: number }>
  current_month_revenue: number
  previous_month_revenue: number
  monthly_growth: number
  total_period_revenue: number
}

interface AppointmentData {
  status_breakdown: Array<{ status: string; count: number }>
  peak_hours: Array<{ hour: number; bookings: number }>
  popular_services: Array<{ name: string; bookings: number; avg_price: number }>
  total_appointments: number
  cancelled_appointments: number
  cancellation_rate: number
  avg_appointment_value: number
}

interface ClientData {
  new_clients_by_month: Array<{ month: string; count: number }>
  retention_rate: number
  repeat_clients: number
  total_clients: number
  top_clients: Array<{ name: string; email: string; total_spent: number; visits: number }>
  age_groups: Array<{ age_group: string; count: number }>
}

interface StaffData {
  staff_performance: Array<{
    id: number
    name: string
    specialization: string
    total_appointments: number
    completed_appointments: number
    revenue_generated: number
    avg_appointment_value: number
    completion_rate: number
  }>
  staff_utilization: Array<{ name: string; appointments_per_day: number }>
  top_performer: any
  total_staff: number
}

export default function Reports() {
  const { user } = useAuth({ middleware: 'auth' })
  const [activeTab, setActiveTab] = useState('financial')
  const [dateRange, setDateRange] = useState('current_month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null)
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [staffData, setStaffData] = useState<StaffData | null>(null)

  const canViewReports = user?.permissions?.includes('view reports') || 
                        user?.permissions?.includes('manage salon') ||
                        user?.roles?.some((role: any) => ['owner', 'manager'].includes(role.name))

  useEffect(() => {
    if (canViewReports) {
      fetchReportData()
    }
  }, [activeTab, dateRange, startDate, endDate, canViewReports])

  const getDateParams = () => {
    const now = new Date()
    switch (dateRange) {
      case 'current_month':
        return {
          start_date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        }
      case 'last_month':
        return {
          start_date: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
          end_date: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
        }
      case 'last_3_months':
        return {
          start_date: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0],
          end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        }
      case 'custom':
        return { start_date: startDate, end_date: endDate }
      default:
        return {}
    }
  }

  const fetchReportData = async () => {
    if (!canViewReports) return
    
    setLoading(true)
    try {
      const params = getDateParams()
      
      switch (activeTab) {
        case 'financial':
          const financialResponse = await axios.get('/api/reports/financial', { params })
          setFinancialData(financialResponse.data)
          break
        case 'appointments':
          const appointmentResponse = await axios.get('/api/reports/appointments', { params })
          setAppointmentData(appointmentResponse.data)
          break
        case 'clients':
          const clientResponse = await axios.get('/api/reports/clients', { params })
          setClientData(clientResponse.data)
          break
        case 'staff':
          const staffResponse = await axios.get('/api/reports/staff', { params })
          setStaffData(staffResponse.data)
          break
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const params = { ...getDateParams(), type: activeTab }
      const response = await axios.get('/api/reports/export', { params })
      
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (!canViewReports) {
    return (
      
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to view reports and analytics.</p>
            </div>
          </CardContent>
        </Card>
      
    )
  }

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
          </div>
          <Button onClick={exportReport} className="bg-gradient-to-r from-pink-600 to-purple-600">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Date Range Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_month">Current Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dateRange === 'custom' && (
                <>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>

          {/* Financial Reports */}
          <TabsContent value="financial" className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading financial data...</div>
            ) : financialData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        R{financialData.total_period_revenue?.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Monthly Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${financialData.monthly_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {financialData.monthly_growth >= 0 ? '+' : ''}{financialData.monthly_growth}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Current Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        R{financialData.current_month_revenue?.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Previous Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-600">
                        R{financialData.previous_month_revenue?.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {financialData.revenue_by_service?.slice(0, 5).map((service, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{service.name}</span>
                            <div className="text-right">
                              <div className="font-bold text-green-600">R{service.revenue?.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">{service.bookings} bookings</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {financialData.revenue_by_staff?.slice(0, 5).map((staff, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{staff.name}</span>
                            <div className="text-right">
                              <div className="font-bold text-blue-600">R{staff.revenue?.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">{staff.appointments} appointments</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-8">No financial data available</div>
            )}
          </TabsContent>

          {/* Appointment Reports */}
          <TabsContent value="appointments" className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading appointment data...</div>
            ) : appointmentData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {appointmentData.total_appointments}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Cancellation Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {appointmentData.cancellation_rate}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Avg. Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        R{appointmentData.avg_appointment_value}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {appointmentData.cancelled_appointments}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {appointmentData.status_breakdown?.map((status, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <Badge variant={status.status === 'completed' ? 'default' : 'secondary'}>
                              {status.status}
                            </Badge>
                            <span className="font-bold">{status.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {appointmentData.popular_services?.slice(0, 5).map((service, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{service.name}</span>
                            <div className="text-right">
                              <div className="font-bold">{service.bookings} bookings</div>
                              <div className="text-sm text-gray-500">Avg: R{service.avg_price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-8">No appointment data available</div>
            )}
          </TabsContent>

          {/* Client Reports */}
          <TabsContent value="clients" className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading client data...</div>
            ) : clientData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {clientData.total_clients}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Retention Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {clientData.retention_rate}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Repeat Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {clientData.repeat_clients}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">New This Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {clientData.new_clients_by_month?.reduce((sum, month) => sum + month.count, 0) || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Spending Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {clientData.top_clients?.slice(0, 5).map((client, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-gray-500">{client.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">R{client.total_spent?.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">{client.visits} visits</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Age Demographics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {clientData.age_groups?.map((group, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{group.age_group}</span>
                            <span className="font-bold">{group.count} clients</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-8">No client data available</div>
            )}
          </TabsContent>

          {/* Staff Reports */}
          <TabsContent value="staff" className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading staff data...</div>
            ) : staffData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {staffData.total_staff}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Top Performer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-purple-600">
                        {staffData.top_performer?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        R{staffData.top_performer?.revenue_generated?.toLocaleString() || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Avg Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {staffData.staff_performance?.length > 0 
                          ? Math.round(staffData.staff_performance.reduce((sum, staff) => sum + staff.completion_rate, 0) / staffData.staff_performance.length)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        R{staffData.staff_performance?.reduce((sum, staff) => sum + staff.revenue_generated, 0)?.toLocaleString() || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {staffData.staff_performance?.map((staff, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{staff.name}</h4>
                              <p className="text-sm text-gray-500">{staff.specialization}</p>
                            </div>
                            <Badge variant={staff.completion_rate >= 90 ? 'default' : 'secondary'}>
                              {staff.completion_rate.toFixed(1)}% completion
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Revenue:</span>
                              <div className="font-bold text-green-600">R{staff.revenue_generated?.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Appointments:</span>
                              <div className="font-bold">{staff.total_appointments}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Completed:</span>
                              <div className="font-bold">{staff.completed_appointments}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Avg Value:</span>
                              <div className="font-bold">R{staff.avg_appointment_value?.toFixed(0)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8">No staff data available</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    
  )
}
