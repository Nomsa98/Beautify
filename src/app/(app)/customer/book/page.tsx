'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, ArrowLeft, CreditCard, Wallet, Banknote, Loader2, Gift, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'

interface PaymentMethod {
    id: number
    name: string
    type: string
    description: string
    processing_fee_percentage: number
    processing_fee_fixed: number
    icon: string
    color: string
}

interface Reward {
    id: number
    title: string
    description: string
    amount: number
    expires_at: string | null
}

interface Service {
    id: number
    name: string
    description: string
    price: number
    duration_minutes: number
    category: string
    image_url?: string
    tenant: {
        name: string
        phone?: string
        email?: string
    }
}

export default function BookService() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    
    const [step, setStep] = useState<'form' | 'payment' | 'processing'>('form')
    const [service, setService] = useState<Service | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [availableRewards, setAvailableRewards] = useState<Reward[]>([])
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        message: ''
    })
    
    const serviceId = searchParams.get('service')
    
    useEffect(() => {
        if (!serviceId) {
            router.push('/services-marketplace')
            return
        }
        
        loadData()
    }, [serviceId])
    
    const loadData = async () => {
        try {
            setIsLoading(true)
            
            // Load service, payment methods, and rewards in parallel
            const [serviceRes, methodsRes, rewardsRes] = await Promise.all([
                axios.get(`/api/services/${serviceId}`),
                axios.get('/api/payment-methods?active_only=true'),
                axios.get('/api/rewards/available').catch(() => ({ data: { data: [] } }))
            ])
            
            setService(serviceRes.data.data)
            setPaymentMethods(methodsRes.data.data || [])
            setAvailableRewards(rewardsRes.data.data || [])
        } catch (error) {
            console.error('Error loading data:', error)
            setErrors({ general: 'Failed to load booking data' })
        } finally {
            setIsLoading(false)
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
    
    const calculateFinalPrice = () => {
        if (!service) return 0
        const discount = selectedReward ? Math.min(selectedReward.amount, service.price) : 0
        return Math.max(0, service.price - discount)
    }
    
    const calculateTotal = (method: PaymentMethod) => {
        const basePrice = calculateFinalPrice()
        const fee = (basePrice * method.processing_fee_percentage / 100) + method.processing_fee_fixed
        return basePrice + fee
    }
    
    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        
        if (!formData.date) newErrors.date = 'Please select a date'
        if (!formData.time) newErrors.time = 'Please select a time'
        
        if (formData.date) {
            const selectedDate = new Date(formData.date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            if (selectedDate < today) {
                newErrors.date = 'Please select a future date'
            }
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    
    const handleContinueToPayment = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) return
        
        setStep('payment')
    }
    
    const handlePayment = async (paymentMethodId: number) => {
        if (!service) return
        
        try {
            setIsProcessing(true)
            setStep('processing')
            
            const response = await axios.post('/api/booking/initialize-payment', {
                service_id: serviceId,
                date: formData.date,
                time: formData.time,
                message: formData.message,
                reward_id: selectedReward?.id,
                payment_method_id: paymentMethodId
            })
            
            if (response.data.success) {
                const method = paymentMethods.find(m => m.id === paymentMethodId)
                
                if (method?.type === 'card') {
                    // Redirect to Paystack for card payment
                    window.location.href = response.data.authorization_url
                } else {
                    // Cash/Wallet - booking created, show success
                    router.push(`/customer/my-appointments?success=true`)
                }
            }
        } catch (error: any) {
            console.error('Payment error:', error)
            setErrors({ payment: error.response?.data?.message || 'Payment failed. Please try again.' })
            setStep('payment')
            setIsProcessing(false)
        }
    }
    
    const getPaymentIcon = (icon: string) => {
        const icons: Record<string, JSX.Element> = {
            'banknote': <Banknote className="w-6 h-6" />,
            'credit-card': <CreditCard className="w-6 h-6" />,
            'wallet': <Wallet className="w-6 h-6" />,
        }
        return icons[icon] || <CreditCard className="w-6 h-6" />
    }
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-pink-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }
    
    if (!service) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-600 mb-4">Service not found</p>
                        <Button onClick={() => router.push('/services-marketplace')}>
                            Browse Services
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    // Processing Screen
    if (step === 'processing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="w-16 h-16 text-pink-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
                        <p className="text-gray-600">Please wait while we process your payment</p>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    // Payment Selection Screen
    if (step === 'payment') {
        const finalPrice = calculateFinalPrice()
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <Button
                        onClick={() => setStep('form')}
                        variant="ghost"
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Payment Method</h1>
                    <p className="text-gray-600 mb-6">Select how you'd like to pay</p>
                    
                    {/* Payment Summary */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Service</span>
                                    <span className="font-medium">{service.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Base Price</span>
                                    <span className="font-medium">R{service.price}</span>
                                </div>
                                {selectedReward && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Reward Discount</span>
                                        <span className="font-medium">-R{selectedReward.amount}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                    <span>Subtotal</span>
                                    <span className="text-pink-600">R{finalPrice}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {errors.payment && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.payment}</p>
                        </div>
                    )}
                    
                    {/* Payment Methods */}
                    <div className="space-y-4">
                        {paymentMethods.map((method) => {
                            const total = calculateTotal(method)
                            const fee = total - finalPrice
                            
                            return (
                                <Card 
                                    key={method.id}
                                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-pink-500"
                                    onClick={() => handlePayment(method.id)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div 
                                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: `${method.color}20`, color: method.color }}
                                                >
                                                    {getPaymentIcon(method.icon)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                                                    <p className="text-sm text-gray-600">{method.description}</p>
                                                    {fee > 0 && (
                                                        <p className="text-xs text-orange-600 mt-1">
                                                            +{method.processing_fee_percentage}% processing fee
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-pink-600">
                                                    R{total.toFixed(2)}
                                                </p>
                                                {fee > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        (R{finalPrice} + R{fee.toFixed(2)} fee)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
    
    // Booking Form Screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Button
                    onClick={() => router.back()}
                    variant="ghost"
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
                <p className="text-gray-600 mb-6">Schedule your service with {service.tenant.name}</p>
                
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Service Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {service.image_url && (
                                <div className="aspect-video rounded-lg overflow-hidden">
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                                <p className="text-gray-600 mt-1">{service.description}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary">{service.category}</Badge>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-pink-600">R{service.price}</p>
                                    <p className="text-sm text-gray-500">{service.duration_minutes} minutes</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Salon Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{service.tenant.name}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Booking Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule Appointment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleContinueToPayment} className="space-y-6">
                                    {errors.general && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-600">{errors.general}</p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            Select Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={errors.date ? 'border-red-500' : ''}
                                        />
                                        {errors.date && (
                                            <p className="text-sm text-red-600 mt-1">{errors.date}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-2" />
                                            Select Time
                                        </label>
                                        <select
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.time ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Select a time</option>
                                            {generateTimeSlots().map((time) => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                        {errors.time && (
                                            <p className="text-sm text-red-600 mt-1">{errors.time}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="Any special requests..."
                                        />
                                    </div>
                                    
                                    <Button
                                        type="submit"
                                        className="w-full bg-pink-600 hover:bg-pink-700"
                                    >
                                        Continue to Payment
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        
                        {/* Available Rewards */}
                        {availableRewards.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Gift className="w-5 h-5 mr-2 text-pink-600" />
                                        Apply Rewards
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {availableRewards.map((reward) => (
                                            <div
                                                key={reward.id}
                                                onClick={() => setSelectedReward(selectedReward?.id === reward.id ? null : reward)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedReward?.id === reward.id
                                                        ? 'border-pink-500 border bg-pink-50'
                                                        : 'border-gray-200 border hover:border-pink-300'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                                                        {reward.expires_at && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Expires: {new Date(reward.expires_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-800 ml-4">
                                                        Save R{reward.amount}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {selectedReward && (
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                <p className="text-sm font-medium text-green-900">
                                                    🎉 R{selectedReward.amount} discount will be applied!
                                                </p>
                                                <p className="text-xs text-green-700 mt-1">
                                                    Final price: R{calculateFinalPrice()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
