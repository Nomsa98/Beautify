import { Nunito } from 'next/font/google'
import '@/app/global.css'
import { Toaster } from 'react-hot-toast'

const nunitoFont = Nunito({
    subsets: ['latin'],
    display: 'swap',
})

import type { RootLayoutProps } from '@/types'

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
    return (
        <html lang="en" className={nunitoFont.className}>
            <body className="antialiased">
                {children}
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            style: {
                                background: '#10b981',
                            },
                        },
                        error: {
                            style: {
                                background: '#ef4444',
                            },
                        },
                    }}
                />
            </body>
        </html>
    )
}

export const metadata = {
    title: 'Laravel',
}

export default RootLayout
