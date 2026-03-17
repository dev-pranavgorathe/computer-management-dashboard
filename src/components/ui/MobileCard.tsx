import React from 'react'
import { ChevronRight } ChevronLeft } ChevronUp, Home, from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

const MobileCard: React.FC<BreadcrumbItem> = ({
  label,
  href,
  current = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      {href ? (
        <a href={href} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium">{label}</span>
        </a>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{label}</span>
        </div>
      )}
    </div>
  )
}