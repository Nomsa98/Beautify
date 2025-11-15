'use client'

import { useAuth } from '@/hooks/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Building2 } from 'lucide-react'

export default function SuperAdminAnalytics() {
    const { user } = useAuth({ middleware: 'auth' })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    System Analytics
                </h1>
                <p className="text-gray-600 mt-1">Platform-wide performance metrics and insights</p>
            </div>

            {/* Coming Soon Notice */}
            <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-12">
                    <div className="text-center">
                        <div className="p-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <BarChart3 className="h-10 w-10 text-pink-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard Coming Soon</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            We're building comprehensive analytics to help you monitor platform performance, 
                            provider metrics, and user engagement.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Revenue Trends</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">User Growth</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Building2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Provider Stats</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Calendar className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Booking Metrics</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <DollarSign className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Payment Analytics</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <BarChart3 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Performance Reports</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
