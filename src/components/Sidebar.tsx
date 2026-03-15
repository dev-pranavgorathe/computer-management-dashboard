'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  CheckSquare
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Shipments', href: '/shipments', icon: Truck },
  { name: 'Complaints', href: '/complaints', icon: AlertCircle },
  { name: 'Repossessions', href: '/repossessions', icon: RefreshCcw },
  { name: 'Redeployments', href: '/redeployments', icon: ArrowRightLeft },
  { name: 'Email Templates', href: '/email-templates', icon: Mail },
  { name: 'Approval Queue', href: '/approvals', icon: CheckSquare },
  { name: 'Audit Logs', href: '/audit-logs', icon: Shield },
  { name: 'Summary Reports', href: '/reports', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

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
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
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
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              © 2024 Apni Pathshala
            </p>
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
