'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Settings, User, Menu, X, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import CommandSearch from './CommandSearch'

interface HeaderProps {
    onMenuToggle?: () => void
    isMobileMenuOpen?: boolean
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen = false }) => {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false)

    // Command+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsCommandSearchOpen(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleLogout = async () => {
        await logout()
        router.push('/login')
    }

    const userRole = user?.roles?.[0] || 'Customer'

    return (
        <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
            <div className="flex items-center gap-4 px-6 py-4 sm:px-8 lg:px-10">
                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMenuToggle}
                    className="lg:hidden"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </Button>

                {/* Command+K Search Button */}
                <div className="flex-1 max-w-2xl hidden md:block">
                    <button
                        onClick={() => setIsCommandSearchOpen(true)}
                        className="w-full flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border border-gray-200/50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                    >
                        <Search className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                        <span className="flex-1 text-left text-sm text-gray-500 group-hover:text-gray-700 font-medium">
                            Search appointments, services, clients...
                        </span>
                        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-500 font-semibold shadow-sm">
                            <Command className="h-3 w-3" />
                            <span>K</span>
                        </div>
                    </button>
                </div>

                {/* Command Search Modal */}
                <CommandSearch 
                    isOpen={isCommandSearchOpen} 
                    onClose={() => setIsCommandSearchOpen(false)} 
                />

                <div className="flex items-center gap-4 ml-auto">
                    {/* Mobile Search Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setIsCommandSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="relative">
                                <Bell className="h-5 w-5" />
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                >
                                    3
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-96 overflow-y-auto">
                                <DropdownMenuItem className="cursor-pointer">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">New appointment booked</p>
                                        <p className="text-xs text-gray-500">John Doe - Haircut at 2:00 PM</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">Payment received</p>
                                        <p className="text-xs text-gray-500">R500 from Jane Smith</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">Appointment reminder</p>
                                        <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
                                    </div>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-center text-sm text-pink-600">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-3 py-2 transition-all">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-pink-100">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
                                    <span className="text-xs text-pink-600 font-medium">{userRole}</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1.5">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                    <div className="mt-2 inline-flex">
                                        <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-xs font-semibold">
                                            {userRole}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => router.push('/dashboard')}
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => router.push('/settings')}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="cursor-pointer text-red-600"
                                onClick={handleLogout}
                            >
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

export default Header
