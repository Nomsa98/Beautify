'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loading from '@/app/(app)/Loading'

interface AdminLayoutProps {
    children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()

    useEffect(() => {
        if (user) {
            // Check if user has admin/owner/manager role
            const hasAdminAccess = user.roles?.some(role => 
                ['Admin', 'Owner', 'Manager'].includes(role)
            )

            if (!hasAdminAccess) {
                // Redirect non-admin users to customer dashboard
                router.push('/customer/dashboard')
            }
        }
    }, [user, router])

    if (!user) {
        return <Loading />
    }

    // Check if user has admin access
    const hasAdminAccess = user.roles?.some(role => 
        ['Admin', 'Owner', 'Manager'].includes(role)
    )

    if (!hasAdminAccess) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access this area.</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export default AdminLayout
