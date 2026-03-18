'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Truck, 
  AlertCircle, 
  RefreshCcw, 
  ArrowRightLeft,
  Mail,
  FileText,
  Menu,
  X,
  Shield,
  CheckSquare,
  LogOut,
  Settings,
  Users,
  Monitor
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'PCs', href: '/pcs', icon: Monitor },
  { name: 'Shipments', href: '/shipments', icon: Truck },
  { name: 'Complaints', href: '/complaints', icon: AlertCircle },
  { name: 'Repossessions', href: '/repossessions', icon: RefreshCcw },
  { name: 'Redeployments', href: '/redeployments', icon: ArrowRightLeft },
  { name: 'Email Templates', href: '/email-templates', icon: Mail },
  { name: 'Approval Queue', href: '/approvals', icon: CheckSquare, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Audit Logs', href: '/audit-logs', icon: Shield, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Permissions', href: '/permissions', icon: Users, roles: ['ADMIN'] },
  { name: 'Summary Reports', href: '/reports', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = session?.user?.role || 'USER'

  const visibleNavItems = navItems.filter(item => {
    if (item.roles && !item.roles.includes(role)) {
      return false
    }
    return true
  })

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Apni Pathshala</h1>
            <p className="text-sm text-gray-500 mt-1">Computer Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-xs font-semibold text-gray-700 truncate">{session?.user?.name || 'User'}</p>
              <p className="text-[11px] text-gray-500 truncate">{session?.user?.email || '-'}</p>
              <p className="mt-1 text-[10px] text-primary-700 font-medium">Role: {role}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={16} /> Logout
            </button>
            <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} Apni Pathshala</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
