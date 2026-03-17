'use client'

import { useState } from 'react'
import MobileCard from './MobileCardView'
import PaginationControls from './PaginationControls'

interface Column {
  key: string
  label: string
  sortable?: boolean
  hideOnMobile?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface ResponsiveDataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onPageChange?: (page: number) => void
  onRowClick?: (row: any) => void
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  emptyMessage?: string
  getMobileCardProps?: (row: any) => {
    title: string
    subtitle?: string
    badge?: { text: string; variant?: 'success' | 'warning' | 'error' | 'info' }
    metadata?: Array<{ label: string; value: string | number }>
    actions?: Array<{ label: string; onClick: () => void; icon?: any }>
  }
}

export default function ResponsiveDataTable({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  onRowClick,
  onSort,
  emptyMessage = 'No records found',
  getMobileCardProps,
}: ResponsiveDataTableProps) {
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (!onSort) return
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDirection(newDirection)
    onSort(key, newDirection)
  }

  // Desktop Table View
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <span className="text-gray-400">
                      {sortKey === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                `}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  // Mobile Card View
  const MobileCards = () => (
    <div className="md:hidden space-y-3">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
      ) : (
        data.map((row, index) => {
          const cardProps = getMobileCardProps ? getMobileCardProps(row) : {
            title: row[columns[0]?.key] || 'Untitled',
            subtitle: row[columns[1]?.key] || '',
            badge: row.status ? { text: row.status } : undefined,
            metadata: columns.slice(2, 6).map(col => ({
              label: col.label,
              value: row[col.key] || '-',
            })),
          }

          return (
            <MobileCard
              key={row.id || index}
              {...cardProps}
              onClick={() => onRowClick?.(row)}
            />
          )
        })
      )}
    </div>
  )

  return (
    <div>
      <DesktopTable />
      <MobileCards />
      
      {pagination && pagination.total > pagination.limit && (
        <div className="mt-6">
          <PaginationControls
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
