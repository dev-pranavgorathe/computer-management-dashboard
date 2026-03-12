'use client'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
