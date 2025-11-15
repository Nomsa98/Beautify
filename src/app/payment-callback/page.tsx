'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import axios from '@/lib/axios'

export default function PaymentCallback() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
    const [message, setMessage] = useState('')
    const [bookingReference, setBookingReference] = useState<string | null>(null)
    
    useEffect(() => {
        const reference = searchParams.get('reference') || searchParams.get('trxref')
        
        if (!reference) {
            setStatus('failed')
            setMessage('No payment reference found')
            return
        }
        
        verifyPayment(reference)
    }, [searchParams])
    
    const verifyPayment = async (reference: string) => {
        try {
            const response = await axios.post('/api/booking/payment-callback', {
                reference
            })
            
            if (response.data.success) {
                setStatus('success')
                setMessage('Payment successful! Your booking is confirmed.')
                const bookingRef = response.data.appointment?.booking_reference
                setBookingReference(bookingRef)
                
                // Auto-redirect to booking confirmation after 2 seconds
                if (bookingRef) {
                    setTimeout(() => {
                        router.push(`/booking-confirmation?ref=${bookingRef}`)
                    }, 2000)
                }
            } else {
                setStatus('failed')
                setMessage('Payment verification failed')
            }
        } catch (error: any) {
            console.error('Payment verification error:', error)
            setStatus('failed')
            setMessage(error.response?.data?.message || 'Payment verification failed')
        }
    }
    
    if (status === 'verifying') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="w-16 h-16 text-pink-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                        <p className="text-gray-600">Please wait while we confirm your payment...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        
                        {bookingReference && (
                            <>
                                <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                                    <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                                    <p className="text-lg font-bold text-gray-900">{bookingReference}</p>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-4">
                                    Redirecting to booking details...
                                </p>
                                
                                <Button
                                    onClick={() => router.push(`/booking-confirmation?ref=${bookingReference}`)}
                                    className="w-full bg-pink-600 hover:bg-pink-700"
                                >
                                    View Booking Details Now
                                </Button>
                            </>
                        )}
                        
                        <Button
                            onClick={() => router.push('/')}
                            variant="outline"
                            className="w-full mt-3"
                        >
                            Back to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    
                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full bg-pink-600 hover:bg-pink-700"
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={() => router.push('/')}
                            variant="outline"
                            className="w-full"
                        >
                            Back to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
