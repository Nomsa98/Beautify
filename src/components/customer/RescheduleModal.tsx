'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, X, AlertCircle } from 'lucide-react'
import { useAppointmentActions } from '@/hooks/useAppointmentActions'

interface RescheduleModalProps {
    appointment: {
        id: number
        service_name: string
        appointment_date: string
        appointment_time: string
    }
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function RescheduleModal({ appointment, isOpen, onClose, onSuccess }: RescheduleModalProps) {
    const { rescheduleAppointment, loading } = useAppointmentActions()
    const [newDate, setNewDate] = useState('')
    const [newTime, setNewTime] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!newDate || !newTime) {
            setError('Please select both date and time')
            return
        }

        const result = await rescheduleAppointment(appointment.id, {
            appointment_date: newDate,
            appointment_time: newTime
        })

        if (result.success) {
            onSuccess()
            onClose()
        } else {
            setError(result.message)
        }
    }

    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 9; hour <= 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                slots.push(time)
            }
        }
        return slots
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Current Appointment Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Current Appointment</p>
                        <p className="font-semibold text-gray-900">{appointment.service_name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                        </p>
                    </div>

                    {/* New Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            New Date
                        </label>
                        <Input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full"
                        />
                    </div>

                    {/* New Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="inline w-4 h-4 mr-1" />
                            New Time
                        </label>
                        <select
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="">Select time</option>
                            {generateTimeSlots().map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>

                    {/* Policy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-700">
                                <p className="font-semibold mb-1">Rescheduling Policy</p>
                                <p>Appointments can be rescheduled with at least 24 hours notice at no additional charge.</p>
                            </div>
                        </div>
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
