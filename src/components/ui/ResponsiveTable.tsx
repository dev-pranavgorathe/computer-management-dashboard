'use client'

import React, { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  className?: string
  render?: (value: any, row: any) => ReactNode
}

interface ResponsiveTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: any) => void
  className?: string
}

export default function ResponsiveTable({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
  className = '',
}: ResponsiveTableProps) {
  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading...</div>
  }

  if (!data.length) {
    return <div className="p-4 text-sm text-gray-500">{emptyMessage}</div>
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row, idx) => (
            <tr
              key={row.id ?? idx}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 text-sm text-gray-700">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
