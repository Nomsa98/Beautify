'use client'

import { useAuth } from '@/hooks/auth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { Calendar, Users, Scissors, DollarSign, Clock, Heart, CheckCircle, AlertCircle, TrendingUp, CalendarDays, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
import AppointmentCalendarCard from '@/components/AppointmentCalendarCard'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

export default function AdminDashboard() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/dashboard/stats')
            setStats(response.data.stats)
            setDashboardData(response.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
                <p className="opacity-90">Here's your salon overview for today</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-blue-800">Today's Revenue</h4>
                                <p className="text-2xl font-bold text-blue-600">
                                    R{stats?.today_revenue?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-green-800">Today's Appointments</h4>
                                <p className="text-2xl font-bold text-green-600">{stats?.today_appointments || 0}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-purple-800">Active Staff</h4>
                                <p className="text-2xl font-bold text-purple-600">{stats?.active_staff || 0}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-yellow-800">Services Offered</h4>
                                <p className="text-2xl font-bold text-yellow-600">{stats?.total_services || 0}</p>
                            </div>
                            <Scissors className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AppointmentCalendarCard
                title="Appointment Calendar"
                description="Monthly view of all appointments"
                calendarData={dashboardData?.calendar_data || []}
                eventColor="#ec4899"
                modalTitle="Appointment Details"
                showCustomerInfo={true}
                showStaffInfo={true}
                showSalonInfo={false}
            />
        </div>
    )
}
