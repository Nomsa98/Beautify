import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { useAuth } from './auth'
import type { PaymentMethodType } from '@/types'

// Alias for backwards compatibility
export type PaymentMethod = PaymentMethodType

export const usePaymentMethods = () => {
    const { user } = useAuth()
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null)

    useEffect(() => {
        fetchPaymentMethods()
        loadPreferredMethod()
    }, [])

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true)
            setError(null)
            
            // Try authenticated endpoint first, fallback to public if needed
            let response
            try {
                response = await axios.get('/api/payment-methods', {
                    params: { active_only: true }
                })
            } catch (authError) {
                // If auth fails, try public endpoint
                response = await axios.get('/api/public/payment-methods', {
                    params: { active_only: true }
                })
            }
            
            if (response.data.payment_methods) {
                setPaymentMethods(response.data.payment_methods)
            }
        } catch (err: any) {
            console.error('Error fetching payment methods:', err)
            setError(err.response?.data?.message || 'Failed to load payment methods')
        } finally {
            setLoading(false)
        }
    }

    const loadPreferredMethod = () => {
        const preferred = localStorage.getItem('preferred_payment_method')
        if (preferred) {
            setSelectedMethodId(parseInt(preferred))
        }
    }

    const savePreferredMethod = (methodId: number) => {
        localStorage.setItem('preferred_payment_method', methodId.toString())
        setSelectedMethodId(methodId)
    }

    const getMethodById = (id: number) => {
        return paymentMethods.find(method => method.id === id)
    }

    const calculateFee = (amount: number, methodId: number) => {
        const method = getMethodById(methodId)
        if (!method) return 0

        const percentageFee = (amount * Number(method.processing_fee_percentage)) / 100
        const totalFee = percentageFee + Number(method.processing_fee_fixed)
        
        return totalFee
    }

    const calculateTotal = (amount: number, methodId: number) => {
        return amount + calculateFee(amount, methodId)
    }

    return {
        paymentMethods,
        loading,
        error,
        selectedMethodId,
        setSelectedMethodId,
        savePreferredMethod,
        getMethodById,
        calculateFee,
        calculateTotal,
        fetchPaymentMethods
    }
}
