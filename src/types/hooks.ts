// Hook-specific types
import type { WalletTransaction } from './payment'

// useGuest types
export interface GuestBookingData {
    name: string
    email: string
    phone: string
    service: string
    service_id: string
    tenant_id: string
    date: string
    time: string
    message: string
    payment_method_id?: string
}

export interface AvailableSlots {
    date: string
    tenant_id: string
    available_slots: string[]
    booked_slots: string[]
}

// useBookingHistory types
export interface BookingHistory {
    id: number
    service_name: string
    service_category: string
    tenant_name: string
    staff_name: string
    appointment_date: string
    appointment_time: string
    status: string
    total_price: number
    payment_method: string
    payment_status: string
    created_at: string
}

// useSearch types
export interface SearchFilters {
    categories: string[]
    tenants: { id: string; name: string }[]
    price_range: { min: string; max: string }
    duration_range: { min: number; max: number }
}

export interface SearchSuggestion {
    type: 'service' | 'category' | 'tenant'
    text: string
}

export interface GlobalSearchResult {
    id: string
    type: 'appointment' | 'client' | 'service'
    title: string
    subtitle: string
    description?: string
    status?: string
    time?: string
    price?: string
    category?: string
    phone?: string
    email?: string
    tenant_name?: string
    staff_name?: string
    date?: string
    image_url?: string
}

export interface PopularSearches {
    popular_categories: string[]
    trending_services: any[]
}

// useWallet types
export interface WalletData {
    balance: number
    currency: string
    total_spent: number
    total_credited: number
    transactions: WalletTransaction[]
}

// useAppointmentActions types
export interface RescheduleData {
    appointment_date: string
    appointment_time: string
}

export interface ModifyData {
    service_id: number
}

export interface CancelData {
    cancellation_reason?: string
}

export interface CancellationPolicy {
    cancellation_window: number
    refund_eligible: string[]
    non_refundable: string[]
    policy_text: string
    reschedule_window: number
    reschedule_policy: string
}

export interface AppointmentActionResponse {
    success: boolean
    message: string
    appointment?: any
    priceDifference?: number
    refunded?: boolean
}

// useBookingHistory types
export interface BookingFilters {
    status?: string
    date_from?: string
    date_to?: string
}

// useFavorites types
export interface FavoriteService {
    id: number
    service_id: number
    user_id: number
    created_at: string
    service?: any
}

// usePaymentMethods types
export interface PaymentMethodOption {
    id: number
    name: string
    type: string
    description?: string
    processing_fee_percentage: number
    processing_fee_fixed: number
    icon?: string
    color?: string
}

// useWallet types
export interface WalletBalance {
    balance: number
    currency: string
}

export interface AddFundsData {
    amount: number
    payment_method_id: number
}

// useSearch types
export interface SearchResult {
    id: number
    name: string
    type: 'service' | 'appointment' | 'client'
    description?: string
    [key: string]: any
}

export interface SearchFilters {
    query: string
    type?: 'service' | 'appointment' | 'client' | 'all'
    category?: string
    tenant_id?: number
}
