'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, User, Star, Calendar, CheckCircle, Clock } from 'lucide-react'
import axios from '@/lib/axios'

interface Staff {
    id: number
    name: string
    email: string
    specialization?: string
    hire_date?: string
    is_available: boolean
    avatar?: string
    rating: number
    total_appointments: number
}

interface StaffSelectionModalProps {
    service: {
        id: number
        name: string
        tenant_id: number
    }
    appointmentDate?: string
    appointmentTime?: string
    isOpen: boolean
    onClose: () => void
    onSelectStaff: (staffId: number | null) => void
    selectedStaffId?: number | null
}

export default function StaffSelectionModal({
    service,
    appointmentDate,
    appointmentTime,
    isOpen,
    onClose,
    onSelectStaff,
    selectedStaffId
}: StaffSelectionModalProps) {
    const [staff, setStaff] = useState<Staff[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedId, setSelectedId] = useState<number | null>(selectedStaffId || null)

    useEffect(() => {
        if (isOpen) {
            fetchAvailableStaff()
            setSelectedId(selectedStaffId || null)
        }
    }, [isOpen, appointmentDate, appointmentTime])

    const fetchAvailableStaff = async () => {
        try {
            setLoading(true)
            const params: any = {
                service_id: service.id,
                tenant_id: service.tenant_id
            }
            
            if (appointmentDate) params.appointment_date = appointmentDate
            if (appointmentTime) params.appointment_time = appointmentTime

            const response = await axios.get('/api/public/available-staff', { params })
            
            if (response.data.success) {
                setStaff(response.data.staff)
            }
        } catch (err) {
            console.error('Failed to fetch staff:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = () => {
        onSelectStaff(selectedId)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Choose Your Stylist</h2>
                        <p className="text-sm text-gray-600 mt-1">Select a preferred staff member for {service.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading available staff...</p>
                        </div>
                    ) : (
                        <>
                            {/* No Preference Option */}
                            <button
                                onClick={() => setSelectedId(null)}
                                className={`w-full p-4 border-2 rounded-xl text-left transition-all mb-4 ${
                                    selectedId === null
                                        ? 'border-pink-500 bg-pink-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-pink-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">No Preference</p>
                                            <p className="text-sm text-gray-600">Any available staff member</p>
                                        </div>
                                    </div>
                                    {selectedId === null && (
                                        <CheckCircle className="w-6 h-6 text-pink-600" />
                                    )}
                                </div>
                            </button>

                            {/* Staff List */}
                            <div className="space-y-3">
                                {staff.map((member) => (
                                    <button
                                        key={member.id}
                                        onClick={() => setSelectedId(member.id)}
                                        disabled={!member.is_available}
                                        className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                                            selectedId === member.id
                                                ? 'border-pink-500 bg-pink-50'
                                                : member.is_available
                                                ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Avatar */}
                                                <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <User className="w-8 h-8 text-pink-700" />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-gray-900">{member.name}</p>
                                                        {!member.is_available && (
                                                            <Badge className="bg-red-100 text-red-700 text-xs">
                                                                Unavailable
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {member.specialization && (
                                                        <p className="text-sm text-purple-600 mb-2">
                                                            ✨ {member.specialization}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                                        {/* Rating */}
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            <span className="font-medium">{member.rating.toFixed(1)}</span>
                                                        </div>

                                                        {/* Appointments */}
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{member.total_appointments} appointments</span>
                                                        </div>

                                                        {/* Experience */}
                                                        {member.hire_date && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                <span>Since {new Date(member.hire_date).getFullYear()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Selection Indicator */}
                                            {selectedId === member.id && (
                                                <CheckCircle className="w-6 h-6 text-pink-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {staff.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No staff available for this service</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4 mt-6 pt-6 border-t">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            Confirm Selection
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
