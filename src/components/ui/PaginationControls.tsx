'use client'

interface PaginationControlsProps {
  page: number
  totalPages: number
  totalRecords: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function getPageNumbers(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  return Array.from(pages)
    .filter(item => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)
}

export default function PaginationControls({
  page,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, totalRecords)
  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 text-sm text-gray-500 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span>
          Showing {startRecord}-{endRecord} of {totalRecords}
        </span>
        <label className="flex items-center gap-2">
          <span>Page size</span>
          <select
            value={pageSize}
            onChange={event => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
          >
            {[25, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        {pageNumbers.map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-lg px-3 py-1.5 ${
              pageNumber === page
                ? 'bg-primary-600 text-white'
                : 'border border-gray-200 text-gray-700'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
