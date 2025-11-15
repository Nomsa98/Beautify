'use client'

import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, AlertCircle, Eye, Ban, RotateCcw, Building2, TrendingUp, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from '@/lib/axios'
import { useAuth } from '@/hooks/auth'

interface Provider {
    id: number
    name: string
    email: string
    phone: string
    address: string
    business_description: string | null
    business_license: string | null
    tax_id: string | null
    approval_status: 'pending' | 'approved' | 'rejected' | 'suspended'
    rejection_reason: string | null
    approved_at: string | null
    created_at: string
    is_active: boolean
}

interface ProviderStats {
    total: number
    pending: number
    approved: number
    rejected: number
    suspended: number
}

export default function ProvidersPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const [providers, setProviders] = useState<Provider[]>([])
    const [stats, setStats] = useState<ProviderStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0
    })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [showSuspendModal, setShowSuspendModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [suspensionReason, setSuspensionReason] = useState('')

    useEffect(() => {
        fetchProviders()
    }, [searchTerm, statusFilter])

    const fetchProviders = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/providers', {
                params: {
                    search: searchTerm,
                    status: statusFilter
                }
            })
            setProviders(response.data.providers.data || [])
            setStats(response.data.stats || stats)
        } catch (error) {
            console.error('Failed to fetch providers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (providerId: number) => {
        if (!confirm('Are you sure you want to approve this service provider?')) return

        try {
            await axios.patch(`/api/providers/${providerId}/approve`)
            fetchProviders()
            alert('Provider approved successfully!')
        } catch (error) {
            console.error('Failed to approve provider:', error)
            alert('Failed to approve provider')
        }
    }

    const handleReject = async () => {
        if (!selectedProvider || !rejectionReason.trim()) {
            alert('Please provide a rejection reason')
            return
        }

        try {
            await axios.patch(`/api/providers/${selectedProvider.id}/reject`, {
                reason: rejectionReason
            })
            setShowRejectModal(false)
            setRejectionReason('')
            setSelectedProvider(null)
            fetchProviders()
            alert('Provider rejected')
        } catch (error) {
            console.error('Failed to reject provider:', error)
            alert('Failed to reject provider')
        }
    }

    const handleSuspend = async () => {
        if (!selectedProvider || !suspensionReason.trim()) {
            alert('Please provide a suspension reason')
            return
        }

        try {
            await axios.patch(`/api/providers/${selectedProvider.id}/suspend`, {
                reason: suspensionReason
            })
            setShowSuspendModal(false)
            setSuspensionReason('')
            setSelectedProvider(null)
            fetchProviders()
            alert('Provider suspended')
        } catch (error) {
            console.error('Failed to suspend provider:', error)
            alert('Failed to suspend provider')
        }
    }

    const handleReactivate = async (providerId: number) => {
        if (!confirm('Are you sure you want to reactivate this provider?')) return

        try {
            await axios.patch(`/api/providers/${providerId}/reactivate`)
            fetchProviders()
            alert('Provider reactivated successfully!')
        } catch (error) {
            console.error('Failed to reactivate provider:', error)
            alert('Failed to reactivate provider')
        }
    }

    const handleViewDetails = async (provider: Provider) => {
        try {
            const response = await axios.get(`/api/providers/${provider.id}`)
            setSelectedProvider(response.data.provider)
            setShowDetailsModal(true)
        } catch (error) {
            console.error('Failed to fetch provider details:', error)
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
            suspended: { color: 'bg-gray-100 text-gray-800', label: 'Suspended' }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
        return <Badge className={config.color}>{config.label}</Badge>
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Service Provider Approval
                    </h1>
                    <p className="text-gray-600 mt-1">Review and approve salon service providers</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Providers</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Suspended</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.suspended}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <Ban className="h-6 w-6 text-gray-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by name, email, or license..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Providers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Service Providers</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading providers...</p>
                        </div>
                    ) : providers.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No providers found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">License</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Applied</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {providers.map((provider) => (
                                        <tr key={provider.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{provider.name}</p>
                                                    <p className="text-sm text-gray-500">{provider.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-gray-700">{provider.phone || 'N/A'}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-gray-700">{provider.business_license || 'N/A'}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-gray-700">
                                                    {new Date(provider.created_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4">
                                                {getStatusBadge(provider.approval_status)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(provider)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    {provider.approval_status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(provider.id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedProvider(provider)
                                                                    setShowRejectModal(true)
                                                                }}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {provider.approval_status === 'approved' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProvider(provider)
                                                                setShowSuspendModal(true)
                                                            }}
                                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Suspend"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {(provider.approval_status === 'rejected' || provider.approval_status === 'suspended') && (
                                                        <button
                                                            onClick={() => handleReactivate(provider.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Reactivate"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Provider</h2>
                        <p className="text-gray-600 mb-4">Please provide a reason for rejecting this provider:</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            rows={4}
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectionReason('')
                                }}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReject}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Reject Provider
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Suspend Provider</h2>
                        <p className="text-gray-600 mb-4">Please provide a reason for suspending this provider:</p>
                        <textarea
                            value={suspensionReason}
                            onChange={(e) => setSuspensionReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            rows={4}
                            placeholder="Enter suspension reason..."
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                onClick={() => {
                                    setShowSuspendModal(false)
                                    setSuspensionReason('')
                                }}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSuspend}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                Suspend Provider
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
