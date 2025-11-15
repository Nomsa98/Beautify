'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    CheckCircle, 
    Calendar, 
    Clock, 
    MapPin, 
    User, 
    CreditCard, 
    Download,
    Share2,
    Home,
    Eye,
    Mail,
    Phone
} from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { format } from 'date-fns'

interface BookingDetails {
    id: number
    booking_reference: string
    service_name: string
    appointment_date: string
    appointment_time: string
    status: string
    payment_method: string
    payment_status: string
    total_price: number
    price: number
    duration_minutes: number
    notes: string
    tenant: {
        name: string
        address?: string
        phone?: string
        email?: string
    }
    staff?: {
        name: string
    }
}

export default function BookingConfirmationPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const searchParams = useSearchParams()
    const bookingId = searchParams.get('id')
    const bookingRef = searchParams.get('ref')

    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (bookingId || bookingRef) {
            fetchBookingDetails()
        }
    }, [bookingId, bookingRef])

    const fetchBookingDetails = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/customer/booking/${bookingId || bookingRef}`)
            
            if (response.data.success || response.data.appointment) {
                setBooking(response.data.appointment || response.data.data)
            }
        } catch (err: any) {
            console.error('Error fetching booking:', err)
            setError('Failed to load booking details')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'EEEE, MMMM d, yyyy')
    }

    const handleDownloadReceipt = () => {
        // TODO: Implement PDF download
        alert('Receipt download coming soon!')
    }

    const handleShare = async () => {
        if (navigator.share && booking) {
            try {
                await navigator.share({
                    title: 'Booking Confirmation',
                    text: `My appointment at ${booking.tenant.name} on ${formatDate(booking.appointment_date)}`,
                    url: window.location.href
                })
            } catch (err) {
                console.log('Share failed:', err)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading booking details...</p>
                </div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || 'We couldn\'t find your booking details.'}</p>
                        <Button onClick={() => router.push('/customer/services-marketplace')} className="bg-pink-600 hover:bg-pink-700">
                            Browse Services
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-lg text-gray-600">Your appointment has been successfully booked</p>
                    <div className="mt-4">
                        <Badge className="bg-pink-600 text-white px-4 py-2 text-lg">
                            {booking.booking_reference}
                        </Badge>
                    </div>
                </div>

                {/* Main Booking Details Card */}
                <Card className="mb-6 shadow-xl border-2 border-pink-100">
                    <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                        <CardTitle className="text-2xl">Appointment Details</CardTitle>
                        <CardDescription className="text-pink-100">
                            Please save this information for your records
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Service Info */}
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Service</h3>
                            <p className="text-2xl font-bold text-gray-900">{booking.service_name}</p>
                            <p className="text-gray-600 mt-1">Duration: {booking.duration_minutes} minutes</p>
                        </div>

                        {/* Date & Time */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-pink-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(booking.appointment_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-semibold text-gray-900">{booking.appointment_time}</p>
                                </div>
                            </div>
                        </div>

                        {/* Salon Info */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Salon</h3>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-900">{booking.tenant.name}</span>
                                </div>
                                {booking.tenant.address && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{booking.tenant.address}</span>
                                    </div>
                                )}
                                {booking.tenant.phone && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{booking.tenant.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Staff */}
                        {booking.staff && (
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Your Stylist</p>
                                    <p className="font-semibold text-gray-900">{booking.staff.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Info */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Payment</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{booking.payment_method}</p>
                                        <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                                            {booking.payment_status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(booking.total_price || booking.price)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {booking.notes && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                                <p className="text-gray-700">{booking.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Button 
                        onClick={() => router.push('/customer/my-appointments')}
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View My Appointments
                    </Button>
                    <Button 
                        onClick={handleDownloadReceipt}
                        variant="outline"
                        className="border-pink-600 text-pink-600 hover:bg-pink-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Receipt
                    </Button>
                    <Button 
                        onClick={handleShare}
                        variant="outline"
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                </div>

                {/* Info Card */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <Mail className="w-5 h-5 text-blue-600 mt-1" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Confirmation Email Sent</h3>
                                <p className="text-sm text-blue-700">
                                    We've sent a confirmation email to <strong>{user?.email}</strong> with all the details of your appointment.
                                </p>
                                <p className="text-sm text-blue-700 mt-2">
                                    You'll receive a reminder email 24 hours before your appointment.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <Button 
                        onClick={() => router.push('/dashboard')}
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}
