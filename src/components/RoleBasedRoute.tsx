'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleBasedRouteProps {
    children: React.ReactNode
    requiredPermissions: string[]
    fallbackRoute?: string
    allowedRoles?: string[]
}

export default function RoleBasedRoute({ 
    children, 
    requiredPermissions, 
    fallbackRoute = '/dashboard',
    allowedRoles = []
}: RoleBasedRouteProps) {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()

    useEffect(() => {
        if (!user) return

        const hasPermission = requiredPermissions.some(permission => 
            user.permissions?.includes(permission)
        )

        const hasRole = allowedRoles.length === 0 || allowedRoles.some(role =>
            user.roles?.includes(role)
        )

        if (!hasPermission && !hasRole) {
            router.push(fallbackRoute)
        }
    }, [user, requiredPermissions, allowedRoles, fallbackRoute, router])

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
            </div>
        )
    }

    const hasPermission = requiredPermissions.some(permission => 
        user.permissions?.includes(permission)
    )

    const hasRole = allowedRoles.length === 0 || allowedRoles.some(role =>
        user.roles?.includes(role)
    )

    if (!hasPermission && !hasRole) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                    <button
                        onClick={() => router.push(fallbackRoute)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-md"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
