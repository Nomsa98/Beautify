'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Star, Phone, MapPin, Scissors, Sparkles, Search, CreditCard } from 'lucide-react'
import SearchComponent from '@/components/shared/SearchComponent'
import PromotionCountdown from '@/components/PromotionCountdown'
import ServiceCard from '@/components/shared/ServiceCard'
import { useGuest, type Service, type BookingData } from '@/hooks/useGuest'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'

interface TenantServices {
    tenant_id: string
    tenant_name: string
    services: Service[]
}

const Home = () => {
    const { getServices, submitBooking, getAvailableSlots, loading: guestLoading, error: guestError } = useGuest()
    const { paymentMethods, loading: loadingPaymentMethods } = usePaymentMethods()
    
    const [showBookingForm, setShowBookingForm] = useState(false)
    const [services, setServices] = useState<Service[]>([])
    const [tenantServices, setTenantServices] = useState<TenantServices[]>([])
    const [promotionalServices, setPromotionalServices] = useState<Service[]>([])
    const [showSearch, setShowSearch] = useState(false)
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [bookingData, setBookingData] = useState<BookingData>({
        name: '',
        email: '',
        phone: '',
        service: '',
        service_id: '',
        tenant_id: '',
        date: '',
        time: '',
        message: '',
        payment_method_id: ''
    })

    // Fetch services from all tenants on component mount
    useEffect(() => {
        fetchServices()

        // Add keyboard shortcut for search (Cmd+K or Ctrl+K)
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault()
                setShowSearch(true)
            }
            // ESC to close search
            if (event.key === 'Escape' && showSearch) {
                setShowSearch(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [showSearch])

    // Fetch available slots when date and tenant change
    useEffect(() => {
        if (bookingData.date && bookingData.tenant_id) {
            fetchAvailableSlots(bookingData.date, bookingData.tenant_id)
        }
    }, [bookingData.date, bookingData.tenant_id])

    const fetchServices = async () => {
        try {
            const data = await getServices()
            
            // Backend returns services grouped by category, flatten them into an array
            const servicesGrouped = data.services || {}
            const flatServices: Service[] = []
            
            Object.values(servicesGrouped).forEach((categoryServices: any) => {
                if (Array.isArray(categoryServices)) {
                    flatServices.push(...categoryServices)
                }
            })
            
            setServices(flatServices)
            
            // Group services by tenant
            const grouped = flatServices.reduce((acc: { [key: string]: TenantServices }, service: Service) => {
                if (!acc[service.tenant_id]) {
                    acc[service.tenant_id] = {
                        tenant_id: service.tenant_id,
                        tenant_name: service.tenant_name,
                        services: []
                    }
                }
                acc[service.tenant_id].services.push(service)
                return acc
            }, {})

            // Filter promotional services
            const promotional = flatServices.filter(service => service.is_currently_on_promotion)

            setTenantServices(Object.values(grouped))
            setPromotionalServices(promotional)
        } catch (error) {
            console.error('Failed to fetch services:', error)
        }
    }

    const fetchAvailableSlots = async (date: string, tenantId: string) => {
        if (!date || !tenantId) return
        
        setLoadingSlots(true)
        try {
            const data = await getAvailableSlots(date, tenantId)
            setAvailableSlots(data.available_slots || [])
        } catch (error) {
            console.error('Failed to fetch available slots:', error)
            setAvailableSlots([])
        } finally {
            setLoadingSlots(false)
        }
    }

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
    ]

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!bookingData.payment_method_id) {
            alert('Please select a payment method')
            return
        }
        
        try {
            const data = await submitBooking(bookingData)
            
            console.log('Booking response:', data)
            
            // Check if this is a card payment that needs redirect
            if (data.success && data.payment_method === 'card' && data.authorization_url) {
                // Redirect to Paystack for card payment
                console.log('Redirecting to Paystack:', data.authorization_url)
                window.location.href = data.authorization_url
            } else {
                // Cash payment or booking created - go to confirmation
                const bookingRef = data.booking_reference || `BK${Date.now().toString().slice(-6)}`
                window.location.href = `/booking-confirmation?ref=${bookingRef}`
            }
        } catch (error) {
            console.error('Booking error:', error)
            alert(guestError || 'Failed to submit booking. Please try again.')
        }
    }

    const handleServiceSelect = (service: Service | any) => {
        setBookingData(prev => ({
            ...prev,
            service: service.name,
            service_id: service.id,
            tenant_id: service.tenant_id
        }))
        setShowSearch(false)
        setShowBookingForm(true)
    }

    return (
        <>
            {/* Search Component */}
            {showSearch && (
                <SearchComponent
                    onServiceSelect={handleServiceSelect}
                    onClose={() => setShowSearch(false)}
                />
            )}
            
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
                {/* Navigation */}
                <nav className="bg-white shadow-sm border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">BS</span>
                                    </div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                        Beauty Salon Network
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowSearch(true)}
                                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <Search className="h-4 w-4" />
                                    <span className="font-medium">Search</span>
                                    <span className="hidden sm:inline text-xs bg-white/20 px-2 py-0.5 rounded">⌘K</span>
                                </button>
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => window.location.href = '/login'}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        Login
                                    </button>
                                    <button 
                                        onClick={() => window.location.href = '/register'}
                                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center">
                            <div className="flex justify-center items-center mb-6">
                                <Sparkles className="h-12 w-12 text-pink-500 mr-3" />
                                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                                    Beauty Salon
                                </h1>
                                <Sparkles className="h-12 w-12 text-pink-500 ml-3" />
                            </div>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                Transform your look with our premium beauty services. Professional stylists, 
                                relaxing atmosphere, and exceptional results.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => setShowBookingForm(true)}
                                    className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                                >
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Book Appointment
                                </button>
                                <a 
                                    href="#services" 
                                    className="border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    View Services
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Promotional Services Section */}
                {promotionalServices.length > 0 && (
                    <div className="py-16 bg-gradient-to-r from-red-50 to-pink-50">
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
                                            const serviceCardData = {
                                                id: parseInt(service.id),
                                                name: service.name,
                                                description: service.description,
                                                price: service.price,
                                                duration: parseInt(service.duration) || 0,
                                                category: service.category,
                                                tenant_name: service.tenant_name,
                                                has_promotion: service.is_currently_on_promotion,
                                                promotion_discount_percentage: service.promotion_discount_percentage || undefined,
                                                effective_price: service.effective_price,
                                                promotion_price: service.promotion_price || undefined,
                                                promotion_title: service.promotion_title || undefined,
                                                promotion_description: service.promotion_description || undefined,
                                                promotion_time_remaining: service.promotion_time_remaining || undefined,
                                                promotion_time_remaining_formatted: service.promotion_time_remaining_formatted || undefined,
                                                promotion_end_date: service.promotion_end_date || undefined,
                                                image_url: service.image_url,
                                                average_rating: service.average_rating,
                                                total_reviews: service.total_reviews
                                            }
                                            
                                            return (
                                                <ServiceCard
                                                    key={service.id}
                                                    service={serviceCardData}
                                                    isFavorite={false}
                                                    onToggleFavorite={(serviceId: number) => {}}
                                                    onBook={() => {
                                                        setBookingData(prev => ({ 
                                                            ...prev, 
                                                            service: service.name,
                                                            service_id: service.id,
                                                            tenant_id: service.tenant_id
                                                        }))
                                                        setShowBookingForm(true)
                                                    }}
                                                    showBookButton={true}
                                                    showMoreActions={false}
                                                    className="transform hover:scale-105 transition-all duration-300 hover:z-10 border-2 border-red-300 ring-4 ring-red-100"
                                                />
                                            )
                                        })}
                                    </div>
                                ) : (
                                    // Horizontal scroll for more than 3 items
                                    <div className="overflow-x-auto overflow-y-visible py-4">
                                        <div className="flex space-x-6 px-4" style={{ width: 'max-content' }}>
                                            {promotionalServices.map((service: Service) => {
                                                const serviceCardData = {
                                                    id: parseInt(service.id),
                                                    name: service.name,
                                                    description: service.description,
                                                    price: service.price,
                                                    duration: parseInt(service.duration) || 0,
                                                    category: service.category,
                                                    tenant_name: service.tenant_name,
                                                    has_promotion: service.is_currently_on_promotion,
                                                    promotion_discount_percentage: service.promotion_discount_percentage || undefined,
                                                    effective_price: service.effective_price,
                                                    promotion_price: service.promotion_price || undefined,
                                                    promotion_title: service.promotion_title || undefined,
                                                    promotion_description: service.promotion_description || undefined,
                                                    promotion_time_remaining: service.promotion_time_remaining || undefined,
                                                    promotion_time_remaining_formatted: service.promotion_time_remaining_formatted || undefined,
                                                    promotion_end_date: service.promotion_end_date || undefined,
                                                    image_url: service.image_url
                                                }
                                                
                                                return (
                                                    <ServiceCard
                                                        key={service.id}
                                                        service={serviceCardData}
                                                        isFavorite={false}
                                                        onToggleFavorite={(serviceId: number) => {}}
                                                        onBook={() => {
                                                            setBookingData(prev => ({ 
                                                                ...prev, 
                                                                service: service.name,
                                                                service_id: service.id,
                                                                tenant_id: service.tenant_id
                                                            }))
                                                            setShowBookingForm(true)
                                                        }}
                                                        showBookButton={true}
                                                        showMoreActions={false}
                                                        className="flex-shrink-0 w-80 transform hover:scale-105 transition-all duration-300 hover:z-10 border-2 border-red-300 ring-4 ring-red-100"
                                                    />
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
                <div id="services" className="py-16 bg-white">
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
                                <div key={tenant.tenant_id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tenant.tenant_name}</h3>
                                        <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
                                    </div>
                                    
                                    {/* Services Carousel */}
                                    <div className="relative">
                                        <div className="overflow-x-auto">
                                            <div className="flex space-x-4 pb-4" style={{ width: 'max-content' }}>
                                                {tenant.services.map((service: Service) => {
                                                    const serviceCardData = {
                                                        id: parseInt(service.id),
                                                        name: service.name,
                                                        description: service.description,
                                                        price: service.price,
                                                        duration: parseInt(service.duration) || 0,
                                                        category: service.category,
                                                        tenant_name: service.tenant_name,
                                                        has_promotion: service.is_currently_on_promotion,
                                                        promotion_discount_percentage: service.promotion_discount_percentage || undefined,
                                                        effective_price: service.effective_price,
                                                        promotion_price: service.promotion_price || undefined,
                                                        promotion_title: service.promotion_title || undefined,
                                                        promotion_description: service.promotion_description || undefined,
                                                        promotion_time_remaining: service.promotion_time_remaining || undefined,
                                                        promotion_time_remaining_formatted: service.promotion_time_remaining_formatted || undefined,
                                                        promotion_end_date: service.promotion_end_date || undefined,
                                                        image_url: service.image_url,
                                                        average_rating: service.average_rating,
                                                        total_reviews: service.total_reviews
                                                    }
                                                    
                                                    return (
                                                        <ServiceCard
                                                            key={service.id}
                                                            service={serviceCardData}
                                                            isFavorite={false}
                                                            onToggleFavorite={(serviceId: number) => {}}
                                                            onBook={() => {
                                                                setBookingData(prev => ({ 
                                                                    ...prev, 
                                                                    service: service.name,
                                                                    service_id: service.id,
                                                                    tenant_id: service.tenant_id
                                                                }))
                                                                setShowBookingForm(true)
                                                            }}
                                                            showBookButton={true}
                                                            showMoreActions={false}
                                                            className={`flex-shrink-0 w-72 ${service.is_currently_on_promotion ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'}`}
                                                        />
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

                {/* Platform Info */}
                <div className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Our Platform</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Connecting you with premium beauty salons across the network. 
                                Book appointments with trusted professionals in your area.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="flex flex-col items-center">
                                <MapPin className="h-12 w-12 text-pink-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Platform Coverage</h3>
                                <p className="text-gray-600">Nationwide Network<br />Multiple Cities & Locations</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <Phone className="h-12 w-12 text-pink-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Support</h3>
                                <p className="text-gray-600">+27 11 123 4567<br />support@beautysalonnetwork.com</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <Clock className="h-12 w-12 text-pink-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Platform Hours</h3>
                                <p className="text-gray-600">24/7 Online Booking<br />Support: Mon-Fri 8AM-8PM<br />Weekend: 9AM-5PM</p>
                            </div>
                        </div>

                        {/* Additional Platform Features */}
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <span className="text-pink-600 font-bold text-xl">🏪</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Partner Salons</h4>
                                <p className="text-sm text-gray-600">Verified professional salons across the network</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <span className="text-purple-600 font-bold text-xl">💳</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Secure Payments</h4>
                                <p className="text-sm text-gray-600">Safe and secure online payment processing</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <span className="text-green-600 font-bold text-xl">⭐</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Quality Assured</h4>
                                <p className="text-sm text-gray-600">All salons meet our quality standards</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <span className="text-blue-600 font-bold text-xl">📱</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Easy Booking</h4>
                                <p className="text-sm text-gray-600">Simple online booking system</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                {showBookingForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Book Your Appointment</h2>
                                <button
                                    onClick={() => setShowBookingForm(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleBookingSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={bookingData.name}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={bookingData.phone}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={bookingData.email}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Selected Service</label>
                                    <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700">
                                        {bookingData.service || "No service selected"}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                                        <input
                                            type="date"
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                                        <select
                                            value={bookingData.time}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select time</option>
                                            {loadingSlots ? (
                                                <option disabled>Loading available slots...</option>
                                            ) : availableSlots.length > 0 ? (
                                                availableSlots.map(slot => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))
                                            ) : (
                                                timeSlots.map(slot => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))
                                            )}
                                        </select>
                                    </div>
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
                                        Payment Method *
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setBookingData(prev => ({ ...prev, payment_method_id: method.id.toString() }))}
                                                className={`p-4 border-2 rounded-xl transition-all text-left ${
                                                    bookingData.payment_method_id === method.id.toString()
                                                        ? 'border-pink-500 bg-pink-50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="p-2 rounded-lg"
                                                        style={{ backgroundColor: `${method.color}20` }}
                                                    >
                                                        <CreditCard className="h-5 w-5" style={{ color: method.color }} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900 text-sm">{method.name}</p>
                                                        {method.processing_fee_percentage > 0 && (
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
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingForm(false)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={guestLoading}
                                        className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {guestLoading ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Home
