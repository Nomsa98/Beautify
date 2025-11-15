export interface PaymentMethodType {
    id: number
    tenant_id?: number | null
    name: string
    type: 'cash' | 'card' | 'wallet' | 'bank_transfer' | 'mobile'
    description?: string | null
    is_active: boolean
    requires_reference: boolean
    processing_fee_percentage: string | number
    processing_fee_fixed: string | number
    icon?: string | null
    color?: string | null
    sort_order: number
    config?: any
    created_at: string
    updated_at: string
}

export interface Wallet {
    id: number
    user_id: number
    balance: string | number
    currency: string
    created_at: string
    updated_at: string
}

export interface WalletTransaction {
    id: number
    wallet_id: number
    payment_method_id?: number | null
    amount: string | number
    type: 'credit' | 'debit'
    description?: string | null
    reference?: string | null
    balance_after: string | number
    created_at: string
    updated_at: string
}

export interface PaymentInitializeRequest {
    service_id: number
    date: string
    time: string
    message?: string
    payment_method_id: number
    staff_id?: number | null
    reward_id?: number | null
}

export interface PaymentInitializeResponse {
    success: boolean
    payment_method: 'card' | 'cash' | 'wallet'
    message?: string
    authorization_url?: string
    reference?: string
    appointment?: any
    base_amount?: number
    fee?: number
    total_amount?: number
    wallet_balance?: number
}

export interface PaymentCallbackRequest {
    reference: string
}

export interface PaymentCallbackResponse {
    success: boolean
    message: string
    appointment?: any
    payment?: any
}
