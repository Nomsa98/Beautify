'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, Clock, MapPin, Sparkles, Scissors, Star } from 'lucide-react'
import axios from '@/lib/axios'

interface Service {
    id: string
    name: string
    description: string
    price: string
    effective_price: string
    promotion_price: string | null
    duration: string
    duration_minutes: number
    category: string
    tenant_id: string
    tenant_name: string
    image_url: string
    is_on_promotion: boolean
    is_currently_on_promotion: boolean
    promotion_title: string | null
    promotion_description: string | null
    promotion_discount_percentage: number | null
    promotion_end_date: string | null
}

interface SearchFilters {
    categories: string[]
    tenants: { id: string; name: string }[]
    price_range: { min: number; max: number }
    duration_range: { min: number; max: number }
}

interface SearchSuggestion {
    type: 'service' | 'category' | 'salon'
    text: string
}

interface SearchComponentProps {
    onServiceSelect: (service: Service) => void
    onClose: () => void
}

export default function SearchComponent({ onServiceSelect, onClose }: SearchComponentProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Service[]>([])
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [filters, setFilters] = useState<SearchFilters | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [popularSearches, setPopularSearches] = useState<any>(null)
    
    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedTenant, setSelectedTenant] = useState('')
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
    const [durationRange, setDurationRange] = useState<[number, number]>([0, 300])
    const [onPromotion, setOnPromotion] = useState(false)
    const [sortBy, setSortBy] = useState('relevance')

    const searchInputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        // Focus search input on mount
        searchInputRef.current?.focus()
        
        // Load popular searches and initial filters
        loadPopularSearches()
        loadInitialFilters()

        // Prevent background scrolling when modal is open
        document.body.style.overflow = 'hidden'
        
        // Cleanup function to restore scrolling when component unmounts
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    useEffect(() => {
        // Debounced search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
            if (query.trim()) {
                performSearch()
                loadSuggestions()
            } else {
                setResults([])
                setSuggestions([])
            }
        }, 300)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [query, selectedCategory, selectedTenant, priceRange, durationRange, onPromotion, sortBy])

    const loadPopularSearches = async () => {
        try {
            const response = await axios.get('/api/search/popular')
            setPopularSearches(response.data)
        } catch (error) {
            console.error('Failed to load popular searches:', error)
        }
    }

    const loadInitialFilters = async () => {
        try {
            const response = await axios.get('/api/search/services?limit=1')
            if (response.data.filters) {
                setFilters(response.data.filters)
                setPriceRange([response.data.filters.price_range.min, response.data.filters.price_range.max])
                setDurationRange([response.data.filters.duration_range.min, response.data.filters.duration_range.max])
            }
        } catch (error) {
            console.error('Failed to load filters:', error)
        }
    }

    const performSearch = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                query: query.trim(),
                sort_by: sortBy,
                limit: '20'
            })

            if (selectedCategory) params.append('category', selectedCategory)
            if (selectedTenant) params.append('tenant_id', selectedTenant)
            if (onPromotion) params.append('on_promotion', 'true')
            if (priceRange[0] > 0) params.append('min_price', priceRange[0].toString())
            if (priceRange[1] < 1000) params.append('max_price', priceRange[1].toString())
            if (durationRange[0] > 0) params.append('min_duration', durationRange[0].toString())
            if (durationRange[1] < 300) params.append('max_duration', durationRange[1].toString())

            const response = await axios.get(`/api/search/services?${params}`)
            setResults(response.data.results || [])
            
            if (response.data.filters && !filters) {
                setFilters(response.data.filters)
            }
        } catch (error) {
            console.error('Search failed:', error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const loadSuggestions = async () => {
        if (query.length < 2) {
            setSuggestions([])
            return
        }

        try {
            const response = await axios.get(`/api/search/suggestions?query=${encodeURIComponent(query)}`)
            setSuggestions(response.data.suggestions || [])
        } catch (error) {
            console.error('Failed to load suggestions:', error)
            setSuggestions([])
        }
    }

    const clearFilters = () => {
        setSelectedCategory('')
        setSelectedTenant('')
        setOnPromotion(false)
        setSortBy('relevance')
        if (filters) {
            setPriceRange([filters.price_range.min, filters.price_range.max])
            setDurationRange([filters.duration_range.min, filters.duration_range.max])
        }
    }

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.text)
        setShowSuggestions(false)
    }

    const handlePopularCategoryClick = (category: string) => {
        setQuery(category)
        setSelectedCategory(category)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Search Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    setShowSuggestions(true)
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Search for services, salons, or treatments..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                            />
                            
                            {/* Search Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                suggestion.type === 'service' ? 'bg-blue-100 text-blue-700' :
                                                suggestion.type === 'category' ? 'bg-green-100 text-green-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {suggestion.type}
                                            </span>
                                            <span>{suggestion.text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                                showFilters ? 'bg-pink-50 border-pink-300 text-pink-700' : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="h-5 w-5" />
                            <span>Filters</span>
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && filters && (
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="">All Categories</option>
                                    {filters.categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Salon Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Salon</label>
                                <select
                                    value={selectedTenant}
                                    onChange={(e) => setSelectedTenant(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="">All Salons</option>
                                    {filters.tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="duration_asc">Duration: Short to Long</option>
                                    <option value="duration_desc">Duration: Long to Short</option>
                                    <option value="name">Name A-Z</option>
                                </select>
                            </div>

                            {/* Promotion Filter */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="promotion-filter"
                                    checked={onPromotion}
                                    onChange={(e) => setOnPromotion(e.target.checked)}
                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                />
                                <label htmlFor="promotion-filter" className="ml-2 text-sm text-gray-700">
                                    On Promotion Only
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-600 hover:text-gray-800"
                            >
                                Clear All Filters
                            </button>
                            <span className="text-sm text-gray-600">
                                {results.length} results found
                            </span>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6" style={{ overscrollBehavior: 'contain' }}>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                            <span className="ml-2 text-gray-600">Searching...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map((service) => (
                                <div
                                    key={service.id}
                                    className={`bg-white rounded-lg shadow-lg overflow-hidden border hover:shadow-xl transition-shadow cursor-pointer ${
                                        service.is_currently_on_promotion ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'
                                    }`}
                                    onClick={() => onServiceSelect(service)}
                                >
                                    {/* Service Image */}
                                    <div className="relative h-32 bg-gray-200 overflow-hidden">
                                        <img 
                                            src={service.image_url} 
                                            alt={service.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                        
                                        {/* Promotion Badge */}
                                        {service.is_currently_on_promotion && (
                                            <div className="absolute top-0 right-0">
                                                <div className="bg-red-500 text-white px-2 py-1 rounded-bl-lg text-xs font-bold flex items-center">
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    {service.promotion_discount_percentage}% OFF
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                                            <div className="text-right">
                                                {service.is_currently_on_promotion ? (
                                                    <div>
                                                        <span className="text-sm text-gray-400 line-through">{service.price}</span>
                                                        <span className="text-lg font-bold text-red-500 ml-1">{service.promotion_price}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-lg font-bold text-pink-500">{service.price}</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                                        
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {service.duration}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {service.tenant_name}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                {service.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="text-center py-12">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-600">Try adjusting your search terms or filters</p>
                        </div>
                    ) : (
                        // Popular searches when no query
                        <div className="space-y-6">
                            {popularSearches?.popular_categories && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {popularSearches.popular_categories.map((category: string) => (
                                            <button
                                                key={category}
                                                onClick={() => handlePopularCategoryClick(category)}
                                                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {popularSearches?.trending_services && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Offers</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {popularSearches.trending_services.map((service: any) => (
                                            <button
                                                key={service.id}
                                                onClick={() => setQuery(service.name)}
                                                className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-left"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                                        {service.promotion_discount_percentage}% OFF
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{service.tenant_name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{service.category}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
