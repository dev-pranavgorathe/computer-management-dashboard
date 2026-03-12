'use client'

import type { ReactNode } from 'react'
import Modal from '@/components/Modal'

interface DetailField {
  label: string
  value: ReactNode
  fullWidth?: boolean
}

interface RecordDetailModalProps {
  title: string
  refId: string
  status?: ReactNode
  fields: DetailField[]
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function RecordDetailModal({
  title,
  refId,
  status,
  fields,
  onClose,
  onEdit,
  onDelete,
}: RecordDetailModalProps) {
  return (
    <Modal title={title} subtitle={refId} onClose={onClose}>
      <div className="space-y-6 p-6">
        {status ? <div className="flex flex-wrap items-center gap-3">{status}</div> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map(field => (
            <div key={field.label} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <p className="text-sm text-gray-500">{field.label}</p>
              <div className="mt-1 font-medium text-gray-900">{field.value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600">
            Close
          </button>
          {onEdit ? (
            <button onClick={onEdit} className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700">
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <button onClick={onDelete} className="rounded-lg bg-red-600 px-4 py-2 text-white">
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
