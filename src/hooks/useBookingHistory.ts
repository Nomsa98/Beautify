import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { useAuth } from './auth'
import type { BookingHistory } from '@/types'

// Alias for backwards compatibility
export type Booking = BookingHistory

export const useBookingHistory = () => {
    const { user } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            fetchBookingHistory()
        }
    }, [user])

    const fetchBookingHistory = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get('/api/customer/appointments/history')
            
            if (response.data.success) {
                setBookings(response.data.data.appointments || response.data.appointments || [])
            }
        } catch (err: any) {
            console.error('Error fetching booking history:', err)
            setError(err.response?.data?.message || 'Failed to load booking history')
        } finally {
            setLoading(false)
        }
    }

    const filterBookings = (status?: string) => {
        if (!status || status === 'all') return bookings
        return bookings.filter(booking => booking.status === status)
    }

    const getBookingById = (id: number) => {
        return bookings.find(booking => booking.id === id)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return {
        bookings,
        loading,
        error,
        fetchBookingHistory,
        filterBookings,
        getBookingById,
        formatCurrency,
        formatDate
    }
}
