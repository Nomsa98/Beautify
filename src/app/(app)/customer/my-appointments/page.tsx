'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Phone, 
    DollarSign, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Search,
    Filter,
    MessageSquare,
    Star,
    MoreVertical,
    Heart,
    Bookmark,
    User
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
import { useFavorites } from '@/hooks/useFavorites'
import axios from '@/lib/axios'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import RoleBasedRoute from '@/components/RoleBasedRoute'
import RescheduleModal from '@/components/customer/RescheduleModal'
import ModifyServiceModal from '@/components/customer/ModifyServiceModal'
import CancelModal from '@/components/customer/CancelModal'
import AppointmentCard from '@/components/customer/AppointmentCard'
import ReviewModal from '@/components/customer/ReviewModal'

interface CustomerAppointment {
    id: number
    booking_reference?: string
    service: {
        id: number
        name: string
        price: number
        duration_minutes: number
        category?: string
        description?: string
        image_url?: string
        is_on_promotion?: boolean
        has_promotion?: boolean
        is_currently_on_promotion?: boolean
        promotion_price?: number
        promotion_discount_percentage?: number
        promotion_title?: string
        promotion_description?: string
        promotion_start_date?: string
        promotion_end_date?: string
        effective_price?: number
    } | null
    service_name: string
    service_id?: number
    tenant: {
        id: number
        name: string
        address?: string
        phone?: string
        email?: string
    }
    staff: {
        id: number
        name: string
        specialization?: string
    } | null
    appointment_date: string
    appointment_time: string
    duration_minutes: number
    price: string
    total_price?: string
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
    payment_method?: string
    payment_status?: string
    notes?: string
    confirmed_at?: string
    cancelled_at?: string
    cancellation_reason?: string
    created_at?: string
    can_cancel: boolean
    can_reschedule: boolean
}

function MyAppointmentsPageContent() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const [appointments, setAppointments] = useState<CustomerAppointment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const { favoriteServices, toggleFavorite, isFavorite } = useFavorites()
    
    // Modal states
    const [rescheduleModal, setRescheduleModal] = useState<{ isOpen: boolean; appointment: CustomerAppointment | null }>({
        isOpen: false,
        appointment: null
    })
    const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; appointment: CustomerAppointment | null }>({
        isOpen: false,
        appointment: null
    })
    const [modifyModal, setModifyModal] = useState<{ isOpen: boolean; appointment: CustomerAppointment | null }>({
        isOpen: false,
        appointment: null
    })
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; appointment: CustomerAppointment | null }>({
        isOpen: false,
        appointment: null
    })

    useEffect(() => {
        fetchMyAppointments()
    }, [statusFilter, dateFilter])

    const fetchMyAppointments = async () => {
        try {
            const params: any = {}
            if (statusFilter !== 'all') params.status = statusFilter
            if (dateFilter === 'upcoming') {
                params.date_from = format(new Date(), 'yyyy-MM-dd')
            } else if (dateFilter === 'past') {
                params.date_to = format(new Date(), 'yyyy-MM-dd')
            }

            const response = await axios.get('/api/customer/bookings', { params })
            console.log('Appointments response:', response.data)
            setAppointments(response.data || [])
        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId: number, reason?: string) => {
        try {
            await axios.patch(`/api/customer/booking/${appointmentId}/cancel`, {
                cancellation_reason: reason
            })
            
            // Refresh appointments
            fetchMyAppointments()
        } catch (error) {
            console.error('Error cancelling appointment:', error)
        }
    }

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = 
            appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    const upcomingAppointments = appointments.filter(apt => 
        new Date(apt.appointment_date) >= new Date() && apt.status !== 'cancelled'
    ).length

    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {[...Array(3)].map((_, i) => (
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
                        My Appointments
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your beauty appointments and booking history</p>
                </div>
                <Button 
                    onClick={() => router.push('/services-marketplace')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book New Service
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-pink-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-pink-600">{upcomingAppointments}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{completedAppointments}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Star className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600">{appointments.length}</div>
                    </CardContent>
                </Card>
            </div>

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
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <Calendar className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Dates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="past">Past</SelectItem>
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

            {/* Appointments List */}
            <div className="grid gap-4">
                {filteredAppointments.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                                <p className="text-gray-600 mb-4">You haven't booked any appointments yet.</p>
                                <Button 
                                    onClick={() => router.push('/services-marketplace')}
                                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                >
                                    Browse Services
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredAppointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            isFavorite={appointment.service ? isFavorite(appointment.service.id) : false}
                            onToggleFavorite={() => {
                                if (appointment.service) {
                                    toggleFavorite(appointment.service.id)
                                }
                            }}
                            onReschedule={() => setRescheduleModal({ isOpen: true, appointment })}
                            onModify={() => setModifyModal({ isOpen: true, appointment })}
                            onCancel={() => setCancelModal({ isOpen: true, appointment })}
                            onRate={() => setReviewModal({ isOpen: true, appointment })}
                        />
                    ))
                )}
            </div>

            {/* Modals */}
            {rescheduleModal.appointment && (
                <RescheduleModal
                    appointment={{
                        id: rescheduleModal.appointment.id,
                        service_name: rescheduleModal.appointment.service_name,
                        appointment_date: rescheduleModal.appointment.appointment_date,
                        appointment_time: rescheduleModal.appointment.appointment_time
                    }}
                    isOpen={rescheduleModal.isOpen}
                    onClose={() => setRescheduleModal({ isOpen: false, appointment: null })}
                    onSuccess={() => {
                        fetchMyAppointments()
                        alert('Appointment rescheduled successfully!')
                    }}
                />
            )}

            {modifyModal.appointment && (
                <ModifyServiceModal
                    appointment={{
                        id: modifyModal.appointment.id,
                        service_name: modifyModal.appointment.service_name,
                        service_id: modifyModal.appointment.service?.id,
                        price: parseFloat(modifyModal.appointment.price),
                        tenant: modifyModal.appointment.tenant
                    }}
                    isOpen={modifyModal.isOpen}
                    onClose={() => setModifyModal({ isOpen: false, appointment: null })}
                    onSuccess={() => {
                        fetchMyAppointments()
                        alert('Service changed successfully!')
                    }}
                />
            )}

            {cancelModal.appointment && (
                <CancelModal
                    appointment={{
                        id: cancelModal.appointment.id,
                        service_name: cancelModal.appointment.service_name,
                        appointment_date: cancelModal.appointment.appointment_date,
                        appointment_time: cancelModal.appointment.appointment_time,
                        price: parseFloat(cancelModal.appointment.price)
                    }}
                    isOpen={cancelModal.isOpen}
                    onClose={() => setCancelModal({ isOpen: false, appointment: null })}
                    onSuccess={() => {
                        fetchMyAppointments()
                        alert('Appointment cancelled successfully!')
                    }}
                />
            )}

            {/* Review Modal */}
            {reviewModal.appointment && (
                <ReviewModal
                    appointment={{
                        id: reviewModal.appointment.id,
                        service_name: reviewModal.appointment.service_name,
                        staff: reviewModal.appointment.staff
                    }}
                    isOpen={reviewModal.isOpen}
                    onClose={() => setReviewModal({ isOpen: false, appointment: null })}
                    onSuccess={() => {
                        fetchMyAppointments()
                        alert('Thank you for your review!')
                    }}
                />
            )}
        </div>
    )
}

export default function MyAppointmentsPage() {
    return (
        <RoleBasedRoute requiredPermissions={['view own appointments']} allowedRoles={['Customer']}>
            <MyAppointmentsPageContent />
        </RoleBasedRoute>
    )
}
