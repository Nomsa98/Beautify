'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    Calendar, 
    Clock, 
    User, 
    Phone, 
    DollarSign, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Search,
    Filter,
    UserCheck,
    MessageSquare,
    MoreVertical
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { format } from 'date-fns'
import RoleBasedRoute from '@/components/RoleBasedRoute'

interface Appointment {
    id: number
    booking_reference?: string
    user: {
        id: number
        name: string
        email: string
        phone?: string
    }
    service: {
        id: number
        name: string
        price: number
        duration_minutes: number
    } | null
    service_name: string
    staff: {
        id: number
        name: string
    } | null
    appointment_date: string
    appointment_time: string
    duration_minutes: number
    price: number
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
    phone?: string
    notes?: string
    is_guest_booking: boolean
    confirmed_at?: string
    cancelled_at?: string
    cancellation_reason?: string
}

interface AppointmentStats {
    today_appointments: number
    pending_appointments: number
    confirmed_appointments: number
    completed_appointments: number
    cancelled_appointments: number
    this_week_revenue: number
    upcoming_appointments: number
}

interface Staff {
    id: number
    name: string
    email: string
}

function StaffAppointmentsPageContent() {
    const { user } = useAuth({ middleware: 'auth' })
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [stats, setStats] = useState<AppointmentStats | null>(null)
    const [availableStaff, setAvailableStaff] = useState<Staff[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAppointments()
        fetchStats()
        fetchAvailableStaff()
        fetchClients()
    }, [statusFilter, dateFilter])

    const fetchAppointments = async () => {
        try {
            const params: any = {}
            if (statusFilter !== 'all') params.status = statusFilter
            if (dateFilter === 'today') {
                params.date_from = format(new Date(), 'yyyy-MM-dd')
                params.date_to = format(new Date(), 'yyyy-MM-dd')
            } else if (dateFilter === 'week') {
                const today = new Date()
                const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
                const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
                params.date_from = format(weekStart, 'yyyy-MM-dd')
                params.date_to = format(weekEnd, 'yyyy-MM-dd')
            }

            const response = await axios.get('/api/appointments', { params })
            setAppointments(response.data.data.data || [])
        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/appointments/statistics')
            setStats(response.data.data)
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const fetchAvailableStaff = async () => {
        try {
            const response = await axios.get('/api/appointments/available-staff')
            setAvailableStaff(response.data.data || [])
        } catch (error) {
            console.error('Error fetching available staff:', error)
        }
    }

    const fetchClients = async () => {
        try {
            const response = await axios.get('/api/reports/clients')
            setClients(response.data.top_clients || [])
        } catch (error) {
            console.error('Error fetching clients:', error)
        }
    }

    const updateAppointmentStatus = async (appointmentId: number, status: string, notes?: string, cancellationReason?: string) => {
        try {
            const data: any = { status }
            if (notes) data.notes = notes
            if (cancellationReason) data.cancellation_reason = cancellationReason

            const response = await axios.patch(`/api/appointments/${appointmentId}/status`, data)
            
            // Update local state
            setAppointments(prev => prev.map(apt => 
                apt.id === appointmentId ? { ...apt, ...response.data.data } : apt
            ))
            
            // Refresh stats
            fetchStats()
        } catch (error) {
            console.error('Error updating appointment status:', error)
        }
    }

    const assignStaff = async (appointmentId: number, staffId: number) => {
        try {
            const response = await axios.patch(`/api/appointments/${appointmentId}/assign-staff`, {
                staff_id: staffId
            })
            
            // Update local state
            setAppointments(prev => prev.map(apt => 
                apt.id === appointmentId ? { ...apt, ...response.data.data } : apt
            ))
        } catch (error) {
            console.error('Error assigning staff:', error)
        }
    }

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = 
            appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase())
        
        return matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
            case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="h-4 w-4" />
            case 'pending': return <AlertCircle className="h-4 w-4" />
            case 'completed': return <CheckCircle className="h-4 w-4" />
            case 'cancelled': return <XCircle className="h-4 w-4" />
            case 'no_show': return <XCircle className="h-4 w-4" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Appointment Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage and track all salon appointments</p>
                </div>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-pink-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-pink-600">{stats.today_appointments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_appointments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.confirmed_appointments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">${stats.this_week_revenue.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="no_show">No Show</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <Calendar className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Dates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setSearchTerm('')
                                setStatusFilter('all')
                                setDateFilter('all')
                            }}
                        >
                            Clear Filters

                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="space-y-4">
                    <div className="space-y-4">
                        {filteredAppointments.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                                        <p className="mt-1 text-sm text-gray-500">No appointments found matching your filters.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <User className="h-5 w-5 text-pink-600" />
                                                    {appointment.user.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {appointment.service_name} • {appointment.booking_reference}
                                                </CardDescription>
                                            </div>
                                            <Badge className={getStatusColor(appointment.status)}>
                                                {getStatusIcon(appointment.status)}
                                                <span className="ml-1">{appointment.status}</span>
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                {appointment.appointment_time}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                {appointment.phone || appointment.user.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-gray-500" />
                                                R{appointment.price.toFixed(2)}
                                            </div>
                                        </div>

                                        {appointment.staff && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <UserCheck className="h-4 w-4" />
                                                Assigned to: {appointment.staff.name}
                                            </div>
                                        )}

                                        {appointment.notes && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                                <p className="text-sm text-gray-600">{appointment.notes}</p>
                                            </div>
                                        )}

                                        {appointment.cancellation_reason && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <p className="text-sm text-red-700">
                                                    <strong>Cancellation reason:</strong> {appointment.cancellation_reason}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="clients" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Overview</CardTitle>
                            <CardDescription>Auto-created clients from customer bookings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Total Spent</TableHead>
                                        <TableHead>Visits</TableHead>
                                        <TableHead>Last Visit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clients.map((client, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{client.name}</TableCell>
                                            <TableCell>{client.email}</TableCell>
                                            <TableCell>R{client.total_spent?.toLocaleString()}</TableCell>
                                            <TableCell>{client.visits}</TableCell>
                                            <TableCell>{client.last_visit || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                        <CardDescription>All appointments scheduled for today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredAppointments
                                .filter(apt => format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                                .map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex flex-col items-center">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">{appointment.appointment_time}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{appointment.user.name}</p>
                                                <p className="text-sm text-gray-600">{appointment.service_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getStatusColor(appointment.status)}>
                                                {getStatusIcon(appointment.status)}
                                                <span className="ml-1">{appointment.status}</span>
                                            </Badge>
                                            {appointment.staff && (
                                                <span className="text-sm text-gray-600">
                                                    Staff: {appointment.staff.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        </div>
    )
}

export default function StaffAppointmentsPage() {
    return (
        <RoleBasedRoute requiredPermissions={['view appointments']} allowedRoles={['Admin', 'Owner', 'Manager', 'Staff', 'Receptionist']}>
            <StaffAppointmentsPageContent />
        </RoleBasedRoute>
    )
}
