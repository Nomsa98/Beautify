'use client'

import { useAuth } from '@/hooks/auth'
import React, { useState } from 'react'
import Sidebar from '@/components/shared/Sidebar'
import Header from '@/components/shared/Header'
import Loading from '@/app/(app)/Loading'
import Chatbot from '@/components/shared/Chatbot'
import { ReactNode } from 'react'

interface AppLayoutProps {
    children: ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    if (!user) {
        return <Loading />
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
                <div className="flex h-screen">
                    {/* Sidebar */}
                    <div className={`
                        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <Sidebar user={user} />
                    </div>

                    {/* Mobile overlay */}
                    {isMobileMenuOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                            onClick={toggleMobileMenu}
                        />
                    )}

                    {/* Main content area */}
                    <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                        <Header
                            onMenuToggle={toggleMobileMenu}
                            isMobileMenuOpen={isMobileMenuOpen}
                        />
                        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-pink-50/30 via-white/50 to-purple-50/30 p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
            
            {/* Chatbot - positioned outside main layout for proper z-index */}
            <Chatbot />
        </>
    )
}

export default AppLayout
