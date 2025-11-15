'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw, Download, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface Payment {
  id: number
  amount: string
  payment_method: string
  status: string
  transaction_reference: string
  created_at: string
  user: {
    name: string
    email: string
  }
  appointment: {
    booking_reference: string
    service: {
      name: string
    }
    client?: {
      name: string
    }
  }
}

interface Stats {
  today_revenue: string
  week_revenue: string
  pending_amount: string
  refunds_amount: string
  total_transactions: number
}

export default function Payments() {
  const { user } = useAuth({ middleware: 'auth' })
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [exporting, setExporting] = useState(false)

  const canProcess = user?.permissions?.includes('process payments' as any)
  const canViewReports = user?.permissions?.includes('view reports' as any)
  const canManageDiscounts = user?.permissions?.includes('manage discounts' as any)
  const canViewAnalytics = user?.permissions?.includes('view analytics' as any)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (methodFilter !== 'all') params.append('payment_method', methodFilter)
      
      const response = await axios.get(`/api/payments?${params.toString()}`)
      setPayments(response.data.payments.data || [])
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await axios.get('/api/payments/export')
      const blob = new Blob([JSON.stringify(response.data.payments, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-export-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting payments:', error)
      alert('Failed to export payments')
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [searchTerm, statusFilter, methodFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800"><RefreshCw className="w-3 h-3 mr-1" />Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const markAsPaid = async (paymentId: number) => {
    try {
      await axios.post(`/api/payments/${paymentId}/mark-paid`)
      fetchPayments()
    } catch (error) {
      console.error('Error marking payment as paid:', error)
      alert('Failed to mark payment as paid')
    }
  }

  const processRefund = async (paymentId: number) => {
    if (!confirm('Are you sure you want to refund this payment?')) return
    
    try {
      await axios.post(`/api/payments/${paymentId}/refund`)
      fetchPayments()
    } catch (error) {
      console.error('Error processing refund:', error)
      alert('Failed to process refund')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Payment Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage payments and financial transactions
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleExport}
              disabled={exporting}
              variant="outline" 
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by reference or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-green-600 font-medium">Today's Revenue</CardDescription>
                  <CardTitle className="text-2xl text-green-700">
                    {loading ? '...' : `R${parseFloat(stats?.today_revenue || '0').toFixed(2)}`}
                  </CardTitle>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-blue-600 font-medium">This Week</CardDescription>
                  <CardTitle className="text-2xl text-blue-700">
                    {loading ? '...' : `R${parseFloat(stats?.week_revenue || '0').toFixed(2)}`}
                  </CardTitle>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-purple-600 font-medium">Pending</CardDescription>
                  <CardTitle className="text-2xl text-purple-700">
                    {loading ? '...' : `R${parseFloat(stats?.pending_amount || '0').toFixed(2)}`}
                  </CardTitle>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-yellow-600 font-medium">Refunds</CardDescription>
                  <CardTitle className="text-2xl text-yellow-700">
                    {loading ? '...' : `R${parseFloat(stats?.refunds_amount || '0').toFixed(2)}`}
                  </CardTitle>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No payments found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.transaction_reference || payment.appointment.booking_reference}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.appointment.client?.name || payment.user.name}</div>
                          <div className="text-sm text-gray-500">{payment.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.appointment.service.name}</TableCell>
                      <TableCell className="font-semibold">R{parseFloat(payment.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{payment.payment_method}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payment.status === 'pending' && payment.payment_method === 'cash' && canProcess && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => markAsPaid(payment.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          {payment.status === 'completed' && canProcess && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => processRefund(payment.id)}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
