'use client'

import { useSession } from 'next-auth/react'
import Sidebar from './Sidebar'
import MobileBottomNav from './ui/MobileBottomNav'
import { usePathname } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: LayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  
  // Don't show layout on auth pages
  const isAuthPage = pathname.startsWith('/auth')
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (isAuthPage || !session) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
