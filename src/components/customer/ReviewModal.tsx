'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Star } from 'lucide-react'
import axios from '@/lib/axios'

interface ReviewModalProps {
    appointment: {
        id: number
        service_name: string
        staff?: {
            name: string
        } | null
    }
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ReviewModal({
    appointment,
    isOpen,
    onClose,
    onSuccess
}: ReviewModalProps) {
    const [ratings, setRatings] = useState({
        service_rating: 0,
        staff_rating: 0,
        overall_rating: 0
    })
    const [title, setTitle] = useState('')
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleStarClick = (field: 'service_rating' | 'staff_rating' | 'overall_rating', value: number) => {
        setRatings(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: '' }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Validation
        const validationErrors: Record<string, string> = {}
        if (ratings.service_rating === 0) {
            validationErrors.service_rating = 'Please rate the service'
        }
        if (ratings.overall_rating === 0) {
            validationErrors.overall_rating = 'Please provide an overall rating'
        }
        if (appointment.staff && ratings.staff_rating === 0) {
            validationErrors.staff_rating = 'Please rate the staff member'
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try {
            setSubmitting(true)
            const response = await axios.post('/api/customer/reviews', {
                appointment_id: appointment.id,
                service_rating: ratings.service_rating,
                staff_rating: appointment.staff ? ratings.staff_rating : null,
                overall_rating: ratings.overall_rating,
                title: title,
                comment: comment
            })

            if (response.data.success) {
                onSuccess()
                onClose()
                // Reset form
                setRatings({ service_rating: 0, staff_rating: 0, overall_rating: 0 })
                setTitle('')
                setComment('')
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors)
            } else {
                setErrors({ general: error.response?.data?.message || 'Failed to submit review' })
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    const StarRating = ({ 
        label, 
        value, 
        onChange, 
        error,
        required = false 
    }: { 
        label: string
        value: number
        onChange: (value: number) => void
        error?: string
        required?: boolean
    }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            className={`h-8 w-8 ${
                                star <= value
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                    {value > 0 ? `${value}/5` : 'Not rated'}
                </span>
            </div>
            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}
        </div>
    )

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
                        <p className="text-sm text-gray-600 mt-1">{appointment.service_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {errors.general && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    {/* Overall Rating */}
                    <StarRating
                        label="Overall Experience"
                        value={ratings.overall_rating}
                        onChange={(value) => handleStarClick('overall_rating', value)}
                        error={errors.overall_rating}
                        required
                    />

                    {/* Service Rating */}
                    <StarRating
                        label="Service Quality"
                        value={ratings.service_rating}
                        onChange={(value) => handleStarClick('service_rating', value)}
                        error={errors.service_rating}
                        required
                    />

                    {/* Staff Rating */}
                    {appointment.staff && (
                        <StarRating
                            label={`Staff Performance (${appointment.staff.name})`}
                            value={ratings.staff_rating}
                            onChange={(value) => handleStarClick('staff_rating', value)}
                            error={errors.staff_rating}
                            required
                        />
                    )}

                    {/* Review Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Summarize your experience..."
                            maxLength={100}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>

                    {/* Review Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share details about your experience..."
                            maxLength={1000}
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4 border-t">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
