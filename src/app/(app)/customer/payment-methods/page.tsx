'use client'

import { useAuth } from '@/hooks/auth'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Trash2, Check, Wallet, Building2, Smartphone } from 'lucide-react'

export default function PaymentMethodsPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const { 
        paymentMethods, 
        loading, 
        selectedMethodId, 
        setSelectedMethodId, 
        savePreferredMethod 
    } = usePaymentMethods()

    const getIcon = (type: string) => {
        switch (type) {
            case 'card':
                return <CreditCard className="h-6 w-6" />
            case 'wallet':
                return <Wallet className="h-6 w-6" />
            case 'bank_transfer':
                return <Building2 className="h-6 w-6" />
            case 'mobile':
                return <Smartphone className="h-6 w-6" />
            default:
                return <CreditCard className="h-6 w-6" />
        }
    }

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
                <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
                <p className="text-gray-600 mt-1">Choose your preferred payment method for bookings</p>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentMethods.map((method) => (
                    <Card
                        key={method.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedMethodId === method.id
                                ? 'ring-2 ring-pink-500 shadow-lg'
                                : 'hover:ring-1 hover:ring-gray-300'
                        }`}
                        onClick={() => setSelectedMethodId(method.id)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="p-3 rounded-lg"
                                    style={{ backgroundColor: `${method.color}20` }}
                                >
                                    <div style={{ color: method.color }}>
                                        {getIcon(method.type)}
                                    </div>
                                </div>
                                {selectedMethodId === method.id && (
                                    <div className="p-1 bg-pink-500 rounded-full">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{method.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{method.description}</p>
                            
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                    {method.type.replace('_', ' ')}
                                </Badge>
                                {method.processing_fee_percentage > 0 && (
                                    <span className="text-xs text-gray-500">
                                        +{method.processing_fee_percentage}% fee
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
                            <p className="text-sm text-gray-600">
                                All payment methods are secure and encrypted. You can choose your preferred payment method when booking a service.
                                Your payment information is never stored on our servers.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedMethodId && (
                <div className="flex justify-end">
                    <Button
                        onClick={() => {
                            savePreferredMethod(selectedMethodId)
                            alert('Payment method saved as default!')
                        }}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                        Save as Default
                    </Button>
                </div>
            )}
        </div>
    )
}
