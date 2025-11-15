export interface Service {
    id: number
    name: string
    description: string
    price: string | number
    duration_minutes?: number
    duration?: number
    category: string
    tenant_name?: string
    tenant_id?: number
    is_active?: boolean
    staff_required?: boolean
    booking_buffer_minutes?: number
    has_promotion?: boolean
    is_on_promotion?: boolean
    promotion_discount_percentage?: number
    effective_price?: string | number
    promotion_price?: string | number
    promotion_title?: string
    promotion_description?: string
    promotion_start_date?: string
    promotion_end_date?: string
    promotion_time_remaining?: number
    promotion_time_remaining_formatted?: string
    image_url?: string
    average_rating?: number | null
    total_reviews?: number
}

export interface ServiceCardProps {
    service: Service
    isFavorite: boolean
    onToggleFavorite: (serviceId: number) => void
    onBook?: (service: Service) => void
    showBookButton?: boolean
    showMoreActions?: boolean
    onEdit?: (service: Service) => void
    onDelete?: (serviceId: number) => void
    onTogglePromotion?: (serviceId: number) => void
    className?: string
}
