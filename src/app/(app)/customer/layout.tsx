'use client'

import { useAuth } from '@/hooks/auth'
import Loading from '@/app/(app)/Loading'

interface CustomerLayoutProps {
    children: React.ReactNode
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })

    // Allow all authenticated users to access customer features
    // Everyone can book services, manage favorites, and view their appointments
    if (!user) {
        return <Loading />
    }

    return <>{children}</>
}

export default CustomerLayout
