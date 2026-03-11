'use client'

import { Check } from 'lucide-react'

interface Step {
  label: string
  value: string
}

interface StatusPipelineProps {
  steps: Step[]
  currentStatus: string
  className?: string
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  // Shipment statuses
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  ORDER_SENT: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  DISPATCHED: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  IN_TRANSIT: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
  DELIVERED: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  
  // Complaint statuses
  OPEN: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  SOLVED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  
  // Repossession statuses
  COLLECTED: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  
  // Generic
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
}

// Predefined pipelines per module
export const SHIPMENT_PIPELINE: Step[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Order Sent', value: 'ORDER_SENT' },
  { label: 'Dispatched', value: 'DISPATCHED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const COMPLAINT_PIPELINE: Step[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Solved', value: 'SOLVED' },
]

export const REPOSSESSION_PIPELINE: Step[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Collected', value: 'COLLECTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const REDEPLOYMENT_PIPELINE: Step[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Order Sent', value: 'ORDER_SENT' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Completed', value: 'COMPLETED' },
]

export default function StatusPipeline({ steps, currentStatus, className = '' }: StatusPipelineProps) {
  const currentIndex = steps.findIndex(s => s.value === currentStatus)
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isLast = index === steps.length - 1
          const colors = statusColors[step.value] || statusColors.PENDING
          
          return (
            <div key={step.value} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-200 border-2
                    ${isCompleted 
                      ? 'bg-green-500 text-white border-green-500' 
                      : isCurrent 
                        ? `${colors.bg} ${colors.text} ${colors.border}` 
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium text-center
                    ${isCurrent ? colors.text : isCompleted ? 'text-green-600' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Badge component for status display in tables
export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = statusColors[status] || statusColors.PENDING
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }
  
  // Format status for display
  const formatStatus = (s: string) => {
    return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  }
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${colors.bg} ${colors.text}
        ${sizeClasses[size]}
      `}
    >
      {formatStatus(status)}
    </span>
  )
}
