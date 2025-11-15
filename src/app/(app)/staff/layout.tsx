'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loading from '@/app/(app)/Loading'

interface StaffLayoutProps {
    children: React.ReactNode
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()

    useEffect(() => {
        if (user) {
            // Check if user is staff
            const isStaff = user.roles?.includes('Staff') || user.roles?.includes('Receptionist')
            
            // If not staff, redirect to appropriate dashboard
            if (!isStaff) {
                const hasAdminAccess = user.roles?.some(role => 
                    ['Admin', 'Owner', 'Manager'].includes(role)
                )
                
                if (hasAdminAccess) {
                    router.push('/admin/dashboard')
                } else if (user.roles?.includes('Customer')) {
                    router.push('/customer/dashboard')
                }
            }
        }
    }, [user, router])

    if (!user) {
        return <Loading />
    }

    return <>{children}</>
}

export default StaffLayout
