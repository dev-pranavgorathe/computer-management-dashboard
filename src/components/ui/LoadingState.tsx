import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  rows?: number
  className?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({
  rows = 3,
  className = "flex justify-center items-center py-12",
}) => {
  return (
    <div className="flex items-center gap-3">
      <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
      <span className="text-sm text-gray-500">Loading data...</span>
    </div>
  )
}

export default LoadingState
