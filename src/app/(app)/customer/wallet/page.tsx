'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { useWallet } from '@/hooks/useWallet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Calendar, DollarSign, TrendingUp, History } from 'lucide-react'

export default function WalletPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const { walletData, loading, formatCurrency } = useWallet()
    const [showAddFunds, setShowAddFunds] = useState(false)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                    <p className="text-gray-600 mt-1">Manage your balance and transactions</p>
                </div>
                <Button 
                    onClick={() => setShowAddFunds(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds
                </Button>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Wallet className="h-8 w-8" />
                            <Badge className="bg-white/20 text-white border-0">Available</Badge>
                        </div>
                        <p className="text-sm opacity-90 mb-1">Current Balance</p>
                        <h2 className="text-4xl font-bold">{formatCurrency(walletData?.balance || 0)}</h2>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <ArrowDownLeft className="h-8 w-8 text-green-600" />
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Total Credited</p>
                        <h2 className="text-3xl font-bold text-green-600">{formatCurrency(walletData?.total_credited || 0)}</h2>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <ArrowUpRight className="h-8 w-8 text-red-600" />
                            <DollarSign className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                        <h2 className="text-3xl font-bold text-red-600">{formatCurrency(walletData?.total_spent || 0)}</h2>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-pink-600" />
                        Transaction History
                    </CardTitle>
                    <CardDescription>Your recent wallet transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    {walletData?.transactions && walletData.transactions.length > 0 ? (
                        <div className="space-y-3">
                            {walletData.transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${
                                            transaction.type === 'credit' 
                                                ? 'bg-green-100' 
                                                : 'bg-red-100'
                                        }`}>
                                            {transaction.type === 'credit' ? (
                                                <ArrowDownLeft className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <ArrowUpRight className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{transaction.description}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                                                <Badge variant="outline" className="text-xs">
                                                    {transaction.reference}
                                                </Badge>
                                                <Badge className={
                                                    transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }>
                                                    {transaction.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${
                                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Balance: {formatCurrency(transaction.balance_after)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No transactions yet</p>
                            <p className="text-sm text-gray-400 mt-1">Your transaction history will appear here</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
