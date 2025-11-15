'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { useGuest } from '@/hooks/useGuest'

interface BookingDetails {
    id: string
    booking_reference: string
    name: string
    email: string
    phone: string
    service_name: string
    tenant_name: string
    date: string
    time: string
    status: string
    message?: string
    created_at: string
}

export default function BookingConfirmation() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { getBookingByReference } = useGuest()
    
    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [copied, setCopied] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    
    const bookingRef = searchParams.get('ref')
    
    useEffect(() => {
        if (!bookingRef) {
            router.push('/')
            return
        }
        
        const fetchBooking = async () => {
            try {
                setIsLoading(true)
                const response = await getBookingByReference(bookingRef)
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
                        created_at: response.booking.created_at
                    })
                }
            } catch (error) {
                console.error('Failed to fetch booking:', error)
                router.push('/')
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchBooking()
    }, [bookingRef, router]) // Removed getBookingByReference from dependencies
    
    const copyReference = () => {
        if (booking?.booking_reference) {
            navigator.clipboard.writeText(booking.booking_reference)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading booking details...</p>
                </div>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Booking not found</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600">Your appointment has been successfully booked</p>
                </div>
                
                {/* Booking Details Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    {/* Booking Reference */}
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Booking Reference</h3>
                                <p className="text-2xl font-bold text-gray-900">{booking.booking_reference}</p>
                            </div>
                            <button
                                onClick={copyReference}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Service Details */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Service Details</h3>
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
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Details</h3>
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
                    
                    {/* Status */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </div>
                            <div className="text-right">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Booked On</h3>
                                <p className="text-sm text-gray-900">
                                    {new Date(booking.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {booking.message && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-900 mb-1">Special Instructions</h3>
                            <p className="text-sm text-blue-800">{booking.message}</p>
                        </div>
                    )}
                </div>
                
                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => router.push('/track-booking')}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                        <span>Track Your Booking</span>
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <span>Book Another Service</span>
                    </button>
                </div>
                
                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="font-medium text-yellow-900 mb-2">Important Notes</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Please arrive 10-15 minutes before your appointment time</li>
                        <li>• Bring a valid ID and your booking reference</li>
                        <li>• You will receive a confirmation email shortly</li>
                        <li>• To reschedule or cancel, please contact the salon directly</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
