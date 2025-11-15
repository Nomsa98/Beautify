'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreVertical, Edit, Trash2, Power, PowerOff, CreditCard, Banknote, Building2, Smartphone, Coins, MoreHorizontal } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PaymentMethod {
    id: number
    name: string
    type: string
    description?: string
    config?: Record<string, any>
    is_active: boolean
    requires_reference: boolean
    processing_fee_percentage: number
    processing_fee_fixed: number
    icon?: string
    color: string
    sort_order: number
    created_at: string
    updated_at: string
}

interface PaymentMethodType {
    name: string
    icon: string
    color: string
    requires_reference: boolean
    config_fields: Record<string, string>
}

const iconMap = {
    'banknote': Banknote,
    'credit-card': CreditCard,
    'building-2': Building2,
    'smartphone': Smartphone,
    'coins': Coins,
    'more-horizontal': MoreHorizontal,
}

export default function PaymentMethodsPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [paymentTypes, setPaymentTypes] = useState<Record<string, PaymentMethodType>>({})
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        description: '',
        config: {} as Record<string, string>,
        is_active: true,
        requires_reference: false,
        processing_fee_percentage: 0,
        processing_fee_fixed: 0,
        icon: '',
        color: '#6b7280',
        sort_order: 0,
    })

    useEffect(() => {
        fetchPaymentMethods()
        fetchPaymentTypes()
    }, [])

    const fetchPaymentMethods = async () => {
        try {
            const response = await axios.get('/api/payment-methods')
            setPaymentMethods(response.data.payment_methods)
        } catch (error) {
            toast.error('Failed to fetch payment methods')
        } finally {
            setLoading(false)
        }
    }

    const fetchPaymentTypes = async () => {
        try {
            const response = await axios.get('/api/payment-methods/types')
            setPaymentTypes(response.data.types)
        } catch (error) {
            toast.error('Failed to fetch payment types')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            const payload = {
                ...formData,
                config: Object.keys(formData.config).length > 0 ? formData.config : null,
            }

            if (editingMethod) {
                await axios.put(`/api/payment-methods/${editingMethod.id}`, payload)
                toast.success('Payment method updated successfully')
            } else {
                await axios.post('/api/payment-methods', payload)
                toast.success('Payment method created successfully')
            }

            setIsDialogOpen(false)
            resetForm()
            fetchPaymentMethods()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save payment method')
        }
    }

    const handleEdit = (method: PaymentMethod) => {
        setEditingMethod(method)
        setFormData({
            name: method.name,
            type: method.type,
            description: method.description || '',
            config: method.config || {},
            is_active: method.is_active,
            requires_reference: method.requires_reference,
            processing_fee_percentage: method.processing_fee_percentage,
            processing_fee_fixed: method.processing_fee_fixed,
            icon: method.icon || '',
            color: method.color,
            sort_order: method.sort_order,
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (method: PaymentMethod) => {
        if (!confirm('Are you sure you want to deactivate this payment method?')) return

        try {
            await axios.delete(`/api/payment-methods/${method.id}`)
            toast.success('Payment method deactivated successfully')
            fetchPaymentMethods()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to deactivate payment method')
        }
    }

    const handleToggleStatus = async (method: PaymentMethod) => {
        try {
            if (method.is_active) {
                await axios.delete(`/api/payment-methods/${method.id}`)
                toast.success('Payment method deactivated')
            } else {
                await axios.patch(`/api/payment-methods/${method.id}/reactivate`)
                toast.success('Payment method reactivated')
            }
            fetchPaymentMethods()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update payment method status')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            type: '',
            description: '',
            config: {},
            is_active: true,
            requires_reference: false,
            processing_fee_percentage: 0,
            processing_fee_fixed: 0,
            icon: '',
            color: '#6b7280',
            sort_order: 0,
        })
        setEditingMethod(null)
    }

    const handleTypeChange = (type: string) => {
        const typeConfig = paymentTypes[type]
        if (typeConfig) {
            setFormData(prev => ({
                ...prev,
                type,
                icon: typeConfig.icon,
                color: typeConfig.color,
                requires_reference: typeConfig.requires_reference,
                config: {},
            }))
        }
    }

    const handleConfigChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                [field]: value,
            },
        }))
    }

    const getIcon = (iconName: string) => {
        const IconComponent = iconMap[iconName as keyof typeof iconMap]
        return IconComponent || MoreHorizontal
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Payment Methods
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage payment methods for your salon
                        </p>
                    </div>
                    
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={resetForm}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Payment Method
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
                                </DialogTitle>
                                <DialogDescription>
                                    Configure a payment method for your salon transactions.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g., Cash, Credit Card"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="type">Type</Label>
                                        <Select value={formData.type} onValueChange={handleTypeChange} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(paymentTypes).map(([key, type]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Optional description"
                                        rows={3}
                                    />
                                </div>

                                {formData.type && paymentTypes[formData.type]?.config_fields && 
                                 Object.keys(paymentTypes[formData.type].config_fields).length > 0 && (
                                    <div>
                                        <Label>Configuration</Label>
                                        <div className="grid grid-cols-1 gap-3 mt-2">
                                            {Object.entries(paymentTypes[formData.type].config_fields).map(([field, label]) => (
                                                <div key={field}>
                                                    <Label htmlFor={field} className="text-sm">{label}</Label>
                                                    <Input
                                                        id={field}
                                                        value={formData.config[field] || ''}
                                                        onChange={(e) => handleConfigChange(field, e.target.value)}
                                                        placeholder={`Enter ${label.toLowerCase()}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="processing_fee_percentage">Processing Fee (%)</Label>
                                        <Input
                                            id="processing_fee_percentage"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={formData.processing_fee_percentage}
                                            onChange={(e) => setFormData(prev => ({ ...prev, processing_fee_percentage: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="processing_fee_fixed">Fixed Fee (R)</Label>
                                        <Input
                                            id="processing_fee_fixed"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.processing_fee_fixed}
                                            onChange={(e) => setFormData(prev => ({ ...prev, processing_fee_fixed: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="color">Color</Label>
                                        <Input
                                            id="color"
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sort_order">Sort Order</Label>
                                        <Input
                                            id="sort_order"
                                            type="number"
                                            min="0"
                                            value={formData.sort_order}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                                        {editingMethod ? 'Update' : 'Create'} Payment Method
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paymentMethods.map((method) => {
                        const IconComponent = getIcon(method.icon || 'more-horizontal')
                        return (
                            <Card key={method.id} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div 
                                    className="absolute top-0 left-0 right-0 h-1"
                                    style={{ backgroundColor: method.color }}
                                />
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div 
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${method.color}20` }}
                                            >
                                                <IconComponent 
                                                    className="w-5 h-5" 
                                                    style={{ color: method.color }}
                                                />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{method.name}</CardTitle>
                                                <CardDescription className="capitalize">
                                                    {method.type.replace('_', ' ')}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(method)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(method)}>
                                                    {method.is_active ? (
                                                        <>
                                                            <PowerOff className="w-4 h-4 mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="w-4 h-4 mr-2" />
                                                            Reactivate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                {method.is_active && (
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(method)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Status</span>
                                            <Badge variant={method.is_active ? "default" : "secondary"}>
                                                {method.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        
                                        {method.description && (
                                            <div>
                                                <span className="text-sm text-gray-600">Description</span>
                                                <p className="text-sm mt-1">{method.description}</p>
                                            </div>
                                        )}

                                        {(method.processing_fee_percentage > 0 || method.processing_fee_fixed > 0) && (
                                            <div>
                                                <span className="text-sm text-gray-600">Processing Fees</span>
                                                <div className="text-sm mt-1">
                                                    {method.processing_fee_percentage > 0 && (
                                                        <span>{method.processing_fee_percentage}%</span>
                                                    )}
                                                    {method.processing_fee_percentage > 0 && method.processing_fee_fixed > 0 && (
                                                        <span> + </span>
                                                    )}
                                                    {method.processing_fee_fixed > 0 && (
                                                        <span>R{method.processing_fee_fixed}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {method.requires_reference && (
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline" className="text-xs">
                                                    Requires Reference
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {paymentMethods.length === 0 && (
                    <div className="text-center py-12">
                        <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                        <p className="text-gray-600 mb-6">Get started by adding your first payment method.</p>
                        <Button 
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment Method
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
