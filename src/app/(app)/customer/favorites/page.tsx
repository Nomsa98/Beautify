'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Heart, Search, Filter, Trash2, Star } from 'lucide-react'
import ServiceCard from '@/components/shared/ServiceCard'
import { useAuth } from '@/hooks/auth'
import { useFavorites } from '@/hooks/useFavorites'
import axios from '@/lib/axios'
import { useRouter } from 'next/navigation'
import RoleBasedRoute from '@/components/RoleBasedRoute'

interface FavoriteService {
    id: number
    name: string
    description: string
    price: string | number
    effective_price?: string | number
    promotion_price?: string | number
    promotion_discount_percentage?: number
    duration_minutes?: number
    duration?: number
    category: string
    tenant_name: string
    has_promotion?: boolean
    image_url?: string
    promotion_end_date?: string
    promotion_description?: string
}

function FavoritesPageContent() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const { favoriteServices, favorites, toggleFavorite, isFavorite, clearAllFavorites, loading: favoritesLoading } = useFavorites()
    const [services, setServices] = useState<FavoriteService[]>([])
    const [filteredServices, setFilteredServices] = useState<FavoriteService[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [categories, setCategories] = useState<string[]>([])

    useEffect(() => {
        fetchCategories()
        // We'll use the services from favorites instead of fetching all services
        if (!favoritesLoading && favorites.length > 0) {
            const favoriteServicesList = favorites.map(fav => ({
                id: fav.service.id,
                name: fav.service.name,
                description: fav.service.description,
                price: fav.service.price,
                effective_price: fav.service.promotion_price || fav.service.price,
                promotion_price: fav.service.promotion_price,
                duration_minutes: fav.service.duration_minutes,
                duration: fav.service.duration_minutes?.toString(),
                category: fav.service.category,
                image: fav.service.image_url,
                image_url: fav.service.image_url,
                is_active: fav.service.is_active,
                staff_required: fav.service.staff_required,
                booking_buffer_minutes: fav.service.booking_buffer_minutes,
                tenant_id: fav.service.tenant_id,
                tenant_name: fav.service.tenant.name,
                has_promotion: fav.service.is_on_promotion,
                promotion_discount_percentage: fav.service.promotion_discount_percentage,
                promotion_start_date: fav.service.promotion_start_date,
                promotion_end_date: fav.service.promotion_end_date,
                promotion_title: fav.service.promotion_title,
                promotion_description: fav.service.promotion_description,
                promotion_time_remaining: fav.service.promotion_time_remaining,
                promotion_time_remaining_formatted: fav.service.promotion_time_remaining_formatted
            }))
            console.log('Setting services from favorites:', favoriteServicesList)
            setServices(favoriteServicesList)
            setLoading(false)
        } else if (!favoritesLoading && favorites.length === 0) {
            setServices([])
            setLoading(false)
        }
    }, [favorites, favoritesLoading])

    useEffect(() => {
        filterServices()
    }, [services, favoriteServices, searchTerm, selectedCategory])


    const fetchAllServices = async () => {
        try {
            // Try authenticated endpoint first
            let response = await axios.get('/api/public/services')
            
            let servicesData = response.data.data || response.data || []
            
            // Ensure we always have an array
            if (!Array.isArray(servicesData)) {
                console.warn('Services data is not an array, converting:', servicesData)
                servicesData = []
            }
            
            console.log('Fetched services:', servicesData.length, servicesData)
            setServices(servicesData)
        } catch (error) {
            console.error('Error fetching services:', error)
            setServices([]) // Ensure services is always an array
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

    const filterServices = () => {
        console.log('Filtering services:', {
            totalServices: Array.isArray(services) ? services.length : 'NOT_ARRAY',
            servicesType: typeof services,
            services,
            favoriteServices,
            searchTerm,
            selectedCategory
        })
        
        // Ensure services is an array before filtering
        if (!Array.isArray(services)) {
            console.error('Services is not an array:', services)
            setFilteredServices([])
            return
        }
        
        // Since services now comes from favorites, all services are already favorites
        // Just filter by search and category
        let filtered = services
        
        console.log('All services are favorites:', filtered.length)

        if (searchTerm) {
            filtered = filtered.filter(service =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(service => service.category === selectedCategory)
        }

        console.log('Final filtered services:', filtered)
        setFilteredServices(filtered)
    }


    const handleBookService = (service: FavoriteService | any) => {
        router.push(`/customer/services-marketplace?service=${service.id}`)
    }

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(numPrice);
    }

    if (loading || favoritesLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            My Favorite Services ❤️
                        </h1>
                        <p className="text-gray-600">
                            Your personal collection of favorite beauty services
                        </p>
                    </div>
                    {favoriteServices.length > 0 && (
                        <Button 
                            variant="outline" 
                            onClick={clearAllFavorites}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-pink-600">Total Favorites</p>
                                    <p className="text-2xl font-bold text-pink-700">{favoriteServices.length}</p>
                                </div>
                                <Heart className="h-8 w-8 text-pink-500 fill-current" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Categories</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {new Set(filteredServices.map(s => s.category)).size}
                                    </p>
                                </div>
                                <Filter className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">With Promotions</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {filteredServices.filter(s => s.has_promotion).length}
                                    </p>
                                </div>
                                <Star className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search favorite services..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setSearchTerm('')
                                    setSelectedCategory('all')
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {favoriteServices.length === 0 ? 'No favorite services yet' : 'No services match your filters'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {favoriteServices.length === 0 
                                    ? 'Start adding services to your favorites to see them here.'
                                    : 'Try adjusting your search or filters to find your favorite services.'
                                }
                            </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            isFavorite={true} // All services on this page are favorites
                            onToggleFavorite={toggleFavorite}
                            onBook={handleBookService}
                            showBookButton={true}
                            showMoreActions={true}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function FavoritesPage() {
    return (
        <RoleBasedRoute requiredPermissions={['view services']} allowedRoles={['Customer']}>
            <FavoritesPageContent />
        </RoleBasedRoute>
    )
}
