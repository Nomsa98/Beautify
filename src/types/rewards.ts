export interface Reward {
    id: number
    user_id: number
    type: 'referral' | 'loyalty' | 'promotion' | 'birthday'
    title: string
    description: string
    value: string | number
    status: 'available' | 'used' | 'expired'
    expires_at?: string | null
    used_at?: string | null
    appointment_id?: number | null
    created_at: string
    updated_at: string
}

export interface Referral {
    id: number
    referrer_id: number
    referred_email: string
    referred_name?: string | null
    status: 'pending' | 'completed' | 'rewarded'
    reward_amount?: string | number | null
    completed_at?: string | null
    rewarded_at?: string | null
    created_at: string
    updated_at: string
}

export interface RewardStats {
    total_referrals: number
    pending_rewards: number
    lifetime_savings: number
    loyalty_points: number
    available_rewards: number
}

export interface LoyaltyPoints {
    id: number
    user_id: number
    points: number
    tier?: string | null
    created_at: string
    updated_at: string
}
