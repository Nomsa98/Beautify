'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { useFavorites } from '@/hooks/useFavorites'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth'
import RoleBasedRoute from '@/components/RoleBasedRoute'
import StaffSelectionModal from '@/components/customer/StaffSelectionModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ServiceCard from '@/components/shared/ServiceCard'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Clock, Users, Gift, X, XCircle, Mail, Scissors, Calendar, CreditCard, Wallet as WalletIcon } from 'lucide-react'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'

interface Service {
    id: number | string
    name: string
    description: string
    price: number | string
    effective_price?: string
    promotion_price?: number | string
    duration_minutes?: number
    duration?: string
    category: string
    image?: string | null
    image_url?: string
    is_active: boolean
    staff_required: boolean
    booking_buffer_minutes: number
    tenant_id: string
    tenant_name: string
    // Promotion fields
    is_on_promotion?: boolean
    is_currently_on_promotion?: boolean
    promotion_discount_percentage?: number
    promotion_start_date?: string
    promotion_end_date?: string
    promotion_title?: string
    promotion_description?: string
    promotion_time_remaining?: number
    promotion_time_remaining_formatted?: string
    // Rating fields
    average_rating?: number | null
    total_reviews?: number
}

interface TenantServices {
    tenant_id: string
    tenant_name: string
    services: Service[]
    total_services: number
    active_promotions: number
}

interface CustomerStats {
    totalBookings: number
    upcomingAppointments: number
    favoriteServices: number
}

export default function ServicesMarketplacePage() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const { favoriteServices, toggleFavorite, isFavorite } = useFavorites()
    const { paymentMethods, loading: loadingPaymentMethods } = usePaymentMethods()
    
    const [services, setServices] = useState<Service[]>([])
    const [tenantServices, setTenantServices] = useState<TenantServices[]>([])
    const [promotionalServices, setPromotionalServices] = useState<Service[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [customerStats, setCustomerStats] = useState<CustomerStats>({
        totalBookings: 0,
        upcomingAppointments: 0,
        favoriteServices: 0
    })
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [bookingData, setBookingData] = useState({
        date: '',
        time: '',
        message: '',
        payment_method_id: '',
        staff_id: null as number | null
    })
    const [isBooking, setIsBooking] = useState(false)
    const [showStaffModal, setShowStaffModal] = useState(false)
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedSalon, setSelectedSalon] = useState('all')

    useEffect(() => {
        fetchServices()
        fetchCategories()
    }, [])

    useEffect(() => {
        if (user && favoriteServices.length >= 0) {
            fetchCustomerStats()
        }
    }, [user, favoriteServices])

    // Fetch available slots when date or staff changes
    useEffect(() => {
        if (selectedService && bookingData.date) {
            fetchAvailableSlots()
        }
    }, [bookingData.date, bookingData.staff_id, selectedService])

    const fetchServices = async () => {
        try {
            let response
            let servicesData = []

            try {
                // Try the authenticated endpoint first
                response = await axios.get('/api/public/services')
                console.log('Authenticated Services API Response:', response.data)
            } catch (authError) {
                console.log('Auth endpoint failed, trying guest endpoint:', authError)
                // Fallback to guest endpoint if authenticated fails
                response = await axios.get('/api/guest/services')
                console.log('Guest Services API Response:', response.data)
            }

            // Handle different response formats
            if (response.data.data) {
                servicesData = response.data.data
            } else if (response.data.services) {
                // Handle services array from public API
                if (Array.isArray(response.data.services)) {
                    servicesData = response.data.services
                } else {
                    // Handle grouped services format like guest endpoint
                    const servicesGrouped = response.data.services || {}
                    Object.values(servicesGrouped).forEach((categoryServices: any) => {
                        if (Array.isArray(categoryServices)) {
                            servicesData.push(...categoryServices)
                        }
                    })
                }
            } else if (Array.isArray(response.data)) {
                servicesData = response.data
            }

            setServices(servicesData)

            // Group services by tenant
            const grouped = servicesData.reduce((acc: { [key: string]: TenantServices }, service: Service) => {
                if (!acc[service.tenant_id]) {
                    acc[service.tenant_id] = {
                        tenant_id: service.tenant_id,
                        tenant_name: service.tenant_name,
                        services: [],
                        total_services: 0,
                        active_promotions: 0
                    }
                }
                acc[service.tenant_id].services.push(service)
                acc[service.tenant_id].total_services++
                if (service.is_on_promotion) {
                    acc[service.tenant_id].active_promotions++
                }
                return acc
            }, {})

            // Filter promotional services
            const promotional = servicesData.filter((service: Service) => service.is_on_promotion || service.is_currently_on_promotion)

            setTenantServices(Object.values(grouped))
            setPromotionalServices(promotional)
        } catch (error) {
            console.error('Error fetching services:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/services/categories')
            setCategories(response.data.data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchCustomerStats = async () => {
        try {
            // Fetch customer's booking statistics
            const appointmentsResponse = await axios.get('/api/customer/bookings')
            const appointments = appointmentsResponse.data || []

            const totalBookings = appointments.length
            const upcomingAppointments = appointments.filter((apt: any) =>
                apt.status === 'confirmed' && new Date(apt.appointment_date) >= new Date()
            ).length

            setCustomerStats({
                totalBookings,
                upcomingAppointments,
                favoriteServices: favoriteServices.length
            })
        } catch (error) {
            console.error('Error fetching customer stats:', error)
            // Set default values on error
            setCustomerStats({
                totalBookings: 0,
                upcomingAppointments: 0,
                favoriteServices: favoriteServices.length
            })
        }
    }




    const fetchAvailableSlots = async () => {
        if (!selectedService || !bookingData.date) return

        try {
            setLoadingSlots(true)
            const params: any = {
                service_id: selectedService.id,
                tenant_id: selectedService.tenant_id,
                date: bookingData.date
            }
            
            if (bookingData.staff_id) {
                params.staff_id = bookingData.staff_id
            }

            const response = await axios.get('/api/public/available-slots', { params })
            
            if (response.data.success) {
                const slots = response.data.data.available_slots.map((slot: any) => slot.time)
                setAvailableSlots(slots)
            }
        } catch (err) {
            console.error('Failed to fetch available slots:', err)
            // Fallback to generated slots if API fails
            setAvailableSlots(generateTimeSlots())
        } finally {
            setLoadingSlots(false)
        }
    }

    const handleBookService = (serviceId: number | string) => {
        const service = services.find(s => s.id === serviceId)
        if (service) {
            setSelectedService(service)
            setShowBookingModal(true)
            setBookingData({ date: '', time: '', message: '', payment_method_id: '', staff_id: null })
            setAvailableSlots([])
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

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationErrors({})

        if (!selectedService) return

        // Client-side validation
        const errors: Record<string, string> = {}
        
        if (!bookingData.date) {
            errors.date = 'Please select a date'
        }
        if (!bookingData.time) {
            errors.time = 'Please select a time slot'
        }
        if (!bookingData.payment_method_id) {
            errors.payment_method = 'Please select a payment method'
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }

        try {
            setIsBooking(true)
            
            // Use NEW endpoint that handles Paystack redirect
            const response = await axios.post('/api/booking/initialize-payment', {
                service_id: selectedService.id,
                date: bookingData.date,
                time: bookingData.time,
                message: bookingData.message,
                payment_method_id: parseInt(bookingData.payment_method_id),
                staff_id: bookingData.staff_id,
                reward_id: null // Can add reward selection later
            })

            if (response.data.success) {
                // Get the payment method to check if it's card
                const selectedMethod = paymentMethods.find(m => m.id === parseInt(bookingData.payment_method_id))
                
                if (selectedMethod?.type === 'card') {
                    // Redirect to Paystack for card payment
                    window.location.href = response.data.authorization_url
                } else {
                    // Cash/Wallet - booking created, show success
                    setShowBookingModal(false)
                    setValidationErrors({})
                    const appointmentId = response.data.appointment?.id
                    router.push(`/customer/my-appointments?success=true`)
                }
            }
        } catch (error: any) {
            console.error('Booking error:', error)
            console.error('Error response:', error.response?.data)
            
            // Handle validation errors (422)
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const backendErrors: Record<string, string> = {}
                Object.keys(error.response.data.errors).forEach(key => {
                    backendErrors[key] = error.response.data.errors[key][0]
                })
                setValidationErrors(backendErrors)
            }
            // Handle other errors
            else {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking. Please try again.'
                setValidationErrors({
                    general: errorMessage
                })
                alert(`Booking Error: ${errorMessage}`)
            }
        } finally {
            setIsBooking(false)
        }
    }

    const handleShareService = (service: Service) => {
        const shareText = `Check out this amazing service: ${service.name} at ${service.tenant_name}!`
        const shareUrl = `${window.location.origin}/services-marketplace?service=${service.id}`

        if (navigator.share) {
            navigator.share({
                title: `${service.name} - ${service.tenant_name}`,
                text: shareText,
                url: shareUrl
            })
        } else {
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
            alert('Service link copied to clipboard!')
        }
    }


    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(numPrice);
    };


    const formatDuration = (service: Service) => {
        // Use duration string if available, otherwise format duration_minutes
        if (service.duration) {
            return service.duration
        }
        const minutes = service.duration_minutes || 60
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
        }
        return `${mins}m`
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Enhanced Header with Search */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-8 text-slate-800 relative overflow-hidden border border-slate-300 shadow-lg">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 text-6xl">💄</div>
                    <div className="absolute bottom-4 left-4 text-4xl">✨</div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">💅</div>
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold mb-2">
                                Welcome back, {user?.name}! ✨
                            </h1>
                            <p className="text-slate-600 text-lg">
                                Discover exclusive services, promotions, and book your next appointment
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => router.push('/customer/my-appointments')}
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Calendar className="h-5 w-5 mr-2" />
                                My Appointments
                            </Button>
                            <Button
                                onClick={() => router.push('/customer/favorites')}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-md px-6 py-3 rounded-xl font-semibold"
                            >
                                <Heart className="h-4 w-4 mr-2" />
                                My Favorites
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Customer Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-pink-600">Total Bookings</p>
                                <p className="text-2xl font-bold text-pink-700">{customerStats.totalBookings}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-pink-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Upcoming Appointments</p>
                                <p className="text-2xl font-bold text-blue-700">{customerStats.upcomingAppointments}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Favorite Services</p>
                                <p className="text-2xl font-bold text-purple-700">{favoriteServices.length}</p>
                            </div>
                            <Heart className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Hot Promotions Section */}
            {promotionalServices.length > 0 && (
                <div className="py-16 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                🔥 Special Offers & Promotions
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Don't miss out on these limited-time deals from our partner salons!
                            </p>
                            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto mt-6 rounded-full"></div>
                        </div>

                        {/* Promotional Services Slider */}
                        <div className="relative px-4 py-8">
                            {promotionalServices.length <= 3 ? (
                                // Grid layout for 3 or fewer items
                                <div className={`grid gap-8 ${promotionalServices.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : promotionalServices.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                                    {promotionalServices.map((service: Service) => {
                                        // Convert service to match ServiceCard interface
                                        const serviceCardData = {
                                            id: Number(service.id),
                                            name: service.name,
                                            description: service.description,
                                            price: service.price,
                                            duration_minutes: service.duration_minutes,
                                            duration: typeof service.duration === 'string' ? parseInt(service.duration) : service.duration,
                                            category: service.category,
                                            tenant_name: service.tenant_name,
                                            has_promotion: service.is_currently_on_promotion || service.is_on_promotion,
                                            promotion_discount_percentage: service.promotion_discount_percentage,
                                            effective_price: service.promotion_price || service.effective_price,
                                            promotion_price: service.promotion_price,
                                            promotion_title: service.promotion_title,
                                            promotion_description: service.promotion_description,
                                            promotion_time_remaining: service.promotion_time_remaining,
                                            promotion_time_remaining_formatted: service.promotion_time_remaining_formatted,
                                            promotion_end_date: service.promotion_end_date,
                                            image_url: service.image_url || service.image || undefined,
                                            average_rating: service.average_rating,
                                            total_reviews: service.total_reviews
                                        }

                                        return (
                                            <div id={`service-${service.id}`} key={service.id}>
                                                <ServiceCard
                                                    service={serviceCardData}
                                                    isFavorite={isFavorite(Number(service.id))}
                                                    onToggleFavorite={toggleFavorite}
                                                    onBook={() => handleBookService(service.id)}
                                                    showBookButton={true}
                                                    showMoreActions={false}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                // Horizontal scroll for more than 3 items
                                <div className="overflow-x-auto overflow-y-visible py-4">
                                    <div className="flex space-x-8 px-4" style={{ width: 'max-content' }}>
                                        {promotionalServices.map((service: Service) => {
                                            // Convert service to match ServiceCard interface
                                            const serviceCardData = {
                                                id: Number(service.id),
                                                name: service.name,
                                                description: service.description,
                                                price: service.price,
                                                duration_minutes: service.duration_minutes,
                                                duration: typeof service.duration === 'string' ? parseInt(service.duration) : service.duration,
                                                category: service.category,
                                                tenant_name: service.tenant_name,
                                                has_promotion: service.is_currently_on_promotion || service.is_on_promotion,
                                                promotion_discount_percentage: service.promotion_discount_percentage,
                                                effective_price: service.promotion_price || service.effective_price,
                                                promotion_price: service.promotion_price,
                                                promotion_title: service.promotion_title,
                                                promotion_description: service.promotion_description,
                                                promotion_time_remaining: service.promotion_time_remaining,
                                                promotion_time_remaining_formatted: service.promotion_time_remaining_formatted,
                                                promotion_end_date: service.promotion_end_date,
                                                image_url: service.image_url || service.image || undefined,
                                                average_rating: service.average_rating,
                                                total_reviews: service.total_reviews
                                            }

                                            return (
                                                <div key={service.id} className="flex-shrink-0">
                                                    <ServiceCard
                                                        service={serviceCardData}
                                                        isFavorite={isFavorite(Number(service.id))}
                                                        onToggleFavorite={toggleFavorite}
                                                        onBook={() => handleBookService(service.id)}
                                                        showBookButton={true}
                                                        showMoreActions={false}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Services Section */}
            <div className="py-16 bg-white">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Partner Salons</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Discover professional beauty treatments from our trusted partner salons. Each salon offers unique services tailored to your needs.
                        </p>
                    </div>

                    {/* Tenant Services */}
                    <div className="space-y-16">
                        {tenantServices.map((tenant) => (
                            <div id={`tenant-${tenant.tenant_id}`} key={tenant.tenant_id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tenant.tenant_name}</h3>
                                    <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
                                </div>

                                {/* Services Carousel */}
                                <div className="relative">
                                    <div className="overflow-x-auto">
                                        <div className="flex space-x-6 pb-4" style={{ width: 'max-content' }}>
                                            {tenant.services.map((service: Service) => {
                                                // Convert service to match ServiceCard interface
                                                const serviceCardData = {
                                                    id: Number(service.id),
                                                    name: service.name,
                                                    description: service.description,
                                                    price: service.price,
                                                    duration_minutes: service.duration_minutes,
                                                    duration: typeof service.duration === 'string' ? parseInt(service.duration) : service.duration,
                                                    category: service.category,
                                                    tenant_name: service.tenant_name,
                                                    has_promotion: service.is_currently_on_promotion || service.is_on_promotion,
                                                    promotion_discount_percentage: service.promotion_discount_percentage,
                                                    effective_price: service.promotion_price || service.effective_price,
                                                    promotion_price: service.promotion_price,
                                                    promotion_title: service.promotion_title,
                                                    promotion_description: service.promotion_description,
                                                    promotion_time_remaining: service.promotion_time_remaining,
                                                    promotion_time_remaining_formatted: service.promotion_time_remaining_formatted,
                                                    image_url: service.image_url || service.image || undefined,
                                                    average_rating: service.average_rating,
                                                    total_reviews: service.total_reviews
                                                }

                                                return (
                                                    <div key={service.id} className="flex-shrink-0">
                                                        <ServiceCard
                                                            service={serviceCardData}
                                                            isFavorite={isFavorite(Number(service.id))}
                                                            onToggleFavorite={toggleFavorite}
                                                            onBook={() => handleBookService(service.id)}
                                                            showBookButton={true}
                                                            showMoreActions={false}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Scroll indicators */}
                                    <div className="flex justify-center mt-4 space-x-2">
                                        {tenant.services.map((_, index) => (
                                            <div key={index} className="w-2 h-2 bg-pink-300 rounded-full"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Partner Salons Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Partner Salons</h2>
                    <p className="text-gray-600">Discover services from our trusted salon partners</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenantServices.map((tenant) => (
                        <Card key={tenant.tenant_id} className="hover:shadow-lg transition-shadow bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                            <Scissors className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{tenant.tenant_name}</h3>
                                            <p className="text-sm text-gray-500">{tenant.total_services} services</p>
                                        </div>
                                    </div>
                                    {tenant.active_promotions > 0 && (
                                        <Badge variant="destructive" className="bg-red-500">
                                            {tenant.active_promotions} deals
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        // Scroll to the tenant's services section
                                        const element = document.getElementById(`tenant-${tenant.tenant_id}`)
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                        }
                                    }}
                                >
                                    View Services
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Book Your Appointment</h2>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="space-y-6">
                            {/* General Error */}
                            {validationErrors.general && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-700">{validationErrors.general}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Service</label>
                                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700">
                                    {selectedService.name} - R{selectedService.price}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingData.date}
                                        onChange={(e) => {
                                            setBookingData(prev => ({ ...prev, date: e.target.value, time: '' }))
                                            setValidationErrors(prev => ({ ...prev, date: '' }))
                                        }}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                            validationErrors.date ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                    {validationErrors.date && (
                                        <p className="text-xs text-red-600 mt-1">{validationErrors.date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Time <span className="text-red-500">*</span>
                                        {loadingSlots && <span className="ml-2 text-xs text-pink-600">Checking availability...</span>}
                                    </label>
                                    <select
                                        value={bookingData.time}
                                        onChange={(e) => {
                                            setBookingData(prev => ({ ...prev, time: e.target.value }))
                                            setValidationErrors(prev => ({ ...prev, time: '' }))
                                        }}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                            validationErrors.time ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                        disabled={!bookingData.date || loadingSlots}
                                    >
                                        <option value="">
                                            {!bookingData.date ? 'Select date first' : loadingSlots ? 'Loading slots...' : 'Select time'}
                                        </option>
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))
                                        ) : !loadingSlots && bookingData.date ? (
                                            <option value="" disabled>No slots available</option>
                                        ) : null}
                                    </select>
                                    {validationErrors.time && (
                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                            <XCircle className="h-3 w-3" />
                                            {validationErrors.time}
                                        </p>
                                    )}
                                    {availableSlots.length === 0 && !loadingSlots && bookingData.date && !validationErrors.time && (
                                        <p className="text-xs text-red-600 mt-1">No available time slots for this date. Please choose another date.</p>
                                    )}
                                </div>
                            </div>

                            {/* Staff Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Users className="inline h-4 w-4 mr-1" />
                                    Preferred Staff Member (Optional)
                                </label>
                                <Button
                                    type="button"
                                    onClick={() => setShowStaffModal(true)}
                                    variant="outline"
                                    className="w-full justify-start text-left"
                                >
                                    {bookingData.staff_id ? 'Staff Selected ✓' : 'Choose Staff Member (or skip for any available)'}
                                </Button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                                <textarea
                                    value={bookingData.message}
                                    onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Any special requests, allergies, or notes for your appointment..."
                                />
                            </div>

                            {/* Payment Method Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    <CreditCard className="inline h-4 w-4 mr-1" />
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => {
                                                setBookingData(prev => ({ ...prev, payment_method_id: method.id.toString() }))
                                                setValidationErrors(prev => ({ ...prev, payment_method: '' }))
                                            }}
                                            className={`p-4 border-2 rounded-xl transition-all text-left ${
                                                bookingData.payment_method_id === method.id.toString()
                                                    ? 'border-pink-500 bg-pink-50'
                                                    : validationErrors.payment_method
                                                    ? 'border-red-300 hover:border-red-400'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-lg"
                                                    style={{ backgroundColor: `${method.color}20` }}
                                                >
                                                    <CreditCard className="h-5 w-5" style={{ color: method.color || undefined }} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm">{method.name}</p>
                                                    {Number(method.processing_fee_percentage) > 0 && (
                                                        <p className="text-xs text-gray-500">+{method.processing_fee_percentage}% fee</p>
                                                    )}
                                                </div>
                                                {bookingData.payment_method_id === method.id.toString() && (
                                                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {validationErrors.payment_method && (
                                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        {validationErrors.payment_method}
                                    </p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Your Details</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4" />
                                        <span>{user?.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{user?.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isBooking}
                                    className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Staff Selection Modal */}
            {selectedService && (
                <StaffSelectionModal
                    service={{
                        id: Number(selectedService.id),
                        name: selectedService.name,
                        tenant_id: Number(selectedService.tenant_id)
                    }}
                    appointmentDate={bookingData.date}
                    appointmentTime={bookingData.time}
                    isOpen={showStaffModal}
                    onClose={() => setShowStaffModal(false)}
                    onSelectStaff={(staffId) => {
                        setBookingData(prev => ({ ...prev, staff_id: staffId }))
                    }}
                    selectedStaffId={bookingData.staff_id}
                />
            )}
        </div>
    )
}
