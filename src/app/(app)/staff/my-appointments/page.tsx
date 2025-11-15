'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Calendar, Clock, User, Mail, Phone, AlertCircle, CheckCircle, XCircle, Filter, Search, ChevronDown, CreditCard, Wallet, Banknote, Smartphone, Building2, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Appointment {
    id: number
    service_name: string
    client_name?: string
    client_email?: string
    client_phone?: string
    appointment_date: string
    appointment_time: string
    status: string
    duration_minutes: number
    notes: string | null
    payment_status?: string
    payment_method?: string
    total_price?: string
    user?: {
        id: number
        name: string
        email: string
        phone: string
    }
    service?: {
        id: number
        name: string
        price: string
        image_url?: string
        description?: string
        category?: string
        has_promotion?: boolean
        is_on_promotion?: boolean
        is_currently_on_promotion?: boolean
        promotion_price?: string
        promotion_discount_percentage?: number
        promotion_title?: string
        promotion_description?: string
    }
}

export default function StaffAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
    const [markingPaid, setMarkingPaid] = useState<number | null>(null)

    useEffect(() => {
        fetchAppointments()
    }, [])

    useEffect(() => {
        filterAppointments()
    }, [appointments, searchTerm, statusFilter])

    const fetchAppointments = async () => {
        try {
            setLoading(true)
            setError(null)
            // Using the general appointments endpoint which will filter by staff_id on backend
            const response = await axios.get('/api/appointments', {
                params: {
                    staff_only: true // This will tell backend to filter by current user's staff assignments
                }
            })
            
            // Map the API response to include client info from user object
            const mappedAppointments = (response.data.data || []).map((apt: any) => ({
                ...apt,
                client_name: apt.user?.name || apt.client_name || 'N/A',
                client_email: apt.user?.email || apt.client_email || 'N/A',
                client_phone: apt.user?.phone || apt.client_phone || apt.phone || 'N/A'
            }))
            
            setAppointments(mappedAppointments)
        } catch (err: any) {
            console.error('Error fetching appointments:', err)
            setError(err.response?.data?.message || 'Failed to load appointments')
        } finally {
            setLoading(false)
        }
    }

    const filterAppointments = () => {
        let filtered = [...appointments]

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(apt => 
                apt.status.toLowerCase() === statusFilter.toLowerCase()
            )
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(apt =>
                apt.client_name?.toLowerCase().includes(term) ||
                apt.service_name?.toLowerCase().includes(term) ||
                apt.client_email?.toLowerCase().includes(term) ||
                apt.service?.name?.toLowerCase().includes(term)
            )
        }

        setFilteredAppointments(filtered)
    }

    const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
        try {
            setUpdatingStatus(appointmentId)
            await axios.patch(`/api/appointments/${appointmentId}/status`, {
                status: newStatus
            })
            
            // Update local state
            setAppointments(prev => prev.map(apt => 
                apt.id === appointmentId ? { ...apt, status: newStatus } : apt
            ))
            
            // Show success message (you can add a toast notification here)
            alert('Appointment status updated successfully!')
        } catch (err: any) {
            console.error('Error updating status:', err)
            alert('Failed to update status: ' + (err.response?.data?.message || 'Unknown error'))
        } finally {
            setUpdatingStatus(null)
        }
    }

    const markCashPaymentAsPaid = async (appointmentId: number) => {
        if (!confirm('Mark this cash payment as completed?')) {
            return
        }

        try {
            setMarkingPaid(appointmentId)
            const response = await axios.post(`/api/payment/cash/${appointmentId}/mark-paid`)
            
            if (response.data.success) {
                // Update local state
                setAppointments(prev => prev.map(apt => 
                    apt.id === appointmentId 
                        ? { ...apt, payment_status: 'paid' } 
                        : apt
                ))
                
                alert('Payment marked as paid!')
            }
        } catch (err: any) {
            console.error('Error marking payment as paid:', err)
            alert('Failed to mark payment as paid: ' + (err.response?.data?.message || 'Unknown error'))
        } finally {
            setMarkingPaid(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'in-progress':
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle className="h-4 w-4" />
            case 'in-progress':
            case 'in_progress':
                return <Clock className="h-4 w-4" />
            case 'completed':
                return <CheckCircle className="h-4 w-4" />
            case 'cancelled':
                return <XCircle className="h-4 w-4" />
            default:
                return <AlertCircle className="h-4 w-4" />
        }
    }

    const formatTime = (time: string) => {
        try {
            const [hours, minutes] = time.split(':')
            const hour = parseInt(hours)
            const ampm = hour >= 12 ? 'PM' : 'AM'
            const displayHour = hour % 12 || 12
            return `${displayHour}:${minutes} ${ampm}`
        } catch {
            return time
        }
    }

    const getPaymentStatusColor = (status?: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 border-green-200'
            case 'completed': return 'bg-green-100 text-green-700 border-green-200' // Backwards compatibility
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'failed': return 'bg-red-100 text-red-700 border-red-200'
            case 'refunded': return 'bg-purple-100 text-purple-700 border-purple-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getPaymentMethodIcon = (method?: string) => {
        switch (method) {
            case 'card': return <CreditCard className="h-3 w-3" />
            case 'wallet': return <Wallet className="h-3 w-3" />
            case 'cash': return <Banknote className="h-3 w-3" />
            case 'bank_transfer': return <Building2 className="h-3 w-3" />
            case 'mobile': return <Smartphone className="h-3 w-3" />
            default: return <Banknote className="h-3 w-3" />
        }
    }

    const getPaymentMethodName = (method?: string) => {
        switch (method) {
            case 'card': return 'Card'
            case 'wallet': return 'Wallet'
            case 'cash': return 'Cash'
            case 'bank_transfer': return 'Bank Transfer'
            case 'mobile': return 'Mobile'
            default: return method || 'N/A'
        }
    }

    const formatDate = (date: string) => {
        try {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch {
            return date
        }
    }

    const getAvailableStatusTransitions = (currentStatus: string) => {
        const status = currentStatus.toLowerCase()
        switch (status) {
            case 'pending':
                return ['confirmed', 'cancelled']
            case 'confirmed':
                return ['in_progress', 'cancelled']
            case 'in-progress':
            case 'in_progress':
                return ['completed', 'cancelled']
            case 'completed':
                return [] // No transitions from completed
            case 'cancelled':
                return [] // No transitions from cancelled
            default:
                return ['confirmed', 'in_progress', 'completed', 'cancelled']
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        My Appointments
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your assigned appointments</p>
                </div>
                <button
                    onClick={fetchAppointments}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                            <p className="text-sm text-gray-600">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">
                                {appointments.filter(a => a.status.toLowerCase() === 'pending').length}
                            </p>
                            <p className="text-sm text-gray-600">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {appointments.filter(a => a.status.toLowerCase() === 'confirmed').length}
                            </p>
                            <p className="text-sm text-gray-600">Confirmed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                                {appointments.filter(a => a.status.toLowerCase() === 'in-progress' || a.status.toLowerCase() === 'in_progress').length}
                            </p>
                            <p className="text-sm text-gray-600">In Progress</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {appointments.filter(a => a.status.toLowerCase() === 'completed').length}
                            </p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by client name, service, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm || statusFilter !== 'all' ? 'No Matching Appointments' : 'No Appointments'}
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'You have no appointments assigned to you'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.map((appointment) => {
                        const availableTransitions = getAvailableStatusTransitions(appointment.status)
                        const hasPromotion = appointment.service?.has_promotion || appointment.service?.is_currently_on_promotion || appointment.service?.is_on_promotion
                        
                        return (
                            <Card key={appointment.id} className={`hover:shadow-md transition-shadow border-l-4 ${
                                hasPromotion 
                                    ? 'border-l-red-500 border-red-300 ring-2 ring-red-100' 
                                    : 'border-l-pink-500'
                            }`}>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Service Image */}
                                            {appointment.service?.image_url && (
                                                <div className="flex-shrink-0 relative">
                                                    <img 
                                                        src={
                                                            appointment.service.image_url.startsWith('http')
                                                                ? appointment.service.image_url
                                                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${appointment.service.image_url}`
                                                        }
                                                        alt={appointment.service_name}
                                                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                        }}
                                                    />
                                                    
                                                    {/* Promotion Badge */}
                                                    {hasPromotion && appointment.service?.promotion_discount_percentage && (
                                                        <div className="absolute -top-1 -right-1">
                                                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-1.5 py-0.5 animate-pulse">
                                                                🔥 {appointment.service.promotion_discount_percentage}% OFF
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Category Badge */}
                                                    {appointment.service?.category && (
                                                        <div className="absolute -bottom-1 -left-1">
                                                            <Badge className="bg-white/90 text-gray-900 text-xs px-1.5 py-0.5">
                                                                {appointment.service.category}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                    {appointment.service_name}
                                                </h3>
                                                {appointment.total_price && (
                                                    <div className="mb-2">
                                                        {hasPromotion && appointment.service?.price && appointment.service?.promotion_price ? (
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-lg font-semibold text-red-600">
                                                                    R{parseFloat(appointment.service.promotion_price).toFixed(2)}
                                                                </p>
                                                                <p className="text-sm text-gray-500 line-through">
                                                                    R{parseFloat(appointment.service.price).toFixed(2)}
                                                                </p>
                                                                <Badge className="bg-red-100 text-red-700 text-xs">
                                                                    SAVE R{(parseFloat(appointment.service.price) - parseFloat(appointment.service.promotion_price)).toFixed(2)}
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg font-semibold text-pink-600">
                                                                R{parseFloat(appointment.total_price).toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className={getStatusColor(appointment.status)}>
                                                        <span className="flex items-center gap-1">
                                                            {getStatusIcon(appointment.status)}
                                                            {appointment.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </Badge>
                                                    
                                                    {/* Payment Status Badge */}
                                                    {appointment.payment_status && (
                                                        <Badge className={`border ${getPaymentStatusColor(appointment.payment_status)}`} variant="outline">
                                                            {(appointment.payment_status === 'paid' || appointment.payment_status === 'completed') && <CheckCircle className="h-3 w-3 mr-1" />}
                                                            {appointment.payment_status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                            {appointment.payment_status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                                            <span className="capitalize">{appointment.payment_status}</span>
                                                        </Badge>
                                                    )}
                                                    
                                                    {/* Payment Method Badge */}
                                                    {appointment.payment_method && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {getPaymentMethodIcon(appointment.payment_method)}
                                                            <span className="ml-1">{getPaymentMethodName(appointment.payment_method)}</span>
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-2 text-gray-700 mb-1">
                                                    <Calendar className="h-4 w-4 text-pink-600" />
                                                    <span className="font-medium">{formatDate(appointment.appointment_date)}</span>
                                                </div>
                                                <div className="flex items-center justify-end gap-2 text-gray-900 font-semibold text-lg">
                                                    <Clock className="h-5 w-5 text-pink-600" />
                                                    {formatTime(appointment.appointment_time)}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {appointment.duration_minutes} min
                                                </div>
                                            </div>
                                        </div>

                                        {/* Client Information */}
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-600" />
                                                Client Information
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm">{appointment.client_name}</span>
                                                </div>
                                                {appointment.client_email && (
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Mail className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm">{appointment.client_email}</span>
                                                    </div>
                                                )}
                                                {appointment.client_phone && (
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm">{appointment.client_phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {appointment.notes && (
                                            <div className="bg-blue-50 border-l-4 border-l-blue-400 rounded-lg p-4">
                                                <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                                    Notes:
                                                </p>
                                                <p className="text-sm text-gray-700">{appointment.notes}</p>
                                            </div>
                                        )}

                                        {/* Payment Action - Mark Cash as Paid */}
                                        {appointment.payment_method === 'cash' && appointment.payment_status === 'pending' && (
                                            <div className="border-t pt-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Action:</p>
                                                <Button
                                                    onClick={() => markCashPaymentAsPaid(appointment.id)}
                                                    disabled={markingPaid === appointment.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {markingPaid === appointment.id ? (
                                                        <span className="flex items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Marking as Paid...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Mark Cash Payment as Paid
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        )}

                                        {/* Status Update Actions */}
                                        {availableTransitions.length > 0 && (
                                            <div className="border-t pt-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Update Status:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableTransitions.map((status) => (
                                                        <Button
                                                            key={status}
                                                            onClick={() => updateAppointmentStatus(appointment.id, status)}
                                                            disabled={updatingStatus === appointment.id}
                                                            className={`
                                                                ${status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                                                ${status === 'in_progress' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                                                                ${status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                                ${status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}
                                                                text-white px-4 py-2 rounded-lg
                                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                            `}
                                                        >
                                                            {updatingStatus === appointment.id ? (
                                                                <span className="flex items-center gap-2">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                    Updating...
                                                                </span>
                                                            ) : (
                                                                `Mark as ${status.replace('-', ' ').replace('_', ' ')}`
                                                            )}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
