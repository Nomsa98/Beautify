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

export default function Dashboard() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Check if user is customer
    const isCustomer = user?.roles?.includes('Customer')
    const isAdmin = user?.roles?.some(role => ['Admin', 'Owner', 'Manager'].includes(role))

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

    // Customer Dashboard
    if (isCustomer && !isAdmin) {
        return (
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! ✨</h2>
                    <p className="text-lg opacity-90">Your personal beauty dashboard</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-all hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-full bg-pink-500 flex items-center justify-center mb-3">
                                    <Calendar className="h-7 w-7 text-white" />
                                </div>
                                <h4 className="text-xs font-medium text-pink-800 mb-1 uppercase tracking-wide">My Bookings</h4>
                                <p className="text-3xl font-bold text-pink-600">{stats?.my_bookings || 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-full bg-purple-500 flex items-center justify-center mb-3">
                                    <Heart className="h-7 w-7 text-white" />
                                </div>
                                <h4 className="text-xs font-medium text-purple-800 mb-1 uppercase tracking-wide">Favorites</h4>
                                <p className="text-3xl font-bold text-purple-600">{stats?.favorite_services || 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-full bg-indigo-500 flex items-center justify-center mb-3">
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                                <h4 className="text-xs font-medium text-indigo-800 mb-1 uppercase tracking-wide">Salons</h4>
                                <p className="text-3xl font-bold text-indigo-600">{stats?.available_salons || 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center mb-3">
                                    <DollarSign className="h-7 w-7 text-white" />
                                </div>
                                <h4 className="text-xs font-medium text-green-800 mb-1 uppercase tracking-wide">Year Spent</h4>
                                <p className="text-2xl font-bold text-green-600">R{stats?.year_spent?.toLocaleString() || '0'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center mb-3">
                                    <TrendingUp className="h-7 w-7 text-white" />
                                </div>
                                <h4 className="text-xs font-medium text-blue-800 mb-1 uppercase tracking-wide">Year Visits</h4>
                                <p className="text-3xl font-bold text-blue-600">{stats?.year_visits || 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row - Right after stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Spending Trend Chart */}
                    {dashboardData?.spending_trend && dashboardData.spending_trend.length > 0 && (
                        <Card className="shadow-xl border-0 overflow-hidden">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <DollarSign className="h-6 w-6" />
                                    My Spending Trend
                                </CardTitle>
                                <CardDescription className="text-white/80 mt-1">Your spending over the last 6 months</CardDescription>
                            </div>
                            <CardContent className="p-6">
                                <ReactECharts
                                    option={{
                                        tooltip: { 
                                            trigger: 'axis',
                                            formatter: (params: any) => {
                                                return `${params[0].name}<br/>R${params[0].value.toLocaleString()}`
                                            }
                                        },
                                        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                                        xAxis: {
                                            type: 'category',
                                            data: dashboardData.spending_trend.map((item: any) => item.month),
                                            axisLine: { lineStyle: { color: '#e5e7eb' } },
                                            axisLabel: { color: '#6b7280' }
                                        },
                                        yAxis: { 
                                            type: 'value',
                                            axisLine: { lineStyle: { color: '#e5e7eb' } },
                                            axisLabel: { color: '#6b7280' },
                                            splitLine: { lineStyle: { color: '#f3f4f6' } }
                                        },
                                        series: [{
                                            data: dashboardData.spending_trend.map((item: any) => item.spending),
                                            type: 'line',
                                            smooth: true,
                                            symbol: 'circle',
                                            symbolSize: 8,
                                            itemStyle: { color: '#ec4899' },
                                            lineStyle: { width: 3 },
                                            areaStyle: { 
                                                color: {
                                                    type: 'linear',
                                                    x: 0,
                                                    y: 0,
                                                    x2: 0,
                                                    y2: 1,
                                                    colorStops: [
                                                        { offset: 0, color: 'rgba(236, 72, 153, 0.5)' },
                                                        { offset: 1, color: 'rgba(236, 72, 153, 0.05)' }
                                                    ]
                                                }
                                            }
                                        }]
                                    }}
                                    style={{ height: '320px' }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Service Preferences Chart */}
                    {dashboardData?.service_preferences && dashboardData.service_preferences.length > 0 && (
                        <Card className="shadow-xl border-0 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Star className="h-6 w-6" />
                                    My Service Preferences
                                </CardTitle>
                                <CardDescription className="text-white/80 mt-1">Your favorite service categories</CardDescription>
                            </div>
                            <CardContent className="p-6">
                                <ReactECharts
                                    option={{
                                        tooltip: { 
                                            trigger: 'item',
                                            formatter: '{b}: {c} visits ({d}%)'
                                        },
                                        series: [{
                                            type: 'pie',
                                            radius: ['45%', '75%'],
                                            avoidLabelOverlap: false,
                                            label: {
                                                show: true,
                                                position: 'outside',
                                                formatter: '{b}\n{d}%',
                                                fontSize: 12
                                            },
                                            labelLine: { show: true, length: 15, length2: 10 },
                                            data: dashboardData.service_preferences.map((item: any, index: number) => ({
                                                value: item.count,
                                                name: item.category,
                                                itemStyle: {
                                                    color: ['#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4'][index % 5]
                                                }
                                            })),
                                            emphasis: {
                                                itemStyle: {
                                                    shadowBlur: 10,
                                                    shadowOffsetX: 0,
                                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                                },
                                                label: { fontSize: 14, fontWeight: 'bold' }
                                            }
                                        }]
                                    }}
                                    style={{ height: '320px' }}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <AppointmentCalendarCard
                            title="My Appointments Calendar"
                            description="Your upcoming bookings and appointments"
                            calendarData={dashboardData?.calendar_data || []}
                            eventColor="#ec4899"
                            modalTitle="Appointment Details"
                            showCustomerInfo={false}
                            showStaffInfo={true}
                            showSalonInfo={true}
                        />
                    </div>

                    {/* Quick Actions - Takes 1 column */}
                    <div className="space-y-4">
                        <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/customer/services-marketplace')}>
                            <CardContent className="p-6">
                                <Scissors className="h-12 w-12 mb-4 opacity-90" />
                                <h3 className="text-xl font-bold mb-2">Browse Services</h3>
                                <p className="text-sm opacity-90 mb-4">Explore beauty services from top salons</p>
                                <div className="flex items-center text-sm font-semibold">
                                    <span>View Services</span>
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/customer/my-appointments')}>
                            <CardContent className="p-6">
                                <Calendar className="h-12 w-12 mb-4 opacity-90" />
                                <h3 className="text-xl font-bold mb-2">My Appointments</h3>
                                <p className="text-sm opacity-90 mb-4">Manage your bookings and history</p>
                                <div className="flex items-center text-sm font-semibold">
                                    <span>View All</span>
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/customer/favorites')}>
                            <CardContent className="p-6">
                                <Heart className="h-12 w-12 mb-4 opacity-90" />
                                <h3 className="text-xl font-bold mb-2">My Favorites</h3>
                                <p className="text-sm opacity-90 mb-4">Your saved favorite services</p>
                                <div className="flex items-center text-sm font-semibold">
                                    <span>View Favorites</span>
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Appointments */}
                {dashboardData?.appointment_history && dashboardData.appointment_history.length > 0 && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Recent Appointments
                            </CardTitle>
                            <CardDescription>Your appointment history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dashboardData.appointment_history.slice(0, 5).map((appointment: any) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {appointment.service?.name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{appointment.service?.name || 'Service'}</h4>
                                                <p className="text-sm text-gray-600">{appointment.tenant?.name || 'Salon'} • {appointment.staff?.name || 'Staff'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">R{appointment.price?.toLocaleString() || '0'}</p>
                                            <p className="text-sm text-gray-600">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    // Admin/Staff Dashboard with Charts
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

            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Last 7 days revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboardData?.revenue_trend && (
                        <ReactECharts
                            option={{
                                tooltip: { trigger: 'axis' },
                                xAxis: {
                                    type: 'category',
                                    data: dashboardData.revenue_trend.map((item: any) => item.date)
                                },
                                yAxis: { type: 'value' },
                                series: [{
                                    data: dashboardData.revenue_trend.map((item: any) => item.revenue),
                                    type: 'line',
                                    smooth: true,
                                    itemStyle: { color: '#ec4899' },
                                    areaStyle: { color: 'rgba(236, 72, 153, 0.2)' }
                                }]
                            }}
                            style={{ height: '300px' }}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Popular Services Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Popular Services</CardTitle>
                    <CardDescription>Top performing services this month</CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboardData?.popular_services && (
                        <ReactECharts
                            option={{
                                tooltip: { trigger: 'item' },
                                series: [{
                                    type: 'pie',
                                    radius: '70%',
                                    data: dashboardData.popular_services.map((item: any) => ({
                                        value: item.appointments_count,
                                        name: item.name
                                    })),
                                    emphasis: {
                                        itemStyle: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }]
                            }}
                            style={{ height: '300px' }}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Monthly Appointments Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Appointments Trend</CardTitle>
                    <CardDescription>Last 6 months appointment statistics</CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboardData?.monthly_trend && (
                        <ReactECharts
                            option={{
                                tooltip: { trigger: 'axis' },
                                xAxis: {
                                    type: 'category',
                                    data: dashboardData.monthly_trend.map((item: any) => item.month)
                                },
                                yAxis: { type: 'value' },
                                series: [
                                    {
                                        name: 'Appointments',
                                        type: 'bar',
                                        data: dashboardData.monthly_trend.map((item: any) => item.appointments),
                                        itemStyle: { 
                                            color: {
                                                type: 'linear',
                                                x: 0,
                                                y: 0,
                                                x2: 0,
                                                y2: 1,
                                                colorStops: [
                                                    { offset: 0, color: '#a855f7' },
                                                    { offset: 1, color: '#ec4899' }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }}
                            style={{ height: '300px' }}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
