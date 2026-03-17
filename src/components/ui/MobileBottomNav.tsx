'use client'

import { useState } from 'react'
import { Menu, X, Home, User, Bell, Settings, LogOut, ChevronDown, Truck, AlertCircle, RefreshCcw, ArrowRightLeft, FileText, MoreHorizontal, Mail, Shield, Users } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
}

export default function MobileBottomNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Shipments', href: '/shipments', icon: Truck },
    { name: 'Complaints', href: '/complaints', icon: AlertCircle },
    { name: 'Redeployments', href: '/redeployments', icon: RefreshCcw },
  { name: 'Repossessions', href: '/repossessions', icon: ArrowRightLeft },
    { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'More', href: '#more', icon: ChevronDown },
  { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Logout', href: '#logout', icon: LogOut },
  { name: 'Profile', href: '/profile', icon: User },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'More', href: '/more', icon: MoreHorizontal },
  { name: 'Email Templates', href: '/email-templates', icon: Mail },
    { name: 'Audit Logs', href: '/audit-logs', icon: Shield },
    { name: 'Permissions', href: '/permissions', icon: Users },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const filteredNavItems = navItems.filter(item => {
    if (item.href === '#more') return false
    if (item.href === '#logout') return false
    if (item.href === '/audit-logs' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') return false
    if (item.href === '/permissions' && session?.user?.role !== 'ADMIN') return false
    return true
  })

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {filteredNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </Link>
            )
          })}
          
          {/* More Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-16 left-4 right-4 bg-white rounded-2xl shadow-xl z-40 md:hidden max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email || ''}</p>
                </div>
              </div>
            </div>
            
            <div className="p-2 space-y-1">
              {navItems.filter(item => item.href.startsWith('#') || item.href === '/audit-logs' || item.href === '/permissions').map((item) => {
                const Icon = item.icon
                const isSpecial = item.href === '#logout' || item.href === '#more'
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.href === '#logout') {
                        handleLogout()
                      }
                      setIsOpen(false)
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                      isSpecial 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        </>
      )}
    </>
  )
}
