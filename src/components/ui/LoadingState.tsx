'use client'

interface LoadingStateProps {
  message?: string
  variant?: 'table' | 'cards'
  rows?: number
  cards?: number
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 gap-3 rounded-lg border border-gray-100 bg-white p-4">
      <div className="col-span-2 h-4 animate-pulse rounded bg-gray-200" />
      <div className="col-span-3 h-4 animate-pulse rounded bg-gray-200" />
      <div className="col-span-2 h-4 animate-pulse rounded bg-gray-200" />
      <div className="col-span-2 h-4 animate-pulse rounded bg-gray-200" />
      <div className="col-span-2 h-4 animate-pulse rounded bg-gray-200" />
      <div className="col-span-1 h-4 animate-pulse rounded bg-gray-200" />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mb-3 h-8 w-20 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
    </div>
  )
}

export default function LoadingState({
  message = 'Loading data...',
  variant = 'table',
  rows = 6,
  cards = 4,
}: LoadingStateProps) {
  return (
    <div className="space-y-4">
      {variant === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
          {Array.from({ length: rows }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </div>
      )}
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
