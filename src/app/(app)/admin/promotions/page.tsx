'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import ServiceCard from '@/components/shared/ServiceCard'
import { 
    Plus, 
    Tag, 
    Calendar, 
    Percent, 
    DollarSign, 
    Clock, 
    Edit, 
    Trash2,
    Sparkles,
    TrendingUp,
    AlertCircle
} from 'lucide-react'

interface Service {
    id: number
    name: string
    description: string
    price: number
    duration_minutes?: number
    category: string
    image_url?: string
    is_active?: boolean
    staff_required?: boolean
    booking_buffer_minutes?: number
    is_on_promotion: boolean
    promotion_title?: string
    promotion_description?: string
    promotion_price?: number
    promotion_discount_percentage?: number
    promotion_start_date?: string
    promotion_end_date?: string
}

interface PromotionFormData {
    service_id: number
    promotion_title: string
    promotion_description: string
    promotion_discount_percentage: number
    promotion_start_date: string
    promotion_end_date: string
}

export default function PromotionsPage() {
    const router = useRouter()
    const [services, setServices] = useState<Service[]>([])
    const [promotionalServices, setPromotionalServices] = useState<Service[]>([])
    const [nonPromotionalServices, setNonPromotionalServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPromotion, setEditingPromotion] = useState<Service | null>(null)
    const [formData, setFormData] = useState<PromotionFormData>({
        service_id: 0,
        promotion_title: '',
        promotion_description: '',
        promotion_discount_percentage: 10,
        promotion_start_date: '',
        promotion_end_date: ''
    })

    useEffect(() => {
        fetchServices()
    }, [])

    useEffect(() => {
        // Check if service ID is provided in URL params (only when services are loaded)
        if (services.length > 0) {
            const urlParams = new URLSearchParams(window.location.search)
            const serviceId = urlParams.get('service')
            if (serviceId) {
                const selectedService = services.find(s => s.id === parseInt(serviceId))
                if (selectedService && !selectedService.is_on_promotion) {
                    setFormData(prev => ({ ...prev, service_id: parseInt(serviceId) }))
                    setIsModalOpen(true)
                    // Clear URL parameter to prevent re-triggering
                    window.history.replaceState({}, '', '/admin/promotions')
                }
            }
        }
    }, [services])

    useEffect(() => {
        const promotional = services.filter(service => service.is_on_promotion)
        const nonPromotional = services.filter(service => !service.is_on_promotion)
        setPromotionalServices(promotional)
        setNonPromotionalServices(nonPromotional)
    }, [services])

    const fetchServices = async () => {
        try {
            const response = await axios.get('/api/services')
            console.log('Services API Response:', response.data)
            setServices(response.data.services || response.data.data || [])
        } catch (error) {
            console.error('Error fetching services:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddPromotion = (service?: Service) => {
        if (service) {
            setEditingPromotion(service)
            setFormData({
                service_id: service.id,
                promotion_title: service.promotion_title || '',
                promotion_description: service.promotion_description || '',
                promotion_discount_percentage: service.promotion_discount_percentage || 10,
                promotion_start_date: service.promotion_start_date ? service.promotion_start_date.split('T')[0] : '',
                promotion_end_date: service.promotion_end_date ? service.promotion_end_date.split('T')[0] : ''
            })
        } else {
            setEditingPromotion(null)
            setFormData({
                service_id: 0,
                promotion_title: '',
                promotion_description: '',
                promotion_discount_percentage: 10,
                promotion_start_date: '',
                promotion_end_date: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.service_id || !formData.promotion_title || !formData.promotion_start_date || !formData.promotion_end_date) {
            alert('Please fill in all required fields')
            return
        }

        try {
            const selectedService = services.find(s => s.id === formData.service_id)
            if (!selectedService) return

            const promotionPrice = selectedService.price * (1 - formData.promotion_discount_percentage / 100)

            const promotionData = {
                name: selectedService.name,
                description: selectedService.description,
                price: selectedService.price,
                duration_minutes: selectedService.duration_minutes,
                category: selectedService.category,
                is_active: selectedService.is_active,
                staff_required: selectedService.staff_required,
                booking_buffer_minutes: selectedService.booking_buffer_minutes,
                is_on_promotion: true,
                promotion_title: formData.promotion_title,
                promotion_description: formData.promotion_description,
                promotion_price: promotionPrice,
                promotion_discount_percentage: formData.promotion_discount_percentage,
                promotion_start_date: formData.promotion_start_date,
                promotion_end_date: formData.promotion_end_date
            }

            await axios.patch(`/api/services/${formData.service_id}`, promotionData)
            await fetchServices()
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error saving promotion:', error)
            alert('Failed to save promotion. Please try again.')
        }
    }

    const handleRemovePromotion = async (serviceId: number) => {
        if (!confirm('Are you sure you want to remove this promotion?')) {
            return
        }

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
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const isPromotionActive = (startDate: string, endDate: string) => {
        const now = new Date()
        const start = new Date(startDate)
        const end = new Date(endDate)
        return now >= start && now <= end
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Promotions Management</h1>
                    <p className="text-gray-600 mt-2">Manage promotional offers for your services</p>
                </div>
                <Button
                    onClick={() => handleAddPromotion()}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Promotion
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
                        <Sparkles className="h-4 w-4 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{promotionalServices.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {promotionalServices.length === 1 ? 'service' : 'services'} on promotion
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Services</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{nonPromotionalServices.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {nonPromotionalServices.length === 1 ? 'service' : 'services'} available for promotion
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                        <Tag className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{services.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Total services in your salon
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Promotions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-pink-600" />
                        Active Promotions
                    </CardTitle>
                    <CardDescription>
                        Services currently on promotional offer
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {promotionalServices.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Promotions</h3>
                            <p className="text-gray-600 mb-4">Start attracting more customers by creating promotional offers.</p>
                            <Button onClick={() => handleAddPromotion()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Promotion
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {promotionalServices.map((service) => {
                                const serviceCardData = {
                                    id: service.id,
                                    name: service.name,
                                    description: service.description,
                                    price: service.price,
                                    duration_minutes: service.duration_minutes || 0,
                                    duration: service.duration_minutes || 0,
                                    category: service.category,
                                    tenant_name: 'Your Salon',
                                    tenant_id: service.id,
                                    has_promotion: true,
                                    is_on_promotion: true,
                                    promotion_discount_percentage: service.promotion_discount_percentage,
                                    effective_price: service.promotion_price,
                                    promotion_price: service.promotion_price,
                                    promotion_title: service.promotion_title,
                                    promotion_description: service.promotion_description,
                                    promotion_end_date: service.promotion_end_date,
                                    image_url: service.image_url
                                }
                                
                                return (
                                    <ServiceCard
                                        key={service.id}
                                        service={serviceCardData}
                                        isFavorite={false}
                                        onToggleFavorite={() => {}}
                                        showBookButton={false}
                                        showMoreActions={true}
                                        onEdit={() => handleAddPromotion(service)}
                                        onDelete={() => handleRemovePromotion(service.id)}
                                    />
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available Services for Promotion */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Available for Promotion
                    </CardTitle>
                    <CardDescription>
                        Services that can be added to promotional offers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {nonPromotionalServices.length === 0 ? (
                        <div className="text-center py-8">
                            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">All Services on Promotion</h3>
                            <p className="text-gray-600">All your services are currently on promotional offers.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {nonPromotionalServices.map((service) => {
                                const serviceCardData = {
                                    id: service.id,
                                    name: service.name,
                                    description: service.description,
                                    price: service.price,
                                    duration_minutes: service.duration_minutes || 0,
                                    duration: service.duration_minutes || 0,
                                    category: service.category,
                                    tenant_name: 'Your Salon',
                                    tenant_id: service.id,
                                    has_promotion: false,
                                    is_on_promotion: false,
                                    promotion_discount_percentage: undefined,
                                    effective_price: service.price,
                                    promotion_price: undefined,
                                    promotion_title: undefined,
                                    promotion_description: undefined,
                                    image_url: service.image_url
                                }
                                
                                return (
                                    <ServiceCard
                                        key={service.id}
                                        service={serviceCardData}
                                        isFavorite={false}
                                        onToggleFavorite={() => {}}
                                        showBookButton={false}
                                        showMoreActions={true}
                                        onTogglePromotion={() => {
                                            setFormData(prev => ({ ...prev, service_id: service.id }))
                                            handleAddPromotion()
                                        }}
                                    />
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Promotion Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPromotion 
                                ? 'Update the promotional details for this service.'
                                : 'Create a new promotional offer to attract more customers.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editingPromotion && (
                            <div>
                                <Label htmlFor="service_id">Select Service *</Label>
                                <Select 
                                    value={formData.service_id.toString()} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: parseInt(value) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {nonPromotionalServices.map((service) => (
                                            <SelectItem key={service.id} value={service.id.toString()}>
                                                {service.name} - {formatPrice(service.price)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="promotion_title">Promotion Title *</Label>
                            <Input
                                id="promotion_title"
                                value={formData.promotion_title}
                                onChange={(e) => setFormData(prev => ({ ...prev, promotion_title: e.target.value }))}
                                placeholder="e.g., Summer Special, New Year Offer"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="promotion_description">Description</Label>
                            <Textarea
                                id="promotion_description"
                                value={formData.promotion_description}
                                onChange={(e) => setFormData(prev => ({ ...prev, promotion_description: e.target.value }))}
                                placeholder="Describe your promotional offer..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="promotion_discount_percentage">Discount Percentage *</Label>
                            <div className="relative">
                                <Input
                                    id="promotion_discount_percentage"
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={formData.promotion_discount_percentage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, promotion_discount_percentage: parseInt(e.target.value) }))}
                                    className="pr-8"
                                    required
                                />
                                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="promotion_start_date">Start Date *</Label>
                                <Input
                                    id="promotion_start_date"
                                    type="date"
                                    value={formData.promotion_start_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, promotion_start_date: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="promotion_end_date">End Date *</Label>
                                <Input
                                    id="promotion_end_date"
                                    type="date"
                                    value={formData.promotion_end_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, promotion_end_date: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {formData.service_id > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Promotion Preview</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Original Price:</span>
                                        <span className="line-through">
                                            {formatPrice(services.find(s => s.id === formData.service_id)?.price || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Promotional Price:</span>
                                        <span className="font-bold text-pink-600">
                                            {formatPrice((services.find(s => s.id === formData.service_id)?.price || 0) * (1 - formData.promotion_discount_percentage / 100))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Customer Saves:</span>
                                        <span className="font-bold text-green-600">
                                            {formatPrice((services.find(s => s.id === formData.service_id)?.price || 0) * (formData.promotion_discount_percentage / 100))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600">
                                {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
