'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface StatusStep {
  label: string
  value: string
}

interface StatusPipelineVisualProps {
  steps: StatusStep[]
  currentStatus: string
  onStatusChange?: (status: string) => void
  readOnly?: boolean
  isCompleted?: boolean
}

export default function StatusPipelineVisual({
  steps,
  currentStatus,
  onStatusChange,
  readOnly = false,
  isCompleted = false,
}: StatusPipelineVisualProps) {
  const currentIdx = steps.findIndex(s => s.value === currentStatus)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 fade-in">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Status Pipeline
      </div>
      <div className="flex items-center overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const done = i < currentIdx
          const current = i === currentIdx
          const upcoming = i > currentIdx
          const dotColor = done ? '#22c55e' : current ? '#3b82f6' : '#d1d5db'
          const lineColor = i < currentIdx ? '#22c55e' : '#e5e7eb'
          const canClick = !upcoming && !isCompleted && onStatusChange && !readOnly

          return (
            <div key={step.value} className="flex items-center" style={{ flex: i < steps.length - 1 ? 1 : 0 }}>
              <div className="flex flex-col items-center gap-1 min-w-[80px]">
                <button
                  onClick={() => canClick && onStatusChange(step.value)}
                  disabled={!canClick}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    canClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                  }`}
                  style={{
                    background: done ? '#22c55e' : current ? '#3b82f6' : '#f1f5f9',
                    border: `2px solid ${dotColor}`,
                  }}
                >
                  {done ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  ) : current ? (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  )}
                </button>
                <span
                  className="text-xs font-medium text-center whitespace-nowrap"
                  style={{ color: current ? '#3b82f6' : done ? '#15803d' : '#94a3b8' }}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="h-0.5 flex-1 mx-1"
                  style={{ background: lineColor, minHeight: '2px' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Status configurations
export const SHIPMENT_STATUS_PIPELINE = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Order Sent', value: 'ORDER_SENT' },
  { label: 'Dispatched', value: 'DISPATCHED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const COMPLAINT_STATUS_PIPELINE = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Solved', value: 'SOLVED' },
]

export const REPOSSESSION_STATUS_PIPELINE = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Informed', value: 'INFORMED' },
  { label: 'In Process', value: 'IN_PROCESS' },
  { label: 'Received', value: 'RECEIVED' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const REDEPLOYMENT_STATUS_PIPELINE = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Order Sent', value: 'ORDER_SENT' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Completed', value: 'COMPLETED' },
]
