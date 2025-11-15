'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { useBookingHistory } from '@/hooks/useBookingHistory'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, DollarSign, CreditCard, History, Star, Download } from 'lucide-react'

export default function BookingHistoryPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const { bookings, loading, formatCurrency, formatDate, filterBookings } = useBookingHistory()
    const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all')

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
            completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
            confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmed' }
        }
        const config = statusConfig[status] || statusConfig.pending
        return <Badge className={config.color}>{config.label}</Badge>
    }

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
            paid: { color: 'bg-green-100 text-green-700', label: 'Paid' },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
            failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
            refunded: { color: 'bg-purple-100 text-purple-700', label: 'Refunded' }
        }
        const config = statusConfig[status] || statusConfig.pending
        return <Badge className={config.color}>{config.label}</Badge>
    }

    const filteredBookings = filterBookings(filter)

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
                    <p className="text-gray-600 mt-1">View all your past appointments and payments</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}
                >
                    All Bookings
                </Button>
                <Button
                    variant={filter === 'completed' ? 'default' : 'outline'}
                    onClick={() => setFilter('completed')}
                    className={filter === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                    Completed
                </Button>
                <Button
                    variant={filter === 'cancelled' ? 'default' : 'outline'}
                    onClick={() => setFilter('cancelled')}
                    className={filter === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                    Cancelled
                </Button>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{booking.service_name}</h3>
                                            {getStatusBadge(booking.status)}
                                            {getPaymentStatusBadge(booking.payment_status)}
                                        </div>
                                        <p className="text-sm text-gray-600">{booking.service_category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-pink-600">{formatCurrency(booking.total_price)}</p>
                                        <p className="text-sm text-gray-500 mt-1">{booking.payment_method}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{formatDate(booking.appointment_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{booking.appointment_time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{booking.tenant_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{booking.staff_name || 'Not assigned'}</span>
                                    </div>
                                </div>

                                {booking.status === 'completed' && (
                                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                        <p className="text-sm text-gray-600">How was your experience?</p>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Star className="h-4 w-4" />
                                            Rate Service
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No bookings found</p>
                            <p className="text-sm text-gray-400 mt-1">Your booking history will appear here</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
