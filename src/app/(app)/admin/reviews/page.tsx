'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ThumbsUp, Eye, EyeOff, Trash2, Award, Filter, MessageSquare } from 'lucide-react'
import axios from '@/lib/axios'
import { format } from 'date-fns'

interface Review {
    id: number
    user: { name: string; email: string }
    service: { name: string }
    staff?: { name: string }
    appointment: { booking_reference: string; appointment_date: string }
    service_rating: number
    staff_rating?: number
    overall_rating: number
    title?: string
    comment?: string
    is_approved: boolean
    is_featured: boolean
    is_verified: boolean
    helpful_count: number
    created_at: string
}

interface Stats {
    total_reviews: number
    approved_reviews: number
    pending_reviews: number
    average_rating: number
    featured_reviews: number
}

export default function ReviewsManagementPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<Stats>({
        total_reviews: 0,
        approved_reviews: 0,
        pending_reviews: 0,
        average_rating: 0,
        featured_reviews: 0
    })
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchReviews()
    }, [filter])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            const params: any = {}
            if (filter !== 'all') {
                params.status = filter
            }

            const response = await axios.get('/api/reviews', { params })
            if (response.data.success) {
                setReviews(response.data.data.reviews)
                setStats(response.data.data.stats)
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (reviewId: number, approve: boolean) => {
        try {
            const response = await axios.patch(`/api/reviews/${reviewId}/status`, {
                is_approved: approve
            })
            if (response.data.success) {
                fetchReviews()
            }
        } catch (error) {
            console.error('Failed to update review:', error)
        }
    }

    const handleToggleFeatured = async (reviewId: number) => {
        try {
            const response = await axios.patch(`/api/reviews/${reviewId}/toggle-featured`)
            if (response.data.success) {
                fetchReviews()
            }
        } catch (error) {
            console.error('Failed to toggle featured:', error)
        }
    }

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return

        try {
            const response = await axios.delete(`/api/reviews/${reviewId}`)
            if (response.data.success) {
                fetchReviews()
            }
        } catch (error) {
            console.error('Failed to delete review:', error)
        }
    }

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
                <p className="text-gray-600 mt-1">Monitor and manage customer feedback</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Reviews</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_reviews}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved_reviews}</p>
                            </div>
                            <Eye className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending_reviews}</p>
                            </div>
                            <Filter className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Rating</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.average_rating?.toFixed(1) || '0.0'}</p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Featured</p>
                                <p className="text-2xl font-bold text-pink-600">{stats.featured_reviews}</p>
                            </div>
                            <Award className="h-8 w-8 text-pink-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}
                >
                    All Reviews
                </Button>
                <Button
                    variant={filter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setFilter('approved')}
                    className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                    Approved
                </Button>
                <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilter('pending')}
                    className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                >
                    Pending
                </Button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <Card key={review.id} className={`${review.is_featured ? 'border-2 border-pink-300 bg-pink-50/30' : ''}`}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg">{review.title || 'Review'}</CardTitle>
                                        {review.is_verified && (
                                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                                                ✓ Verified
                                            </Badge>
                                        )}
                                        {review.is_featured && (
                                            <Badge className="bg-pink-100 text-pink-700 text-xs">
                                                ⭐ Featured
                                            </Badge>
                                        )}
                                        {!review.is_approved && (
                                            <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                                Pending Approval
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="font-medium">{review.user.name}</span>
                                        <span>•</span>
                                        <span>{review.service.name}</span>
                                        {review.staff && (
                                            <>
                                                <span>•</span>
                                                <span>Staff: {review.staff.name}</span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span>{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {!review.is_approved && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(review.id, true)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                    )}
                                    {review.is_approved && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleApprove(review.id, false)}
                                        >
                                            <EyeOff className="h-4 w-4 mr-1" />
                                            Hide
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleToggleFeatured(review.id)}
                                        className={review.is_featured ? 'bg-pink-50 border-pink-300' : ''}
                                    >
                                        <Award className="h-4 w-4 mr-1" />
                                        {review.is_featured ? 'Unfeature' : 'Feature'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(review.id)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Ratings */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Overall</p>
                                    {renderStars(review.overall_rating)}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Service</p>
                                    {renderStars(review.service_rating)}
                                </div>
                                {review.staff_rating && (
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Staff</p>
                                        {renderStars(review.staff_rating)}
                                    </div>
                                )}
                            </div>

                            {/* Comment */}
                            {review.comment && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">{review.comment}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                <span>Booking: #{review.appointment.booking_reference}</span>
                                <div className="flex items-center gap-2">
                                    <ThumbsUp className="h-3 w-3" />
                                    <span>{review.helpful_count} helpful</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {reviews.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No reviews found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
