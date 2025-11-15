export const metadata = {
    title: 'Beauty Salon Network',
}

import type { LayoutProps } from '@/types'

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    )
}

export default Layout
