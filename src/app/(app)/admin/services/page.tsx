'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Calendar,
    Star,
    X,
    Users,
    Mail,
    Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/auth'
import { useFavorites } from '@/hooks/useFavorites'
import ServiceCard from '@/components/shared/ServiceCard'
import axios from '@/lib/axios'

interface Service {
    id: number
    name: string
    description: string
    price: number
    duration_minutes: number
    category: string
    image: string | null
    image_url?: string
    is_active: boolean
    staff_required: boolean
    booking_buffer_minutes: number
    tenant_id: number
    is_on_promotion?: boolean
    promotion_price?: number
    promotion_discount_percentage?: number
    promotion_title?: string
    promotion_description?: string
    promotion_end_date?: string
}

export default function ServicesPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const [services, setServices] = useState<Service[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('name')
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [bookingData, setBookingData] = useState({
        date: '',
        time: '',
        message: ''
    })
    const [isBooking, setIsBooking] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        category: '',
        is_active: true,
        staff_required: false,
        booking_buffer_minutes: '0',
        image: null as File | null
    })
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Check if user is admin/manager (can manage services) or customer (can only view/book)
    const canManageServices = user?.permissions?.includes('manage services') ||
                             user?.roles?.some(role => ['Admin', 'Owner', 'Manager'].includes(role))
    const isCustomer = user?.roles?.includes('Customer')

    useEffect(() => {
        fetchServices()
        fetchCategories()
    }, [])

    const fetchServices = async () => {
        try {
            // Use public endpoint for customers, admin endpoint for managers
            const endpoint = canManageServices ? '/api/services' : '/api/public/services'
            const response = await axios.get(endpoint)
            console.log('Services API Response:', response.data)
            setServices(response.data.services || response.data.data || [])
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

    const handleBookService = async (serviceId: number) => {
        try {
            const service = services.find(s => s.id === serviceId)
            if (service) {
                setSelectedService(service)
                setShowBookingModal(true)
                setBookingData({ date: '', time: '', message: '' })
            }
        } catch (error) {
            console.error('Error initiating booking:', error)
        }
    }

    const handleEditService = (service: any) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            description: service.description,
            price: service.price,
            duration_minutes: service.duration_minutes,
            category: service.category,
            is_active: service.is_active,
            staff_required: service.staff_required,
            booking_buffer_minutes: service.booking_buffer_minutes,
            image: null
        })
        setImagePreview(service.image_url || null)
        setIsModalOpen(true)
    }

    const handleDeleteService = async (serviceId: number) => {
        if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            return
        }

        try {
            await axios.delete(`/api/services/${serviceId}`)
            await fetchServices()
        } catch (error) {
            console.error('Error deleting service:', error)
            alert('Failed to delete service. Please try again.')
        }
    }

    const handleTogglePromotion = async (serviceId: number) => {
        const service = services.find(s => s.id === serviceId)
        if (!service) return

        if (service.is_on_promotion) {
            // Remove promotion
            try {
                await axios.patch(`/api/services/${serviceId}`, {
                    is_on_promotion: false,
                    promotion_price: null,
                    promotion_discount_percentage: null,
                    promotion_title: null,
                    promotion_description: null,
                    promotion_start_date: null,
                    promotion_end_date: null
                })
                await fetchServices()
            } catch (error) {
                console.error('Error removing promotion:', error)
                alert('Failed to remove promotion. Please try again.')
            }
        } else {
            // Redirect to promotions page with service pre-selected
            router.push(`/admin/promotions?service=${serviceId}`)
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

        if (!selectedService || !bookingData.date || !bookingData.time) {
            return
        }

        try {
            setIsBooking(true)
            const response = await axios.post('/api/customer/booking', {
                service_id: selectedService.id,
                tenant_id: selectedService.tenant_id,
                appointment_date: bookingData.date,
                appointment_time: bookingData.time,
                notes: bookingData.message
            })

            if (response.data.success) {
                setShowBookingModal(false)
                alert('Booking confirmed successfully!')
                router.push('/appointments')
            }
        } catch (error: any) {
            console.error('Booking error:', error)
            alert('Failed to create booking. Please try again.')
        } finally {
            setIsBooking(false)
        }
    }

    const filteredAndSortedServices = services
        .filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                service.description?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
            return matchesSearch && matchesCategory
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price
                case 'price-high':
                    return b.price - a.price
                case 'duration':
                    return a.duration_minutes - b.duration_minutes
                case 'name':
                default:
                    return a.name.localeCompare(b.name)
            }
        })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
        }
        return `${mins}m`
    }

    // Admin service management functions
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const data = new FormData()
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'image' && value) {
                    data.append(key, value as File)
                } else if (key === 'is_active' || key === 'staff_required') {
                    // Convert boolean to string for FormData, backend will handle conversion
                    data.append(key, (value as boolean) ? '1' : '0')
                } else if (value !== null && value !== undefined) {
                    data.append(key, value.toString())
                }
            })

            if (editingService) {
                // Use PUT for updates with _method override for multipart forms
                data.append('_method', 'PUT')
                await axios.post(`/api/services/${editingService.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            } else {
                await axios.post('/api/services', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }

            setIsModalOpen(false)
            setEditingService(null)
            resetForm()
            fetchServices()
        } catch (error) {
            console.error('Error saving service:', error)
        }
    }

    const handleEdit = (service: Service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration_minutes: service.duration_minutes.toString(),
            category: service.category,
            is_active: service.is_active,
            staff_required: service.staff_required,
            booking_buffer_minutes: service.booking_buffer_minutes.toString(),
            image: null
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (serviceId: number) => {
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await axios.delete(`/api/services/${serviceId}`)
                fetchServices()
            } catch (error) {
                console.error('Error deleting service:', error)
            }
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration_minutes: '',
            category: '',
            is_active: true,
            staff_required: false,
            booking_buffer_minutes: '0',
            image: null
        })
        setImagePreview(null)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData({...formData, image: file})
            // Create preview URL
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setFormData({...formData, image: null})
            setImagePreview(null)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

    // Customer view - show guest-like services experience within app layout
    if (isCustomer || !canManageServices) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center mb-6">
                        <Star className="h-8 w-8 text-pink-500 mr-3" />
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Our Services
                        </h1>
                        <Star className="h-8 w-8 text-pink-500 ml-3" />
                    </div>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Welcome back, {user?.name}! Discover our premium beauty services and book your next appointment.
                    </p>

                    {/* Search and Filter */}
                    <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Services Grid - Customer View */}
                {filteredAndSortedServices.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Search className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAndSortedServices.map((service) => {
                            const serviceCardData = {
                                id: service.id,
                                name: service.name,
                                description: service.description,
                                price: service.price,
                                duration_minutes: service.duration_minutes,
                                duration: service.duration_minutes,
                                category: service.category,
                                tenant_name: 'Your Salon',
                                tenant_id: service.tenant_id,
                                has_promotion: false,
                                promotion_discount_percentage: undefined,
                                effective_price: service.price,
                                promotion_price: undefined,
                                promotion_title: undefined,
                                promotion_description: undefined,
                                promotion_time_remaining: undefined,
                                promotion_time_remaining_formatted: undefined,
                                image_url: service.image || undefined,
                                is_active: service.is_active,
                                staff_required: service.staff_required,
                                booking_buffer_minutes: service.booking_buffer_minutes
                            }
                            
                            return (
                                <ServiceCard
                                    key={service.id}
                                    service={serviceCardData}
                                    isFavorite={false}
                                    onToggleFavorite={() => {}}
                                    onBook={() => handleBookService(service.id)}
                                    showBookButton={true}
                                />
                            )
                        })}
                    </div>
                )}

                {/* Call to Action */}
                <div className="mt-16 text-center bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Book Your Appointment?</h2>
                    <p className="text-lg mb-6 opacity-90">
                        Our professional team is here to provide you with exceptional service and care.
                    </p>
                    <Button
                        onClick={() => router.push('/booking-confirmation')}
                        variant="secondary"
                        size="lg"
                        className="bg-white text-pink-600 hover:bg-gray-100 font-semibold px-8 py-3"
                    >
                        Book an Appointment
                    </Button>
                </div>
            </div>
        )
    }


    // Admin Management View
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
                    <p className="text-gray-600 mt-2">Manage your salon's services and offerings</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingService(null)
                        resetForm()
                        setIsModalOpen(true)
                    }}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                                <SelectItem value="duration">Duration</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Services Grid */}
            {filteredAndSortedServices.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Search className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedServices.map((service) => {
                        const serviceCardData = {
                            id: service.id,
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            duration_minutes: service.duration_minutes,
                            duration: service.duration_minutes,
                            category: service.category,
                            tenant_name: 'Your Salon',
                            tenant_id: service.tenant_id,
                            has_promotion: service.is_on_promotion || false,
                            promotion_discount_percentage: service.promotion_discount_percentage,
                            effective_price: service.is_on_promotion ? service.promotion_price : service.price,
                            promotion_price: service.promotion_price,
                            promotion_title: service.promotion_title,
                            promotion_description: service.promotion_description,
                            promotion_end_date: service.promotion_end_date,
                            promotion_time_remaining: undefined,
                            promotion_time_remaining_formatted: undefined,
                            image_url: service.image_url || undefined,
                            is_active: service.is_active,
                            staff_required: service.staff_required,
                            booking_buffer_minutes: service.booking_buffer_minutes,
                            average_rating: service.average_rating,
                            total_reviews: service.total_reviews
                        }
                        
                        return (
                            <ServiceCard
                                key={service.id}
                                service={serviceCardData}
                                isFavorite={false}
                                onToggleFavorite={() => {}}
                                onBook={() => {}}
                                showBookButton={false}
                                showMoreActions={true}
                                onEdit={handleEditService}
                                onDelete={handleDeleteService}
                                onTogglePromotion={canManageServices ? handleTogglePromotion : undefined}
                            />
                        )
                    })}
                </div>
            )}

            {/* Service Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingService
                                ? 'Update the service details below.'
                                : 'Fill in the details to create a new service.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Service Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g., Hair Cut & Style"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    placeholder="e.g., Hair Services"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Describe the service..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Price ($)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                                <Input
                                    type="number"
                                    min="15"
                                    step="15"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                                    placeholder="60"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Buffer Time (minutes)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="5"
                                    value={formData.booking_buffer_minutes}
                                    onChange={(e) => setFormData({...formData, booking_buffer_minutes: e.target.value})}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Service Image</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <div className="mt-3 flex flex-col items-center">
                                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                    <img 
                                        src={imagePreview} 
                                        alt="Service preview" 
                                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    className="mr-2"
                                />
                                Active Service
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.staff_required}
                                    onChange={(e) => setFormData({...formData, staff_required: e.target.checked})}
                                    className="mr-2"
                                />
                                Staff Required
                            </label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {editingService ? 'Update Service' : 'Create Service'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Service</label>
                                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700">
                                    {selectedService.name} - R{selectedService.price}
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
                                        {generateTimeSlots().map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
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
        </div>
    )
}
