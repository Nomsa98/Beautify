import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { useAuth } from './auth'
import type { WalletTransaction, WalletData } from '@/types'

// Alias for backwards compatibility
export type Transaction = WalletTransaction

export const useWallet = () => {
    const { user } = useAuth()
    const [walletData, setWalletData] = useState<WalletData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            fetchWalletData()
        }
    }, [user])

    const fetchWalletData = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get('/api/customer/wallet')
            
            if (response.data.success) {
                setWalletData(response.data.data)
            }
        } catch (err: any) {
            console.error('Error fetching wallet data:', err)
            setError(err.response?.data?.message || 'Failed to load wallet data')
        } finally {
            setLoading(false)
        }
    }

    const addFunds = async (amount: number, paymentMethodId: number) => {
        try {
            const response = await axios.post('/api/customer/wallet/add-funds', {
                amount,
                payment_method_id: paymentMethodId
            })
            
            if (response.data.success) {
                await fetchWalletData() // Refresh wallet data
                return { success: true, data: response.data.data }
            }
            return { success: false, error: 'Failed to add funds' }
        } catch (err: any) {
            console.error('Error adding funds:', err)
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to add funds' 
            }
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    return {
        walletData,
        loading,
        error,
        fetchWalletData,
        addFunds,
        formatCurrency
    }
}
