'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus, Eye, Edit, Trash2, Download, Calendar, DollarSign, TrendingUp, Users, Filter, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from '@/lib/axios'
import { useAuth } from '@/hooks/auth'

interface Client {
    id: number
    name: string
    email: string
    phone: string
    date_of_birth: string | null
    address: string | null
    emergency_contact: string | null
    emergency_phone: string | null
    notes: string | null
    is_active: boolean
    created_at: string
    appointments_count?: number
    total_spent?: number
    last_visit?: string
}

interface ClientStats {
    total_clients: number
    active_this_month: number
    new_this_week: number
    vip_clients: number
}

export default function ClientsPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const [clients, setClients] = useState<Client[]>([])
    const [stats, setStats] = useState<ClientStats>({
        total_clients: 0,
        active_this_month: 0,
        new_this_week: 0,
        vip_clients: 0
    })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)

    useEffect(() => {
        fetchClients()
    }, [searchTerm, statusFilter])

    const fetchClients = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/clients', {
                params: {
                    search: searchTerm,
                    status: statusFilter
                }
            })
            setClients(response.data.clients.data || [])
            setStats(response.data.stats || stats)
        } catch (error) {
            console.error('Failed to fetch clients:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/clients/export/all')
            const blob = new Blob([JSON.stringify(response.data.clients, null, 2)], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `clients-export-${new Date().toISOString().split('T')[0]}.json`
            a.click()
        } catch (error) {
            console.error('Failed to export clients:', error)
        }
    }

    const handleViewDetails = async (client: Client) => {
        try {
            const response = await axios.get(`/api/clients/${client.id}`)
            setSelectedClient(response.data.client)
            setShowDetailsModal(true)
        } catch (error) {
            console.error('Failed to fetch client details:', error)
        }
    }

    const handleDeactivate = async (clientId: number) => {
        if (!confirm('Are you sure you want to deactivate this client?')) return

        try {
            await axios.delete(`/api/clients/${clientId}`)
            fetchClients()
        } catch (error) {
            console.error('Failed to deactivate client:', error)
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Client Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your salon clients and their information</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex items-center gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Client
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Clients</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
                            </div>
                            <div className="p-3 bg-pink-100 rounded-lg">
                                <Users className="h-6 w-6 text-pink-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active This Month</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.active_this_month}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">New This Week</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.new_this_week}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <UserPlus className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">VIP Clients</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.vip_clients}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-yellow-600" />
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
                                placeholder="Search by name, email, or phone..."
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
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Clients List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading clients...</p>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No clients found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{client.name}</p>
                                                    <p className="text-sm text-gray-500">{client.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-gray-700">{client.phone || 'N/A'}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-gray-700">
                                                    {new Date(client.created_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge variant={client.is_active ? 'default' : 'secondary'}>
                                                    {client.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(client)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeactivate(client.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Deactivate"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
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

            {/* Client Details Modal */}
            {showDetailsModal && selectedClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Client Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium text-gray-900">{selectedClient.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-900">{selectedClient.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium text-gray-900">{selectedClient.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date of Birth</p>
                                    <p className="font-medium text-gray-900">
                                        {selectedClient.date_of_birth ? new Date(selectedClient.date_of_birth).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Address</p>
                                    <p className="font-medium text-gray-900">{selectedClient.address || 'N/A'}</p>
                                </div>
                                {selectedClient.notes && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Notes</p>
                                        <p className="font-medium text-gray-900">{selectedClient.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
