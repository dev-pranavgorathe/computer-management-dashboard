'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  maxWidthClassName?: string
}

export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  maxWidthClassName = 'max-w-3xl',
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white ${maxWidthClassName}`}>
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
