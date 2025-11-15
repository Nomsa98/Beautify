'use client'

import { useAuth } from '@/hooks/auth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { Calendar, Heart, DollarSign, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CustomerDashboard() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const [stats, setStats] = useState<any>({
        my_bookings: 0,
        favorite_services: 0,
        available_salons: 0,
        year_spent: 0,
        year_visits: 0
    })

    useEffect(() => {
        fetchCustomerStats()
    }, [])

    const fetchCustomerStats = async () => {
        try {
            const appointmentsResponse = await axios.get('/api/customer/bookings')
            const favoritesResponse = await axios.get('/api/favorites')
            
            const appointments = appointmentsResponse.data || []
            const favorites = favoritesResponse.data?.data || []

            setStats({
                my_bookings: appointments.length,
                favorite_services: favorites.length,
                available_salons: 5, // This would come from API
                year_spent: 0, // This would come from API
                year_visits: appointments.filter((apt: any) => 
                    new Date(apt.appointment_date).getFullYear() === new Date().getFullYear()
                ).length
            })
        } catch (error) {
            console.error('Error fetching customer stats:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
                <p className="opacity-90">Discover amazing beauty services and book your next appointment</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-pink-800">My Bookings</h4>
                                <p className="text-2xl font-bold text-pink-600">{stats.my_bookings}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-pink-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-purple-800">Favorites</h4>
                                <p className="text-2xl font-bold text-purple-600">{stats.favorite_services}</p>
                            </div>
                            <Heart className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-indigo-800">Available Salons</h4>
                                <p className="text-2xl font-bold text-indigo-600">{stats.available_salons}</p>
                            </div>
                            <Users className="h-8 w-8 text-indigo-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-green-800">Year Spent</h4>
                                <p className="text-2xl font-bold text-green-600">R{stats.year_spent?.toLocaleString() || '0'}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-blue-800">Year Visits</h4>
                                <p className="text-2xl font-bold text-blue-600">{stats.year_visits}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/customer/services-marketplace')}>
                    <h3 className="text-lg font-bold mb-2">Browse Services</h3>
                    <p className="text-gray-600 mb-4">Explore our wide range of beauty services</p>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
                        View Services
                    </Button>
                </Card>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/customer/my-appointments')}>
                    <h3 className="text-lg font-bold mb-2">My Appointments</h3>
                    <p className="text-gray-600 mb-4">View and manage your bookings</p>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600">
                        View Appointments
                    </Button>
                </Card>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/customer/favorites')}>
                    <h3 className="text-lg font-bold mb-2">Favorites</h3>
                    <p className="text-gray-600 mb-4">Your saved favorite services</p>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600">
                        View Favorites
                    </Button>
                </Card>
            </div>
        </div>
    )
}
