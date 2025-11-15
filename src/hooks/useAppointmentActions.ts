'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import type {
    RescheduleData,
    ModifyData,
    CancelData,
    CancellationPolicy
} from '@/types'

export const useAppointmentActions = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [policy, setPolicy] = useState<CancellationPolicy | null>(null)

    const rescheduleAppointment = async (appointmentId: number, data: RescheduleData) => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await axios.patch(`/api/customer/booking/${appointmentId}/reschedule`, data)
            
            return {
                success: true,
                message: response.data.message,
                appointment: response.data.appointment
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to reschedule appointment'
            setError(errorMessage)
            return {
                success: false,
                message: errorMessage
            }
        } finally {
            setLoading(false)
        }
    }

    const modifyAppointment = async (appointmentId: number, data: ModifyData) => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await axios.patch(`/api/customer/booking/${appointmentId}/modify`, data)
            
            return {
                success: true,
                message: response.data.message,
                appointment: response.data.appointment,
                priceDifference: response.data.price_difference
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to modify appointment'
            setError(errorMessage)
            return {
                success: false,
                message: errorMessage
            }
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId: number, data?: CancelData) => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await axios.patch(`/api/customer/booking/${appointmentId}/cancel`, data)
            
            return {
                success: true,
                message: response.data.message,
                refunded: response.data.refunded
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to cancel appointment'
            setError(errorMessage)
            return {
                success: false,
                message: errorMessage
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchCancellationPolicy = async () => {
        try {
            const response = await axios.get('/api/customer/cancellation-policy')
            
            if (response.data.success) {
                setPolicy(response.data.policy)
                return response.data.policy
            }
        } catch (err: any) {
            console.error('Failed to fetch cancellation policy:', err)
        }
    }

    return {
        rescheduleAppointment,
        modifyAppointment,
        cancelAppointment,
        fetchCancellationPolicy,
        loading,
        error,
        policy
    }
}
