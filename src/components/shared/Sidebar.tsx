'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
import { useAuth } from '@/hooks/auth'
import { usePathname } from 'next/navigation'
import {
    Calendar,
    Users,
    Scissors,
    Package,
    BarChart3,
    Settings,
    UserCheck,
    Bell,
    Home,
    Heart,
    UserPlus,
    CreditCard,
    Gift,
    LogOut,
    Wallet,
    Star
} from 'lucide-react'

interface SidebarProps {
    user: User
}

interface MenuItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    permission: string
    badge?: string
    roles?: string[]
}

// Role-specific menu configurations
const getRoleSpecificMenuItems = (userRole: string): MenuItem[] => {
    const adminDashboard = {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        permission: 'view dashboard'
    }

    const customerDashboard = {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        permission: 'view dashboard'
    }

    const staffDashboard = {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        permission: 'view dashboard'
    }

    switch (userRole) {
        case 'Owner':
        case 'Admin':
            return [
                adminDashboard,
                {
                    name: 'Appointments',
                    href: '/admin/appointments',
                    icon: Calendar,
                    permission: 'view appointments'
                },
                {
                    name: 'Services',
                    href: '/admin/services',
                    icon: Scissors,
                    permission: 'manage services'
                },
                {
                    name: 'Reports & Analytics',
                    href: '/admin/reports',
                    icon: BarChart3,
                    permission: 'view full reports'
                },
                {
                    name: 'Payments',
                    href: '/admin/payments',
                    icon: CreditCard,
                    permission: 'view payments'
                },
                {
                    name: 'Inventory',
                    href: '/admin/inventory',
                    icon: Package,
                    permission: 'view inventory'
                },
                {
                    name: 'Promotions',
                    href: '/admin/promotions',
                    icon: Gift,
                    permission: 'manage promotions'
                },
                {
                    name: 'Staff & Users',
                    href: '/admin/users',
                    icon: UserPlus,
                    permission: 'create users in salon'
                },
                {
                    name: 'Clients',
                    href: '/admin/clients',
                    icon: Users,
                    permission: 'view clients'
                },
                {
                    name: 'Payment Methods',
                    href: '/admin/payment-methods',
                    icon: CreditCard,
                    permission: 'manage salon profile'
                },
                {
                    name: 'System',
                    href: '/admin/system',
                    icon: Settings,
                    permission: 'manage salon profile'
                },
                {
                    name: 'Browse Services',
                    href: '/customer/services-marketplace',
                    icon: Scissors,
                    permission: 'view services'
                },
                {
                    name: 'My Bookings',
                    href: '/customer/my-appointments',
                    icon: Calendar,
                    permission: 'view services'
                },
                {
                    name: 'My Favorites',
                    href: '/customer/favorites',
                    icon: Heart,
                    permission: 'view services'
                },
                {
                    name: 'My Wallet',
                    href: '/customer/wallet',
                    icon: Wallet,
                    permission: 'view services'
                }
            ]

        case 'Manager':
            return [
                adminDashboard,
                {
                    name: 'Appointments',
                    href: '/admin/appointments',
                    icon: Calendar,
                    permission: 'view appointments'
                },
                {
                    name: 'Services',
                    href: '/admin/services',
                    icon: Scissors,
                    permission: 'manage services'
                },
                {
                    name: 'Reports & Analytics',
                    href: '/admin/reports',
                    icon: BarChart3,
                    permission: 'view reports'
                },
                {
                    name: 'Payments',
                    href: '/admin/payments',
                    icon: CreditCard,
                    permission: 'view payments'
                },
                {
                    name: 'Inventory',
                    href: '/admin/inventory',
                    icon: Package,
                    permission: 'view inventory'
                },
                {
                    name: 'Promotions',
                    href: '/admin/promotions',
                    icon: Gift,
                    permission: 'manage promotions'
                },
                {
                    name: 'Staff & Users',
                    href: '/admin/users',
                    icon: UserPlus,
                    permission: 'view staff'
                },
                {
                    name: 'Clients',
                    href: '/admin/clients',
                    icon: Users,
                    permission: 'view clients'
                },
                {
                    name: 'Payment Methods',
                    href: '/admin/payment-methods',
                    icon: CreditCard,
                    permission: 'view reports'
                },
                {
                    name: 'Browse Services',
                    href: '/customer/services-marketplace',
                    icon: Scissors,
                    permission: 'view services'
                },
                {
                    name: 'My Bookings',
                    href: '/customer/my-appointments',
                    icon: Calendar,
                    permission: 'view services'
                },
                {
                    name: 'My Favorites',
                    href: '/customer/favorites',
                    icon: Heart,
                    permission: 'view services'
                },
                {
                    name: 'My Wallet',
                    href: '/customer/wallet',
                    icon: Wallet,
                    permission: 'view services'
                }
            ]

        case 'Staff':
            return [
                staffDashboard,
                {
                    name: 'My Schedule',
                    href: '/staff/my-schedule',
                    icon: Calendar,
                    permission: 'view own schedule'
                },
                {
                    name: 'My Appointments',
                    href: '/staff/my-appointments',
                    icon: UserCheck,
                    permission: 'view own appointments'
                },
                {
                    name: 'Notifications',
                    href: '/shared/notifications',
                    icon: Bell,
                    permission: 'view services'
                },
                {
                    name: 'Browse Services',
                    href: '/customer/services-marketplace',
                    icon: Scissors,
                    permission: 'view services'
                },
                {
                    name: 'My Bookings',
                    href: '/customer/my-appointments',
                    icon: Calendar,
                    permission: 'view services'
                },
                {
                    name: 'My Favorites',
                    href: '/customer/favorites',
                    icon: Heart,
                    permission: 'view services'
                },
                {
                    name: 'My Wallet',
                    href: '/customer/wallet',
                    icon: Wallet,
                    permission: 'view services'
                }
            ]

        case 'Receptionist':
            return [
                staffDashboard,
                {
                    name: 'Appointments',
                    href: '/admin/appointments',
                    icon: Calendar,
                    permission: 'view appointment calendar'
                },
                {
                    name: 'Book Service',
                    href: '/customer/book-service',
                    icon: UserPlus,
                    permission: 'create appointments'
                },
                {
                    name: 'Services',
                    href: '/admin/services',
                    icon: Scissors,
                    permission: 'view services'
                },
                {
                    name: 'Notifications',
                    href: '/shared/notifications',
                    icon: Bell,
                    permission: 'view staff'
                },
                {
                    name: 'Browse Services',
                    href: '/customer/services-marketplace',
                    icon: Scissors,
                    permission: 'view services'
                },
                {
                    name: 'My Bookings',
                    href: '/customer/my-appointments',
                    icon: Calendar,
                    permission: 'view services'
                },
                {
                    name: 'My Favorites',
                    href: '/customer/favorites',
                    icon: Heart,
                    permission: 'view services'
                },
                {
                    name: 'My Wallet',
                    href: '/customer/wallet',
                    icon: Wallet,
                    permission: 'view services'
                }
            ]

        case 'Super Admin':
            return [
                {
                    name: 'Dashboard',
                    href: '/super-admin/dashboard',
                    icon: Home,
                    permission: 'view dashboard'
                },
                {
                    name: 'Provider Approval',
                    href: '/super-admin/providers',
                    icon: UserCheck,
                    permission: 'view dashboard'
                },
                {
                    name: 'System Analytics',
                    href: '/super-admin/analytics',
                    icon: BarChart3,
                    permission: 'view dashboard'
                },
                {
                    name: 'Platform Settings',
                    href: '/super-admin/settings',
                    icon: Settings,
                    permission: 'view dashboard'
                }
            ]

        case 'Customer':
            return [
                customerDashboard,
                {
                    name: 'Browse Services',
                    href: '/customer/services-marketplace',
                    icon: Scissors,
                    permission: 'view services'
                },
                {
                    name: 'My Appointments',
                    href: '/customer/my-appointments',
                    icon: Calendar,
                    permission: 'view own appointments'
                },
                {
                    name: 'My Favorites',
                    href: '/customer/favorites',
                    icon: Heart,
                    permission: 'view services'
                },
                {
                    name: 'My Wallet',
                    href: '/customer/wallet',
                    icon: Wallet,
                    permission: 'view services'
                },
                {
                    name: 'Payment Methods',
                    href: '/customer/payment-methods',
                    icon: CreditCard,
                    permission: 'view services'
                },
                {
                    name: 'Rewards & Offers',
                    href: '/customer/rewards',
                    icon: Gift,
                    permission: 'view services'
                }
            ]

        default:
            return [customerDashboard]
    }
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const pathname = usePathname()
    const { logout } = useAuth()

    const hasPermission = (permission: string): boolean => {
        return user.permissions?.includes(permission) || false
    }

    const userRole = user.roles?.[0] || 'Customer'
    const roleMenuItems = getRoleSpecificMenuItems(userRole)
    const visibleMenuItems = roleMenuItems.filter(item => hasPermission(item.permission))

    return (
        <div className="h-full w-64 bg-gradient-to-b from-slate-50 to-slate-100 text-slate-700 flex flex-col shadow-xl border-r border-slate-200/50">
            {/* Header */}
            <div className="p-6 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg ring-2 ring-pink-100">
                        <span className="text-white font-bold text-xl">BS</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Beauty Salon</h1>
                        <p className="text-xs text-slate-500 font-medium">Management System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
                {visibleMenuItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 scale-[1.02]'
                                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-800 hover:shadow-sm hover:scale-[1.01]'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200',
                                    isActive ? 'scale-110' : 'group-hover:scale-110',
                                    isActive
                                        ? 'text-white'
                                        : 'text-slate-500 group-hover:text-slate-700'
                                )}
                            />
                            {item.name}
                            {item.badge && (
                                <span className="ml-auto rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
                <button
                    onClick={async () => {
                        await logout()
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-red-700 rounded-xl font-semibold transition-all duration-200 border border-red-200/50 hover:shadow-md hover:scale-[1.02]"
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Sidebar
