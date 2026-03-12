'use client'

import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export default function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
      {icon ? <div className="mb-4 flex justify-center text-gray-400">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
