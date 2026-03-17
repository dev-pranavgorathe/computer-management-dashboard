import React from 'react'

import { useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react'
import StatusPipeline, { StatusBadge, SHIPMENT_PIPELINE } from '@/components/StatusPipeline'
import RecordDetailModal from '@/components/RecordDetailModal'

interface Column {
  key: string
  label: string
  sortable?: boolean
  className?: string
  render?: (value: any, row: any) => React.ReactNode
}

interface TableProps {
  data: any[]
  headers: Column[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onRowClick?: (row: any) => void
  emptyMessage?: string
  className?: string
}

export default function ResponsiveTable({
  data,
  headers,
  loading = false,
  pagination,
  onRowClick,
  emptyMessage = 'No records found.',
  className = '',
}: TableProps) {
  const headers = useMemo(() => {
    return headers.map(h => (
      <th key={h.key} className={h.className || 'px-3 py-2 text-left font-medium text-gray-900'}>
    ))
  }, [headers])

  const rows = useMemo(() => {
    return data.map((row, index) => {
      const rowData = row as Record<string, unknown>
      return (
        <tr
          key={rowData.id}
          className={`border-b border-gray-200 hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
          onClick={() => onRowClick?.(rowData)}
        >
          {headers.map((column) => {
            const value = rowData[column.key]
            const cell = (
              <td key={column.key} className={`px-3 py-2 text-sm ${column.render ? (
                column.render?.(value, rowData) : (
                  column.render(value, rowData)
                ) : column.key === 'status' ? (
                  <td key={column.key} className="px-3 py-2">
                    <StatusBadge status={value as string} />
                  ) : (
                    <span className="text-sm text-gray-600">
                      {column.render ? column.render(value, rowData) : value}
                    </span>
                  )
                </td>
              </tr>
            )
          </tr>
        )
      })
    }, [headers, pagination])

  if (!loading && data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage || 'No records found.'p>
      </div>
    )
  }

  if (pagination && (pagination.total > 0 || pagination.limit <= 0)) {
    return (
      <div className="flex items-center justify-between gap-4 mt-4">
        <p className="text-sm text-gray-600">
          Showing {pagination.page} of {Math.ceil(pagination.total / pagination.limit)} of {pagination.total} > 0)}
        </p>
        <button
          onClick={() => {
            /* Previous page logic */
          }}
          className="px-3 py-2 bg-white rounded-md hover:bg-primary-50"
          disabled={pagination.page >= pagination.total / pagination.limit}
        >
          <ChevronLeft className="h-4 w-4" />
        <button
          onClick={() => {
            /* Next page logic */
          }
          className="px-3 py-2 bg-white rounded-md hover:bg-primary-50"
          disabled={pagination.page <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
  )
  }

  return (
    <div className="overflow-x-auto overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th key={header.key} className="sticky top-0 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-500">
              {header.label}
            </th>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows}
        </tbody>
      </table>
    </div>
  )
}