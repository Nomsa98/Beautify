'use client'

import { useState } from 'react'
import { Search, Calendar, Clock, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGuest } from '@/hooks/useGuest'

interface BookingStatus {
    id: string
    booking_reference: string
    name: string
    email: string
    phone: string
    service_name: string
    tenant_name: string
    date: string
    time: string
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
    message?: string
    created_at: string
    updated_at: string
}

export default function TrackBooking() {
    const router = useRouter()
    const { getBookingByReference, loading: guestLoading, error: guestError } = useGuest()
    const [searchRef, setSearchRef] = useState('')
    const [booking, setBooking] = useState<BookingStatus | null>(null)
    const [error, setError] = useState('')

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchRef.trim()) return

        setError('')
        
        try {
            const response = await getBookingByReference(searchRef.trim().toUpperCase())
            
            if (response.success && response.booking) {
                setBooking({
                    id: response.booking.id,
                    booking_reference: response.booking.booking_reference,
                    name: response.booking.name,
                    email: response.booking.email,
                    phone: response.booking.phone,
                    service_name: response.booking.service_name,
                    tenant_name: response.booking.tenant_name,
                    date: response.booking.date,
                    time: response.booking.time,
                    status: response.booking.status,
                    message: response.booking.message,
                    created_at: response.booking.created_at,
                    updated_at: response.booking.updated_at
                })
            }
        } catch (err) {
            setError(guestError || 'Booking not found. Please check your reference number.')
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'pending':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />
            case 'in_progress':
                return <Clock className="w-5 h-5 text-blue-600" />
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-600" />
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'in_progress':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Booking</h1>
                    <p className="text-gray-600">Enter your booking reference to check status</p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label htmlFor="booking-ref" className="block text-sm font-medium text-gray-700 mb-2">
                                Booking Reference
                            </label>
                            <div className="relative">
                                <input
                                    id="booking-ref"
                                    type="text"
                                    value={searchRef}
                                    onChange={(e) => setSearchRef(e.target.value)}
                                    placeholder="Enter your booking reference (e.g., BK123456)"
                                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    required
                                />
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={guestLoading}
                            className="w-full px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                            {guestLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    <span>Track Booking</span>
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Booking Details */}
                {booking && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        {/* Status Header */}
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    Booking #{booking.booking_reference}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(booking.status)}
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                                <p>Last updated</p>
                                <p>{new Date(booking.updated_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Booking Info */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Appointment Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.tenant_name}</p>
                                            <p className="text-sm text-gray-600">{booking.service_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {new Date(booking.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                                            <span className="text-xs text-white font-medium">
                                                {booking.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-900">{booking.name}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <p className="text-gray-900">{booking.email}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <p className="text-gray-900">{booking.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {booking.message && (
                            <div className="p-4 bg-blue-50 rounded-lg mb-6">
                                <h3 className="text-sm font-medium text-blue-900 mb-1">Special Instructions</h3>
                                <p className="text-sm text-blue-800">{booking.message}</p>
                            </div>
                        )}

                        {/* Status Timeline */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Booking Timeline</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Booking Created</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(booking.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                
                                {booking.status !== 'pending' && (
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Booking Confirmed</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(booking.updated_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Appointment Date</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(`${booking.date} ${booking.time}`).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={() => router.push('/')}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Book Another Service
                    </button>
                    {booking && (
                        <button
                            onClick={() => router.push(`/booking-confirmation?ref=${booking.booking_reference}`)}
                            className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
                        >
                            View Full Details
                        </button>
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                    <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        If you can't find your booking or need to make changes, please contact the salon directly.
                    </p>
                    <div className="text-sm text-gray-600">
                        <p>• Check your email for the booking confirmation</p>
                        <p>• Booking references are usually 6-8 characters long</p>
                        <p>• Contact customer support if you need assistance</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
