'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, Wallet, CreditCard } from 'lucide-react'
import { useAppointmentActions } from '@/hooks/useAppointmentActions'

interface CancelModalProps {
    appointment: {
        id: number
        service_name: string
        appointment_date: string
        appointment_time: string
        payment_method?: string
        payment_status?: string
        total_price?: number
        price: number
    }
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CancelModal({ appointment, isOpen, onClose, onSuccess }: CancelModalProps) {
    const { cancelAppointment, fetchCancellationPolicy, loading, policy } = useAppointmentActions()
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchCancellationPolicy()
        }
    }, [isOpen])

    if (!isOpen) return null

    const isRefundEligible = appointment.payment_method === 'Wallet' && appointment.payment_status === 'paid'
    const refundAmount = appointment.total_price || appointment.price

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const result = await cancelAppointment(appointment.id, {
            cancellation_reason: reason || undefined
        })

        if (result.success) {
            onSuccess()
            onClose()
        } else {
            setError(result.message)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Cancel Appointment</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-yellow-900 mb-1">Are you sure?</p>
                                <p className="text-sm text-yellow-700">
                                    You are about to cancel your appointment for <strong>{appointment.service_name}</strong> on{' '}
                                    {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Refund Information */}
                    {isRefundEligible ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Wallet className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-green-900 mb-1">Refund Eligible</p>
                                    <p className="text-sm text-green-700">
                                        R{refundAmount.toFixed(2)} will be refunded to your wallet immediately upon cancellation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <CreditCard className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">No Automatic Refund</p>
                                    <p className="text-sm text-gray-700">
                                        {appointment.payment_method && appointment.payment_method !== 'Wallet'
                                            ? `Payment made via ${appointment.payment_method} is non-refundable. Please contact the salon for refund inquiries.`
                                            : 'Please contact the salon regarding refund for this appointment.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancellation Policy */}
                    {policy && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="font-semibold text-blue-900 mb-2">Cancellation Policy</p>
                            <p className="text-sm text-blue-700">{policy.policy_text}</p>
                        </div>
                    )}

                    {/* Cancellation Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Cancellation (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            rows={3}
                            placeholder="Let us know why you're cancelling..."
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                        >
                            Keep Appointment
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
