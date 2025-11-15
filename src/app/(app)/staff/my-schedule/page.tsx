'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Calendar, Clock, User, MapPin, Phone, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Appointment {
    id: number
    service_name: string
    client_name: string
    client_email: string
    client_phone: string
    appointment_date: string
    appointment_time: string
    status: string
    duration_minutes: number
    notes: string | null
}

export default function StaffSchedulePage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchTodaySchedule()
    }, [])

    const fetchTodaySchedule = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get('/api/appointments/today-schedule')
            setAppointments(response.data.appointments || [])
        } catch (err: any) {
            console.error('Error fetching schedule:', err)
            setError(err.response?.data?.message || 'Failed to load schedule')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
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

    const formatDate = (date: string) => {
        try {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return date
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
                        My Schedule
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {appointments.length > 0 ? formatDate(appointments[0].appointment_date) : 'Today'}
                    </p>
                </div>
                <button
                    onClick={fetchTodaySchedule}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                            <p className="text-sm text-gray-600">Total Appointments</p>
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

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Appointments List */}
            {appointments.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Today</h3>
                            <p className="text-gray-600">You have no appointments scheduled for today.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appointment) => (
                        <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                    {appointment.service_name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(appointment.status)}>
                                                        <span className="flex items-center gap-1">
                                                            {getStatusIcon(appointment.status)}
                                                            {appointment.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-pink-600 font-semibold">
                                                    <Clock className="h-5 w-5" />
                                                    {formatTime(appointment.appointment_time)}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {appointment.duration_minutes} minutes
                                                </p>
                                            </div>
                                        </div>

                                        {/* Client Information */}
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                            <h4 className="font-semibold text-gray-900 mb-3">Client Information</h4>
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
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">Notes:</p>
                                                <p className="text-sm text-blue-800">{appointment.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
