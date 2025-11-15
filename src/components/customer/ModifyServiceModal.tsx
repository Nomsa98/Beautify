'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { useAppointmentActions } from '@/hooks/useAppointmentActions'
import axios from '@/lib/axios'

interface Service {
    id: number
    name: string
    price: number
    duration_minutes: number
    category: string
    tenant_id: number
}

interface ModifyServiceModalProps {
    appointment: {
        id: number
        service_name: string
        service_id?: number
        price: number
        total_price?: number
        tenant: {
            id: number
            name: string
        }
    }
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ModifyServiceModal({ appointment, isOpen, onClose, onSuccess }: ModifyServiceModalProps) {
    const { modifyAppointment, loading } = useAppointmentActions()
    const [services, setServices] = useState<Service[]>([])
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
    const [error, setError] = useState('')
    const [loadingServices, setLoadingServices] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchServices()
        }
    }, [isOpen])

    const fetchServices = async () => {
        try {
            setLoadingServices(true)
            const response = await axios.get('/api/public/services')
            
            // Filter services from the same tenant
            const tenantServices = response.data.services?.filter(
                (s: Service) => s.tenant_id === appointment.tenant.id
            ) || []
            
            setServices(tenantServices)
        } catch (err) {
            console.error('Failed to fetch services:', err)
        } finally {
            setLoadingServices(false)
        }
    }

    if (!isOpen) return null

    const selectedService = services.find(s => s.id === selectedServiceId)
    const currentPrice = appointment.total_price || appointment.price
    const selectedPrice = selectedService ? parseFloat(selectedService.price.toString()) : 0
    const priceDifference = selectedService ? selectedPrice - currentPrice : 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!selectedServiceId) {
            setError('Please select a service')
            return
        }

        const result = await modifyAppointment(appointment.id, {
            service_id: selectedServiceId
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
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">Change Service</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Current Service */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Current Service</p>
                        <p className="font-semibold text-gray-900">{appointment.service_name}</p>
                        <p className="text-sm text-gray-600 mt-1">R{currentPrice.toFixed(2)}</p>
                    </div>

                    {/* Service Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select New Service
                        </label>
                        
                        {loadingServices ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading services...</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {services.map((service) => (
                                    <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => setSelectedServiceId(service.id)}
                                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                                            selectedServiceId === service.id
                                                ? 'border-pink-500 bg-pink-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{service.name}</p>
                                                <p className="text-sm text-gray-600 mt-1">{service.duration_minutes} minutes</p>
                                                <p className="text-xs text-gray-500 mt-1">{service.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">R{parseFloat(service.price.toString()).toFixed(2)}</p>
                                                {service.id !== appointment.service_id && (
                                                    <p className={`text-xs mt-1 ${
                                                        parseFloat(service.price.toString()) > currentPrice ? 'text-orange-600' : 'text-green-600'
                                                    }`}>
                                                        {parseFloat(service.price.toString()) > currentPrice ? '+' : ''}
                                                        R{(parseFloat(service.price.toString()) - currentPrice).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price Difference Notice */}
                    {selectedService && priceDifference !== 0 && (
                        <div className={`rounded-lg p-4 ${
                            priceDifference > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'
                        }`}>
                            <div className="flex items-start space-x-3">
                                {priceDifference > 0 ? (
                                    <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
                                )}
                                <div>
                                    <p className={`font-semibold mb-1 ${
                                        priceDifference > 0 ? 'text-orange-900' : 'text-green-900'
                                    }`}>
                                        {priceDifference > 0 ? 'Additional Charge' : 'Refund'}
                                    </p>
                                    <p className={`text-sm ${
                                        priceDifference > 0 ? 'text-orange-700' : 'text-green-700'
                                    }`}>
                                        {priceDifference > 0 
                                            ? `R${priceDifference.toFixed(2)} will be charged to your wallet.`
                                            : `R${Math.abs(priceDifference).toFixed(2)} will be refunded to your wallet.`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Policy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-700">
                                <p className="font-semibold mb-1">Service Change Policy</p>
                                <p>Services can be changed with at least 24 hours notice. Price differences will be automatically processed via your wallet.</p>
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
                            disabled={loading || !selectedServiceId}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            {loading ? 'Updating...' : 'Confirm Change'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
