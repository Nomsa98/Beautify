'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    CheckCircle,
    XCircle,
    AlertCircle,
    MessageSquare,
    Star,
    MoreVertical,
    Heart,
    User,
    CreditCard,
    Wallet,
    Banknote,
    Smartphone,
    Building2
} from 'lucide-react'
import { format } from 'date-fns'

interface AppointmentCardProps {
    appointment: any & {
        service?: {
            average_rating?: number | null
            total_reviews?: number
        }
    }
    isFavorite?: boolean
    onToggleFavorite?: () => void
    onReschedule?: () => void
    onModify?: () => void
    onCancel?: () => void
    onRate?: () => void
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

export default function AppointmentCard({
    appointment,
    isFavorite = false,
    onToggleFavorite,
    onReschedule,
    onModify,
    onCancel,
    onRate
}: AppointmentCardProps) {
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'completed': return 'bg-blue-100 text-blue-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="h-3 w-3" />
            case 'pending': return <AlertCircle className="h-3 w-3" />
            case 'completed': return <CheckCircle className="h-3 w-3" />
            case 'cancelled': return <XCircle className="h-3 w-3" />
            default: return null
        }
    }

    const getPaymentStatusColor = (status?: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 border-green-200'
            case 'completed': return 'bg-green-100 text-green-700 border-green-200' // Backwards compatibility
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'failed': return 'bg-red-100 text-red-700 border-red-200'
            case 'refunded': return 'bg-purple-100 text-purple-700 border-purple-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getPaymentMethodIcon = (method?: string) => {
        switch (method) {
            case 'card': return <CreditCard className="h-3 w-3" />
            case 'wallet': return <Wallet className="h-3 w-3" />
            case 'cash': return <Banknote className="h-3 w-3" />
            case 'bank_transfer': return <Building2 className="h-3 w-3" />
            case 'mobile': return <Smartphone className="h-3 w-3" />
            default: return <Banknote className="h-3 w-3" />
        }
    }

    const getPaymentMethodName = (method?: string) => {
        switch (method) {
            case 'card': return 'Card'
            case 'wallet': return 'Wallet'
            case 'cash': return 'Cash'
            case 'bank_transfer': return 'Bank Transfer'
            case 'mobile': return 'Mobile'
            default: return method || 'N/A'
        }
    }

    // Check if appointment has active promotion
    const hasPromotion = appointment.service?.has_promotion || appointment.service?.is_currently_on_promotion || appointment.service?.is_on_promotion

    return (
        <Card className={`hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 ${
            hasPromotion 
                ? 'border-l-red-500 border-red-300 ring-2 ring-red-100' 
                : 'border-l-pink-500'
        }`}>
            <div className="flex flex-col md:flex-row">
                {/* Service Image - Always show */}
                <div className="md:w-48 h-48 md:h-auto relative overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                    <img 
                        src={
                            appointment.service?.image_url
                                ? (appointment.service.image_url.startsWith('http')
                                    ? appointment.service.image_url
                                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}${appointment.service.image_url}`)
                                : FALLBACK_IMAGE
                        }
                        alt={appointment.service_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE
                        }}
                    />
                    
                    {/* Promotion Badge */}
                    {hasPromotion && appointment.service?.promotion_discount_percentage && (
                        <div className="absolute top-2 right-2">
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 animate-pulse">
                                🔥 {appointment.service.promotion_discount_percentage}% OFF
                            </Badge>
                        </div>
                    )}
                    
                    {/* Category Badge */}
                    {appointment.service?.category && (
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                                {appointment.service.category}
                            </Badge>
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Star className="h-5 w-5 text-pink-600" />
                                    {appointment.service_name}
                                </CardTitle>
                                
                                {/* Service Rating */}
                                {appointment.service?.average_rating && appointment.service?.total_reviews ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-3 w-3 ${
                                                        star <= Math.round(appointment.service.average_rating!)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">{appointment.service.average_rating.toFixed(1)}</span>
                                        <span className="text-xs text-gray-500">({appointment.service.total_reviews})</span>
                                    </div>
                                ) : null}
                                
                                <CardDescription className="mt-2 flex flex-wrap items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {appointment.tenant.name}
                                    </span>
                                    {appointment.booking_reference && (
                                        <span className="text-xs font-mono bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                            #{appointment.booking_reference}
                                        </span>
                                    )}
                                    {appointment.staff && (
                                        <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                            <User className="h-3 w-3" />
                                            {appointment.staff.name}
                                            {appointment.staff.specialization && ` • ${appointment.staff.specialization}`}
                                        </span>
                                    )}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(appointment.status)}>
                                        {getStatusIcon(appointment.status)}
                                        <span className="ml-1 capitalize">{appointment.status.replace('_', ' ')}</span>
                                    </Badge>
                                    
                                    {/* Favorite Service Button */}
                                    {appointment.service && onToggleFavorite && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onToggleFavorite}
                                            className={`p-2 transition-colors ${
                                                isFavorite 
                                                    ? 'text-red-500 hover:text-red-600' 
                                                    : 'text-gray-400 hover:text-red-500'
                                            }`}
                                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <Heart className={`h-4 w-4 transition-all ${
                                                isFavorite ? 'fill-current scale-110' : ''
                                            }`} />
                                        </Button>
                                    )}
                                    
                                    {(appointment.can_cancel || appointment.can_reschedule) && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                
                                                {appointment.can_reschedule && (
                                                    <>
                                                        <DropdownMenuItem onClick={onReschedule}>
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            Reschedule
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={onModify}>
                                                            <Star className="mr-2 h-4 w-4" />
                                                            Change Service
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                {appointment.can_cancel && (
                                                    <DropdownMenuItem 
                                                        onClick={onCancel}
                                                        className="text-red-600"
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Cancel Appointment
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Contact Salon
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                
                                {/* Payment Information Badges */}
                                <div className="flex items-center gap-2">
                                    {/* Payment Status */}
                                    {appointment.payment_status && (
                                        <Badge className={`border ${getPaymentStatusColor(appointment.payment_status)}`} variant="outline">
                                            {(appointment.payment_status === 'paid' || appointment.payment_status === 'completed') && <CheckCircle className="h-3 w-3 mr-1" />}
                                            {appointment.payment_status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                                            {appointment.payment_status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                            <span className="capitalize">{appointment.payment_status}</span>
                                        </Badge>
                                    )}
                                    
                                    {/* Payment Method */}
                                    {appointment.payment_method && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {getPaymentMethodIcon(appointment.payment_method)}
                                            <span className="ml-1">{getPaymentMethodName(appointment.payment_method)}</span>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                {appointment.appointment_time} ({appointment.duration_minutes}min)
                            </div>
                            <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-gray-500" />
                                {hasPromotion ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 line-through text-xs">
                                            R{parseFloat(appointment.price).toFixed(2)}
                                        </span>
                                        <span className="text-red-600 font-bold">
                                            R{parseFloat(String(appointment.service.effective_price || appointment.service.promotion_price || appointment.price)).toFixed(2)}
                                        </span>
                                    </div>
                                ) : (
                                    <span>R{parseFloat(appointment.total_price || appointment.price).toFixed(2)}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                {appointment.staff?.name || 'Staff TBD'}
                            </div>
                        </div>

                        {appointment.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-600">
                                    <strong>Notes:</strong> {appointment.notes}
                                </p>
                            </div>
                        )}

                        {appointment.cancellation_reason && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-700">
                                    <strong>Cancellation reason:</strong> {appointment.cancellation_reason}
                                </p>
                            </div>
                        )}

                        {appointment.status === 'completed' && onRate && (
                            <div className="mt-4 flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={onRate}
                                    className="hover:bg-yellow-50 hover:border-yellow-400"
                                >
                                    <Star className="h-4 w-4 mr-2" />
                                    Rate Service
                                </Button>
                                <Button size="sm" variant="outline">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book Again
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </div>
            </div>
        </Card>
    )
}
