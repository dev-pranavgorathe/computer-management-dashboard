import React from 'react'
import { ChevronRight, MoreVertical } from 'lucide-react'

interface MobileCardProps {
  title: string
  subtitle?: string
  badge?: {
    text: string
    variant?: 'success' | 'warning' | 'error' | 'info'
  }
  metadata?: Array<{
    label: string
    value: string | number
  }>
  actions?: Array<{
    label: string
    onClick: () => void
    icon?: React.ElementType
  }>
  onClick?: () => void
  className?: string
}

export default function MobileCard({
  title,
  subtitle,
  badge,
  metadata = [],
  actions = [],
  onClick,
  className = '',
}: MobileCardProps) {
  const badgeVariants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
        ${onClick ? 'cursor-pointer active:bg-gray-50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge && (
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${badgeVariants[badge.variant || 'info']}
              `}>
                {badge.text}
              </span>
            )}
            {onClick && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      {metadata.length > 0 && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            {metadata.map((item, index) => (
              <div key={index}>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 whitespace-nowrap"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
