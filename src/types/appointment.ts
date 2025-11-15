import { Service } from './service'
import { User } from './auth'

export interface Appointment {
    id: number
    user_id: number
    tenant_id: number
    service_id: number
    staff_id?: number | null
    booking_reference: string
    service_name: string
    appointment_date: string
    appointment_time: string
    duration_minutes: number
    price: string | number
    total_price?: string | number
    discount_amount?: string | number
    status: AppointmentStatus
    payment_status?: PaymentStatus
    payment_method?: PaymentMethod
    phone?: string
    notes?: string | null
    is_guest_booking: boolean
    confirmed_at?: string | null
    cancelled_at?: string | null
    cancellation_reason?: string | null
    reward_id?: number | null
    created_at: string
    updated_at: string
    
    // Relationships
    user?: User
    service?: Service & {
        average_rating?: number | null
        total_reviews?: number
    }
    staff?: User
    payment?: Payment
    client_name?: string
    client_email?: string
    client_phone?: string
}

export type AppointmentStatus = 
    | 'pending' 
    | 'confirmed' 
    | 'in_progress' 
    | 'in-progress'
    | 'completed' 
    | 'cancelled'
    | 'no_show'

export type PaymentStatus = 
    | 'pending' 
    | 'paid' 
    | 'failed' 
    | 'refunded'
    | 'completed' // For backwards compatibility

export type PaymentMethod = 
    | 'cash' 
    | 'card' 
    | 'wallet' 
    | 'bank_transfer' 
    | 'mobile'

export interface Payment {
    id: number
    appointment_id?: number | null
    user_id: number
    amount: string | number
    payment_method: PaymentMethod
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    transaction_reference?: string | null
    paid_at?: string | null
    payment_gateway_response?: any
    created_at: string
    updated_at: string
}

export interface AppointmentCardProps {
    appointment: Appointment
    isFavorite?: boolean
    onToggleFavorite?: () => void
    onReschedule?: () => void
    onModify?: () => void
    onCancel?: () => void
    onRate?: () => void
}

export interface AppointmentFilters {
    status?: string
    date_from?: string
    date_to?: string
    search?: string
}

export interface AppointmentStats {
    total: number
    pending: number
    confirmed: number
    in_progress: number
    completed: number
    cancelled: number
    today: number
    upcoming: number
}
