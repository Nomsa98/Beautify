'use client'

import { useAuth } from '@/hooks/auth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, CheckCircle, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StaffDashboard() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const [stats, setStats] = useState<any>({
        my_appointments: 0,
        today_hours: 0,
        completed_today: 0,
        week_earnings: 0
    })

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Hello, {user?.name}!</h2>
                <p className="opacity-90">Your schedule and appointments for today</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-green-800">My Appointments</h4>
                                <p className="text-2xl font-bold text-green-600">{stats.my_appointments}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-blue-800">Hours Today</h4>
                                <p className="text-2xl font-bold text-blue-600">{stats.today_hours}h</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-purple-800">Completed</h4>
                                <p className="text-2xl font-bold text-purple-600">{stats.completed_today}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-yellow-800">Week Earnings</h4>
                                <p className="text-2xl font-bold text-yellow-600">
                                    R{stats.week_earnings?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600"
                        onClick={() => router.push('/staff/my-schedule')}
                    >
                        View My Schedule
                    </Button>
                    <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                        onClick={() => router.push('/staff/my-appointments')}
                    >
                        My Appointments
                    </Button>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Coming Soon</h3>
                <p className="text-yellow-700">
                    Full schedule management and appointment tracking features are being developed.
                </p>
            </div>
        </div>
    )
}
