'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Command, Calendar, Users, Scissors, Clock, MapPin, Star, Heart, TrendingUp, Filter, Sparkles } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useSearch, GlobalSearchResult } from '@/hooks/useSearch'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface CommandSearchProps {
    isOpen: boolean
    onClose: () => void
}

type ResultType = 'all' | 'appointment' | 'service' | 'client'

export default function CommandSearch({ isOpen, onClose }: CommandSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<GlobalSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
    const [activeFilter, setActiveFilter] = useState<ResultType>('all')
    const { globalSearch } = useSearch()
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<NodeJS.Timeout>()

    // Filter results based on active filter
    const filteredResults = activeFilter === 'all' 
        ? results 
        : results.filter(r => r.type === activeFilter)

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
            setQuery('')
            setResults([])
        }
    }, [isOpen])

    useEffect(() => {
        // Debounced search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        if (query.trim()) {
            setLoading(true)
            debounceRef.current = setTimeout(async () => {
                try {
                    const searchResults = await globalSearch(query, 10)
                    setResults(searchResults)
                    setSelectedIndex(0)
                } catch (error) {
                    console.error('Search error:', error)
                    setResults([])
                } finally {
                    setLoading(false)
                }
            }, 300)
        } else {
            setResults([])
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [query]) // Removed globalSearch from dependencies

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault()
                handleResultClick(results[selectedIndex])
            } else if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, results, selectedIndex, onClose])

    const handleResultClick = (result: GlobalSearchResult) => {
        onClose()
        setQuery('')

        switch (result.type) {
            case 'appointment':
                router.push(`/customer/my-appointments`)
                break
            case 'service':
                router.push(`/customer/services-marketplace`)
                break
            case 'client':
                router.push(`/admin/users`)
                break
            default:
                break
        }
    }

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'appointment':
                return <Calendar className="h-5 w-5 text-blue-500" />
            case 'client':
                return <Users className="h-5 w-5 text-green-500" />
            case 'service':
                return <Scissors className="h-5 w-5 text-pink-500" />
            default:
                return <Search className="h-5 w-5 text-gray-500" />
        }
    }

    const getResultBadge = (type: string) => {
        const badges: Record<string, { label: string; color: string }> = {
            appointment: { label: 'Appointment', color: 'bg-blue-100 text-blue-700' },
            client: { label: 'Client', color: 'bg-green-100 text-green-700' },
            service: { label: 'Service', color: 'bg-pink-100 text-pink-700' },
        }
        return badges[type] || { label: type, color: 'bg-gray-100 text-gray-700' }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden shadow-2xl">
                {/* Search Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b bg-gradient-to-r from-pink-500 to-purple-600">
                    <Search className="h-5 w-5 text-white/80" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search appointments, services, clients..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-white placeholder-white/60 font-medium"
                    />
                    <div className="flex items-center gap-2">
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/20 backdrop-blur-sm border border-white/30 rounded text-white">
                            <Command className="h-3 w-3" />
                            K
                        </kbd>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <X className="h-4 w-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                {query && results.length > 0 && (
                    <div className="flex items-center gap-2 px-5 py-3 border-b bg-gray-50 overflow-x-auto">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                activeFilter === 'all' 
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Sparkles className="h-4 w-4" />
                            All ({results.length})
                        </button>
                        {results.filter(r => r.type === 'service').length > 0 && (
                            <button
                                onClick={() => setActiveFilter('service')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeFilter === 'service' 
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <Scissors className="h-4 w-4" />
                                Services ({results.filter(r => r.type === 'service').length})
                            </button>
                        )}
                        {results.filter(r => r.type === 'appointment').length > 0 && (
                            <button
                                onClick={() => setActiveFilter('appointment')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeFilter === 'appointment' 
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <Calendar className="h-4 w-4" />
                                Appointments ({results.filter(r => r.type === 'appointment').length})
                            </button>
                        )}
                        {results.filter(r => r.type === 'client').length > 0 && (
                            <button
                                onClick={() => setActiveFilter('client')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeFilter === 'client' 
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <Users className="h-4 w-4" />
                                Clients ({results.filter(r => r.type === 'client').length})
                            </button>
                        )}
                    </div>
                )}

                {/* Search Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                        </div>
                    )}

                    {!loading && query && filteredResults.length === 0 && results.length > 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Filter className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No {activeFilter}s found</p>
                            <p className="text-sm">Try a different filter</p>
                        </div>
                    )}

                    {!loading && query && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Search className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No results found</p>
                            <p className="text-sm">Try searching for something else</p>
                        </div>
                    )}

                    {!loading && !query && (
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        router.push('/customer/services-marketplace')
                                        onClose()
                                    }}
                                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-lg transition-all"
                                >
                                    <Scissors className="h-5 w-5 text-pink-600" />
                                    <span className="font-medium text-gray-900">Browse Services</span>
                                </button>
                                <button
                                    onClick={() => {
                                        router.push('/customer/my-appointments')
                                        onClose()
                                    }}
                                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-lg transition-all"
                                >
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium text-gray-900">My Appointments</span>
                                </button>
                                <button
                                    onClick={() => {
                                        router.push('/customer/favorites')
                                        onClose()
                                    }}
                                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all"
                                >
                                    <Heart className="h-5 w-5 text-purple-600" />
                                    <span className="font-medium text-gray-900">Favorites</span>
                                </button>
                                <button
                                    onClick={() => {
                                        router.push('/dashboard')
                                        onClose()
                                    }}
                                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all"
                                >
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <span className="font-medium text-gray-900">Dashboard</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && filteredResults.length > 0 && (
                        <div className="py-2">
                            {filteredResults.map((result, index) => {
                                const badge = getResultBadge(result.type)
                                const isService = result.type === 'service'
                                
                                return (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleResultClick(result)}
                                        className={`w-full flex items-start gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all border-b border-gray-100 last:border-b-0 ${
                                            index === selectedIndex ? 'bg-gradient-to-r from-pink-50 to-purple-50 shadow-sm' : ''
                                        }`}
                                    >
                                        {/* Image or Icon */}
                                        <div className="flex-shrink-0">
                                            {isService && result.image_url && !imageErrors.has(result.id.toString()) ? (
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-gray-100 to-gray-200">
                                                    <Image
                                                        src={
                                                            result.image_url.startsWith('http') 
                                                                ? result.image_url 
                                                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${result.image_url}`
                                                        }
                                                        alt={result.title}
                                                        fill
                                                        className="object-cover"
                                                        onError={() => {
                                                            setImageErrors(prev => new Set(prev).add(result.id.toString()))
                                                        }}
                                                        sizes="80px"
                                                        unoptimized={result.image_url.includes('unsplash')}
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${
                                                    isService ? 'bg-gradient-to-br from-pink-100 to-purple-100' :
                                                    result.type === 'appointment' ? 'bg-gradient-to-br from-blue-100 to-cyan-100' :
                                                    'bg-gradient-to-br from-green-100 to-emerald-100'
                                                }`}>
                                                    {getResultIcon(result.type)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">{result.title}</h4>
                                                    {result.category && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{result.category}</p>
                                                    )}
                                                </div>
                                                <Badge className={`text-xs flex-shrink-0 ${badge.color}`}>
                                                    {badge.label}
                                                </Badge>
                                            </div>
                                            
                                            {result.subtitle && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{result.subtitle}</p>
                                            )}
                                            
                                            <div className="flex items-center flex-wrap gap-3 text-xs">
                                                {result.tenant_name && (
                                                    <span className="flex items-center gap-1 text-gray-600">
                                                        <MapPin className="h-3 w-3 text-gray-400" />
                                                        {result.tenant_name}
                                                    </span>
                                                )}
                                                {result.date && (
                                                    <span className="flex items-center gap-1 text-gray-600">
                                                        <Clock className="h-3 w-3 text-gray-400" />
                                                        {result.date}
                                                    </span>
                                                )}
                                                {result.price && (
                                                    <span className="flex items-center gap-1 font-semibold text-pink-600 ml-auto">
                                                        {result.price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↑↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↵</kbd>
                            Select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">ESC</kbd>
                            Close
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
