'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    MapPin,
    Clock,
    ShoppingCart,
    Star,
    MoreVertical,
    Calendar,
    Phone,
    Sparkles,
    Scissors,
    Edit,
    Trash2,
    Tag
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Service, ServiceCardProps } from '@/types/service'

// Constants
const CARD_CONFIG = {
    width: 'w-80',
    height: 'h-[650px]', // Increased height to accommodate promotional content
    imageHeight: 'h-48', // Reduced image height to make room for content
    promotionHeight: 'min-h-[80px]', // Flexible height for promotion content
    descriptionHeight: 'h-12' // Slightly increased for better text display
} as const

const DESIGN_TOKENS = {
    shadows: {
        card: 'shadow-lg hover:shadow-2xl',
        cardHover: 'hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)]',
        button: 'shadow-md hover:shadow-lg'
    },
    gradients: {
        cardBg: 'bg-gradient-to-br from-white via-white to-gray-50/30',
        promotion: 'bg-gradient-to-r from-red-500 via-pink-500 to-red-600',
        promotionBg: 'bg-gradient-to-br from-red-50 via-pink-50 to-red-50/50',
        regular: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500',
        overlay: 'bg-gradient-to-t from-black/60 via-transparent to-transparent'
    },
    animations: {
        cardHover: 'hover:-translate-y-2 hover:rotate-1',
        imageHover: 'group-hover:scale-110',
        buttonHover: 'hover:scale-[1.02] active:scale-[0.98]',
        heartBeat: 'hover:animate-pulse'
    }
} as const

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

const ServiceCard = memo(function ServiceCard({
    service,
    isFavorite,
    onToggleFavorite,
    onBook,
    showBookButton = true,
    showMoreActions = false,
    onEdit,
    onDelete,
    onTogglePromotion,
    className = ""
}: ServiceCardProps) {
    const router = useRouter()
    const [imageError, setImageError] = useState(false)
    const [isBooking, setIsBooking] = useState(false)

    const formatPrice = useCallback((price: number | string) => {
        if (!price) return 'R0.00';

        // If price is already a formatted string like "R25", return it as is
        if (typeof price === 'string' && price.startsWith('R')) {
            return price;
        }

        // If price is a string number like "25", parse it
        const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]/g, '')) : price;
        if (isNaN(numPrice) || numPrice === 0) return 'R0.00';

        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(numPrice);
    }, [])

    const formatDuration = useCallback((minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
        }
        return `${mins}m`
    }, [])

    const handleBookService = useCallback(async () => {
        setIsBooking(true)
        try {
            if (onBook) {
                await onBook(service)
            } else {
                router.push(`/services-marketplace?service=${service.id}`)
            }
        } catch (error) {
            console.error('Error booking service:', error)
        } finally {
            setIsBooking(false)
        }
    }, [onBook, service, router])

    const handleToggleFavorite = useCallback(() => {
        onToggleFavorite(service.id)
    }, [onToggleFavorite, service.id])

    const handleImageError = useCallback(() => {
        setImageError(true)
    }, [])

    const duration = useMemo(() => service.duration_minutes || service.duration || 0, [service.duration_minutes, service.duration])

    const cardClasses = useMemo(() => {
        const baseClasses = `bg-white rounded-lg shadow-lg overflow-hidden border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex-shrink-0 ${CARD_CONFIG.width} ${CARD_CONFIG.height} flex flex-col`
        const promotionClasses = service.has_promotion ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'
        return `${baseClasses} ${promotionClasses} ${className}`
    }, [service.has_promotion, className])

    const imageUrl = useMemo(() => {
        if (imageError) return FALLBACK_IMAGE
        if (!service.image_url) return FALLBACK_IMAGE
        return service.image_url.startsWith('http') 
            ? service.image_url 
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}${service.image_url}`
    }, [imageError, service.image_url])

    return (
        <div className={cardClasses} role="article" aria-labelledby={`service-${service.id}-name`}>
            {/* Service Image */}
            <div className={`relative ${CARD_CONFIG.imageHeight} bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group`}>
                <Image
                    src={imageUrl}
                    alt={`${service.name} - ${service.category} service at ${service.tenant_name}`}
                    fill
                    className={`object-cover transition-all duration-700 ${DESIGN_TOKENS.animations.imageHover} filter brightness-105`}
                    onError={handleImageError}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Subtle overlay for better text contrast */}
                <div className={`absolute inset-0 ${DESIGN_TOKENS.gradients.overlay} opacity-20 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Promotion Badge */}
                {service.has_promotion && (
                    <div className="absolute top-3 right-3 z-10" role="status" aria-label={`${service.promotion_discount_percentage}% discount available`}>
                        <div className={`${DESIGN_TOKENS.gradients.promotion} text-white px-3 py-2 rounded-full text-xs font-bold flex items-center ${DESIGN_TOKENS.shadows.button} animate-bounce backdrop-blur-sm border border-white/20`}>
                            <Sparkles className="h-3 w-3 mr-1 animate-spin" />
                            {service.promotion_discount_percentage}% OFF
                        </div>
                    </div>
                )}

                {/* Salon Flag */}
                <div className="absolute z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-br-lg rounded-tl-lg text-xs font-bold flex items-center shadow-lg backdrop-blur-sm">
                        <Scissors className="h-3 w-3 mr-1" />
                        {service.tenant_name}
                    </div>
                </div>

                {/* Promotion Time Remaining badge */}
                {service.promotion_time_remaining_formatted && (
                    <div className="absolute bottom-3 right-3 z-10 bg-white text-blue-500 px-2 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg backdrop-blur-sm border border-blue-500">
                        {service.promotion_time_remaining_formatted}
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={handleToggleFavorite}
                    className={`absolute bottom-3 left-3 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white transition-all duration-300 hover:scale-125 ${DESIGN_TOKENS.animations.heartBeat} focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${DESIGN_TOKENS.shadows.button} backdrop-blur-sm border border-white/50`}
                    aria-label={isFavorite ? `Remove ${service.name} from favorites` : `Add ${service.name} to favorites`}
                    type="button"
                >
                    <Heart
                        className={`h-5 w-5 transition-all duration-300 ${isFavorite ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-500 hover:text-red-500 hover:fill-red-100'}`}
                    />
                </button>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-pink-100/30 to-transparent rounded-full -translate-y-2 translate-x-2" />

                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 shadow-sm">
                        <Scissors className="h-5 w-5 text-pink-600" />
                    </div>
                    <div className="text-right">
                        {service.has_promotion ? (
                            <div>
                                <span className="text-sm text-gray-400 line-through">{formatPrice(service.price)}</span>
                                <span className="text-xl font-bold text-red-500 ml-1">{formatPrice(service.effective_price || service.promotion_price || service.price)}</span>
                            </div>
                        ) : (
                            <span className="text-xl font-bold text-pink-500">{formatPrice(service.price)}</span>
                        )}
                    </div>
                </div>

                {/* Promotion Section - Enhanced */}
                <div className={`${CARD_CONFIG.promotionHeight} mb-3`}>
                    {service.has_promotion ? (
                        <div className="space-y-2 h-full">
                            {/* Promotion Title */}
                            {service.promotion_title && (
                                <div className={`${DESIGN_TOKENS.gradients.promotionBg} border border-red-200/50 rounded-lg p-2 ${DESIGN_TOKENS.shadows.button} backdrop-blur-sm relative overflow-hidden`}>
                                    {/* Decorative sparkle pattern */}
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-300/30 rounded-full animate-ping" />
                                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-pink-300/40 rounded-full animate-pulse" />

                                    <div className="relative z-10">
                                        <h5 className="text-red-700 font-bold text-xs flex items-center">
                                            <Sparkles className="h-3 w-3 mr-1 text-red-500 animate-pulse" />
                                            {service.promotion_title}
                                        </h5>
                                        {service.promotion_description && (
                                            <p className="text-red-600/80 text-xs mt-1 line-clamp-1 font-medium">{service.promotion_description}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Compact Price Breakdown for Promotions */}
                            <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Regular</span>
                                    <span className="text-sm text-gray-400 line-through">{formatPrice(service.price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-red-600">Special</span>
                                    <span className="text-lg font-bold text-red-500">{formatPrice(service.effective_price || service.promotion_price || service.price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-green-600 font-medium">Save</span>
                                    <span className="text-xs font-bold text-green-600">
                                        {service.promotion_discount_percentage}% OFF
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <h3 id={`service-${service.id}-name`} className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-1">{service.name}</h3>
                
                {/* Rating Display */}
                {(service.average_rating !== null && service.average_rating !== undefined && service.total_reviews && service.total_reviews > 0) && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                        star <= Math.round(Number(service.average_rating))
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{Number(service.average_rating).toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({service.total_reviews} {service.total_reviews === 1 ? 'review' : 'reviews'})</span>
                    </div>
                )}

                <div className={`mb-3 ${CARD_CONFIG.descriptionHeight} flex-shrink-0`}>
                    <p className="text-gray-600 text-xs line-clamp-3 leading-relaxed">{service.description || ' '}</p>
                </div>

                {/* Enhanced info section */}
                <div className="space-y-2 mb-3 flex-shrink-0">
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50/50 rounded-lg px-2 py-1.5">
                        <div className="flex items-center space-x-1">
                            <div className="p-0.5 rounded-md bg-blue-100">
                                <Clock className="h-2.5 w-2.5 text-blue-600" />
                            </div>
                            <span className="font-medium">{formatDuration(duration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="p-0.5 rounded-md bg-green-100">
                                <MapPin className="h-2.5 w-2.5 text-green-600" />
                            </div>
                            <span className="text-xs font-medium truncate max-w-16">{service.tenant_name}</span>
                        </div>
                    </div>
                    
                    {/* Promotion End Date */}
                    {service.has_promotion && service.promotion_end_date && (
                        <div className="text-center">
                            <div className="text-red-500 text-xs font-medium bg-red-50 px-2 py-0.5 rounded-full inline-block">
                                Ends: {new Date(service.promotion_end_date).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    {showBookButton && (
                        <button
                            onClick={handleBookService}
                            disabled={isBooking}
                            className={`w-full py-2.5 px-3 rounded-lg font-bold text-white transition-all duration-300 ${DESIGN_TOKENS.animations.buttonHover} ${DESIGN_TOKENS.shadows.button} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group ${
                                service.has_promotion
                                    ? `${DESIGN_TOKENS.gradients.promotion} hover:shadow-red-200 focus:ring-red-500`
                                    : `${DESIGN_TOKENS.gradients.regular} hover:shadow-purple-200 focus:ring-purple-500`
                            }`}
                            aria-describedby={`service-${service.id}-description`}
                            type="button"
                        >
                            {/* Button shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            {isBooking ? (
                                <span className="flex items-center justify-center relative z-10 text-sm">
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                                    Booking...
                                </span>
                            ) : (
                                <span className="relative z-10 flex items-center justify-center text-sm">
                                    {service.has_promotion ? (
                                        <>
                                            <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
                                            Book Special Offer!
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Book Now!
                                        </>
                                    )}
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {showMoreActions && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-xl transition-all duration-200"
                                aria-label={`More actions for ${service.name}`}
                            >
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(service)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Service
                                </DropdownMenuItem>
                            )}
                            {onTogglePromotion && (
                                <DropdownMenuItem onClick={() => onTogglePromotion(service.id)}>
                                    <Tag className="mr-2 h-4 w-4" />
                                    {service.has_promotion ? 'Remove Promotion' : 'Add to Promotions'}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => router.push(`/services-marketplace?service=${service.id}`)}>
                                <Calendar className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={() => onDelete(service.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Service
                                    </DropdownMenuItem>
                                </>
                            )}
                            {!onEdit && !onDelete && (
                                <DropdownMenuItem>
                                    <Phone className="mr-2 h-4 w-4" />
                                    Contact Salon
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
})

ServiceCard.displayName = 'ServiceCard'

export default ServiceCard
