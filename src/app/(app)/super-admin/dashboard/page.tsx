'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Building2, 
    TrendingUp, 
    Users, 
    DollarSign, 
    Calendar, 
    CheckCircle, 
    Clock, 
    XCircle,
    AlertCircle,
    ArrowRight
} from 'lucide-react'
import axios from '@/lib/axios'
import Link from 'next/link'

interface DashboardStats {
    providers: {
        total: number
        pending: number
        approved: number
        rejected: number
        suspended: number
    }
    platform: {
        total_services: number
        total_appointments: number
        total_revenue: number
        total_users: number
    }
    recent_providers: Array<{
        id: number
        name: string
        approval_status: string
        created_at: string
    }>
}

export default function SuperAdminDashboard() {
    const { user } = useAuth({ middleware: 'auth' })
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/providers')
            
            // Extract stats from providers response
            const providerStats = response.data.stats || {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                suspended: 0
            }

            // Get recent providers
            const recentProviders = (response.data.providers?.data || []).slice(0, 5)

            setStats({
                providers: providerStats,
                platform: {
                    total_services: 0, // TODO: Add platform-wide stats endpoint
                    total_appointments: 0,
                    total_revenue: 0,
                    total_users: 0
                },
                recent_providers: recentProviders
            })
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error)
        } finally {
            setLoading(false)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back, {user?.name}! Manage the entire platform from here.
                    </p>
                </div>
            </div>

            {/* Provider Statistics */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Provider Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Providers</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.providers.total || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Approval</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats?.providers.pending || 0}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">{stats?.providers.approved || 0}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">{stats?.providers.rejected || 0}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Suspended</p>
                                    <p className="text-2xl font-bold text-gray-600">{stats?.providers.suspended || 0}</p>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <AlertCircle className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/super-admin/providers">
                        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-pink-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Review Providers</h3>
                                        <p className="text-sm text-gray-600">
                                            {stats?.providers.pending || 0} pending approval
                                        </p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-pink-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/super-admin/analytics">
                        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">View Analytics</h3>
                                        <p className="text-sm text-gray-600">Platform-wide insights</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/super-admin/settings">
                        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Platform Settings</h3>
                                        <p className="text-sm text-gray-600">Configure system</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Recent Provider Applications */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Provider Applications</CardTitle>
                    <Link 
                        href="/super-admin/providers" 
                        className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                    >
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {stats?.recent_providers && stats.recent_providers.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recent_providers.map((provider) => (
                                <div 
                                    key={provider.id} 
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-lg">
                                            <Building2 className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{provider.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Applied {new Date(provider.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(provider.approval_status)}
                                        <Link 
                                            href="/super-admin/providers"
                                            className="text-pink-600 hover:text-pink-700"
                                        >
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No recent applications</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Alert for Pending Approvals */}
            {stats && stats.providers.pending > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Action Required</h3>
                                <p className="text-sm text-gray-700 mb-3">
                                    You have {stats.providers.pending} provider{stats.providers.pending > 1 ? 's' : ''} waiting for approval.
                                </p>
                                <Link 
                                    href="/super-admin/providers?status=pending"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Review Now
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
