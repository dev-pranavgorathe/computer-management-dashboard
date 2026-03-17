import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  rows?: number
  className?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  rows = 3,
  className = "flex justify-center items-center py-12",
}) => {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin h-6 w-6 text-primary-600" />
        <span className="text-sm text-gray-600">{message}</span>
      </div>
      
      {/* Loading skeleton rows */}
      {rows > 1 && (
        <div className="w-full space-y-3 mt-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LoadingState
