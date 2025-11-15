export interface Review {
    id: number
    appointment_id: number
    user_id: number
    service_id: number
    staff_id?: number | null
    overall_rating: number
    service_rating: number
    staff_rating?: number | null
    comment?: string | null
    status: 'pending' | 'approved' | 'rejected'
    is_featured: boolean
    is_verified_purchase: boolean
    created_at: string
    updated_at: string
    
    // Relationships
    user?: {
        id: number
        name: string
        email: string
    }
    service?: {
        id: number
        name: string
    }
    staff?: {
        id: number
        name: string
    }
}

export interface ReviewFormData {
    overall_rating: number
    service_rating: number
    staff_rating?: number
    comment?: string
}

export interface ReviewStats {
    total_reviews: number
    average_rating: number
    rating_distribution: {
        5: number
        4: number
        3: number
        2: number
        1: number
    }
}
