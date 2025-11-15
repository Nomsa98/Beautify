'use client'

import { useAuth } from '@/hooks/auth'
import Loading from '@/app/(app)/Loading'

interface SharedLayoutProps {
    children: React.ReactNode
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })

    if (!user) {
        return <Loading />
    }

    return <>{children}</>
}

export default SharedLayout
