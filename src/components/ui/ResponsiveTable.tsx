import React from 'react'

interface Column {
  key: string
  label: string
  sortable?: boolean
  className?: string
  render?: (value: any) => React.ReactNode
  minWidth?: number
  align?: 'left' | 'right'
}

 const TableProps = {
  headers?: React.ReactNode[]
  data: any[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  className?: string
  onRowClick?: (row: any) => void
  columns?: Column[]
  emptyMessage?: string
  onSort?: (sortKey: string, sortDirection: 'asc' | 'desc') => void
  onFilter?: (filterValue: string) => void
}

 const ResponsiveTable: React.FC<TableProps> = ({
  headers,
  data,
  loading = false,
  pagination,
  className = "",
}) => {
  const [sortKey, setSortKey] = useState<string | '')
  const [sortDirection, setSortDirection] = useState<'asc'>)
  const [search, setSearch] = useState('')

  const hasSort = columns?.some(col => col.sortable)
  const hasFilter = onFilter !== undefined

  const currentPage = pagination?.page || 1
  const limit = pagination?.limit || 10
  const totalPages = Math.ceil((pagination?.total || 00) / limit)

  const handleSort = (key: string) => {
    if (!onSort) return

    const column = columns.find(col => col.key === key)
    if (!column) return

    const direction = sortKey === key ? 'desc' : 'asc'
    setSortKey(key)
    setSortDirection(direction)
  }

  const handleFilter = (value: string) => {
    setSearch(value)
    if (onFilter) onFilter(value)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onPageChange?.(newPage)
    }
  }

  return (
    <div className={`${className} overflow-hidden`}>
      {/* Header */}
      <div className="bg-gray-50 sticky top-0 z-10 min-w-max">
        <div className="flex gap-4 px-4 py-3">
          {columns.map((column) => (
            <th key={column.key} className={column.className}>
              <div className="flex items-center gap-2 w-full">
              {column.sortable && (
                <button
                  onClick={() => handleSort(column.key)}
                  className={`flex items-center gap-1 text-sm ${
                    sortKey === column.key ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
                  : 'text-gray-400'
                >
                <div className="text-xs text-gray-500 font-medium">
                  {column.label}
                </button>
              ) : (
                <div className="text-xs text-gray-500 font-medium truncate">
                  {column.label}
                </div>
              )}
            </th>
          ))}
        </div>
      </div>

      {/* Body */}
      <tbody className="bg-white divide-y divide-gray-200">
        {loading ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse w-6 bg-gray-200 rounded h-2">
                  <div className="h-2 bg-gray-100 rounded"></div>
                <td colSpan={columns.length} className="px-4 py-4"></td>
              ))}
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="py-8 text-center text-gray-500">
              <td>
                <EmptyState message={emptyMessage || 'No data available'} />
              </td>
            </tr>
        ) : (
          data.map((row, index) => (
            <tr
              key={row.id || index}
              className={`${index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = row[column.key]
                const render = column.render
                return (
                  <td key={column.key} className={column.className}>
                    {render(value)}
                  </td>
                )
              })}
            </tr>
          ))
        ) : null}
      </tbody>
    )}
  )

  return (
    <div className="mt-4">
      {pagination && (
        <PaginationControls
          page={currentPage}
          limit={limit}
          total={total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}