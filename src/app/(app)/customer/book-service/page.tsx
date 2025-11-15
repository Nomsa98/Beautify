'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Phone, Mail, User, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'

interface Service {
    id: number
    name: string
    description: string
    price: number
    duration_minutes: number
    category: string
    image_url?: string
    tenant: {
        id: number
        name: string
        phone?: string
        email?: string
        address?: string
    }
}

interface BookingFormData {
    date: string
    time: string
    message?: string
}

export default function BookService() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    
    const [service, setService] = useState<Service | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isBooking, setIsBooking] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [bookingReference, setBookingReference] = useState('')
    const [formData, setFormData] = useState<BookingFormData>({
        date: '',
        time: '',
        message: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    
    const serviceId = searchParams.get('service')
    
    useEffect(() => {
        if (!serviceId) {
            router.push('/services-marketplace')
            return
        }
        
        fetchService()
    }, [serviceId])
    
    const fetchService = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get(`/api/services/${serviceId}`)
            setService(response.data.data)
        } catch (error) {
            console.error('Error fetching service:', error)
            router.push('/services-marketplace')
        } finally {
            setIsLoading(false)
        }
    }
    
    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        
        if (!formData.date) {
            newErrors.date = 'Please select a date'
        }
        
        if (!formData.time) {
            newErrors.time = 'Please select a time'
        }
        
        // Check if date is in the future
        if (formData.date) {
            const selectedDate = new Date(formData.date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            if (selectedDate < today) {
                newErrors.date = 'Please select a future date'
            }
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        try {
            setIsBooking(true)
            const response = await axios.post('/api/appointments', {
                service_id: serviceId,
                date: formData.date,
                time: formData.time,
                message: formData.message,
                client_name: user?.name,
                client_email: user?.email,
                client_phone: user?.phone || ''
            })
            
            if (response.data.success) {
                setBookingReference(response.data.data.booking_reference || response.data.data.id)
                setBookingSuccess(true)
            }
        } catch (error: any) {
            console.error('Booking error:', error)
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors)
            } else {
                setErrors({ general: 'Failed to create booking. Please try again.' })
            }
        } finally {
            setIsBooking(false)
        }
    }
    
    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 9; hour <= 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                slots.push(time)
            }
        }
        return slots
    }
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading service details...</p>
                </div>
            </div>
        )
    }
    
    if (!service) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Service not found</p>
                    <Button 
                        onClick={() => router.push('/services-marketplace')}
                        className="mt-4"
                    >
                        Back to Services
                    </Button>
                </div>
            </div>
        )
    }
    
    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                        <p className="text-gray-600">Your appointment has been successfully booked</p>
                    </div>
                    
                    <Card className="mb-6">
                        <CardContent className="p-8">
                            <div className="text-center mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Booking Reference</h3>
                                <p className="text-2xl font-bold text-gray-900">{bookingReference}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">{service.tenant.name}</p>
                                        <p className="text-sm text-gray-600">{service.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <p className="font-medium text-gray-900">
                                        {new Date(formData.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <p className="font-medium text-gray-900">{formData.time}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <Button
                            onClick={() => router.push('/appointments')}
                            className="bg-pink-600 hover:bg-pink-700"
                        >
                            View My Appointments
                        </Button>
                        <Button
                            onClick={() => router.push('/services-marketplace')}
                            variant="outline"
                        >
                            Book Another Service
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Book Your Appointment</h1>
                    <p className="text-gray-600 mt-2">Schedule your service with {service.tenant.name}</p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Service Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {service.image_url && (
                                <div className="aspect-video rounded-lg overflow-hidden">
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                                <p className="text-gray-600 mt-1">{service.description}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary">{service.category}</Badge>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-pink-600">R{service.price}</p>
                                    <p className="text-sm text-gray-500">{service.duration_minutes} minutes</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Salon Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{service.tenant.name}</span>
                                    </div>
                                    {service.tenant.phone && (
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{service.tenant.phone}</span>
                                        </div>
                                    )}
                                    {service.tenant.email && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{service.tenant.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Booking Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule Appointment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {errors.general && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{errors.general}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Select Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={errors.date ? 'border-red-500' : ''}
                                    />
                                    {errors.date && (
                                        <p className="text-sm text-red-600 mt-1">{errors.date}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Clock className="w-4 h-4 inline mr-2" />
                                        Select Time
                                    </label>
                                    <select
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${errors.time ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select a time</option>
                                        {generateTimeSlots().map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.time && (
                                        <p className="text-sm text-red-600 mt-1">{errors.time}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MessageSquare className="w-4 h-4 inline mr-2" />
                                        Special Instructions (Optional)
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="Any special requests or notes..."
                                    />
                                </div>
                                
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Your Details</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4" />
                                            <span>{user?.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{user?.email}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button
                                    type="submit"
                                    disabled={isBooking}
                                    className="w-full bg-pink-600 hover:bg-pink-700"
                                >
                                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
