'use client'

import React, { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  className?: string
  render?: (value: any, row: any) => ReactNode
}

interface TableProps {
  data: any[]
  headers: Column[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: any) => void
  className?: string
}

export default function Table({
  data,
  headers,
  loading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  className = '',
}: TableProps) {
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
            {headers.map((h) => (
              <th
                key={h.key}
                className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase ${h.className || ''}`}
              >
                {h.label}
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
              {headers.map((h) => (
                <td key={h.key} className="px-4 py-2 text-sm text-gray-700">
                  {h.render ? h.render(row[h.key], row) : String(row[h.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
