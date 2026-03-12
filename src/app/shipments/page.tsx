'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Plus, Eye, Edit, Truck, Download, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { exportToCSV, exportToExcel, formatDate, formatCurrency } from '@/lib/export'
import StatusPipeline, { StatusBadge, SHIPMENT_PIPELINE } from '@/components/StatusPipeline'
import RecordDetailModal from '@/components/RecordDetailModal'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import LoadingState from '@/components/ui/LoadingState'
import PaginationControls from '@/components/ui/PaginationControls'

interface Shipment {
  id: string
  refId: string
  podName: string
  shippingAddress: string
  contactPerson: string
  mobileNumber: string
  cpus: number
  components: string | null
  serials: string | null
  trackingId: string | null
  qcReport: string | null
  signedQc: string | null
  orderDate: string
  dispatchDate: string | null
  deliveryDate: string | null
  status: string
  totalCost: number
  notes?: string
}

interface FormData {
  podName: string
  shippingAddress: string
  contactPerson: string
  mobileNumber: string
  cpus: string
  serials: string
  trackingId: string
  qcReport: string
  signedQc: string
  orderDate: string
  dispatchDate: string
  deliveryDate: string
  totalCost: string
  notes: string
}

const initialFormData: FormData = {
  podName: '',
  shippingAddress: '',
  contactPerson: '',
  mobileNumber: '',
  cpus: '1',
  serials: '',
  trackingId: '',
  qcReport: '',
  signedQc: '',
  orderDate: new Date().toISOString().split('T')[0],
  dispatchDate: '',
  deliveryDate: '',
  totalCost: '',
  notes: '',
}

const statusOptions = ['PENDING', 'ORDER_SENT', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED']

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateRange.from) params.append('dateFrom', dateRange.from)
      if (dateRange.to) params.append('dateTo', dateRange.to)

      const response = await fetch(`/api/shipments?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch shipments')

      const data = await response.json()
      setShipments(data.shipments || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalRecords(data.pagination?.total || 0)
      setError(null)
    } catch (err) {
      console.error('Error fetching shipments:', err)
      setError('Failed to load shipments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShipments()
  }, [currentPage, pageSize, searchTerm, statusFilter, dateRange.from, dateRange.to])

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, searchTerm, statusFilter, dateRange.from, dateRange.to])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateRange({ from: '', to: '' })
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateRange.from || dateRange.to

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.podName.trim()) errors.podName = 'POD name is required'
    if (!formData.shippingAddress.trim()) errors.shippingAddress = 'Shipping address is required'
    else if (formData.shippingAddress.length < 10) errors.shippingAddress = 'Address must be at least 10 characters'
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required'
    if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required'
    else if (!/^\+?[\d\s\-()]{10,15}$/.test(formData.mobileNumber)) errors.mobileNumber = 'Invalid phone format'
    if (!formData.cpus || parseInt(formData.cpus) <= 0) errors.cpus = 'CPU count is required'
    if (!formData.orderDate) errors.orderDate = 'Order date is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)

      const response = await fetch(editingShipment ? `/api/shipments/${editingShipment.id}` : '/api/shipments', {
        method: editingShipment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podName: formData.podName,
          shippingAddress: formData.shippingAddress,
          contactPerson: formData.contactPerson,
          mobileNumber: formData.mobileNumber,
          cpus: parseInt(formData.cpus) || 1,
          serials: formData.serials || null,
          trackingId: formData.trackingId || null,
          qcReport: formData.qcReport || null,
          signedQc: formData.signedQc || null,
          orderDate: formData.orderDate,
          dispatchDate: formData.dispatchDate || null,
          deliveryDate: formData.deliveryDate || null,
          totalCost: parseFloat(formData.totalCost) || 0,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors: Record<string, string> = {}
          errorData.details.forEach((detail: { field: string; message: string }) => {
            fieldErrors[detail.field] = detail.message
          })
          setFormErrors(fieldErrors)
          throw new Error('Please fix the highlighted fields')
        }
        throw new Error(errorData.error || 'Failed to save shipment')
      }

      setFormData(initialFormData)
      setFormErrors({})
      setShowAddModal(false)
      setEditingShipment(null)
      await fetchShipments()
      toast.success(editingShipment ? 'Shipment updated successfully' : 'Shipment created successfully')
    } catch (err) {
      console.error('Error saving shipment:', err)
      setFormErrors(prev => ({ ...prev, submit: err instanceof Error ? err.message : 'Failed to save shipment' }))
    } finally {
      setSubmitting(false)
    }
  }

  const openAddModal = () => {
    setEditingShipment(null)
    setFormData(initialFormData)
    setFormErrors({})
    setShowAddModal(true)
  }

  const openEditModal = (shipment: Shipment) => {
    setEditingShipment(shipment)
    setFormData({
      podName: shipment.podName,
      shippingAddress: shipment.shippingAddress,
      contactPerson: shipment.contactPerson,
      mobileNumber: shipment.mobileNumber,
      cpus: String(shipment.cpus),
      serials: shipment.serials || '',
      trackingId: shipment.trackingId || '',
      qcReport: shipment.qcReport || '',
      signedQc: shipment.signedQc || '',
      orderDate: shipment.orderDate.split('T')[0],
      dispatchDate: shipment.dispatchDate ? shipment.dispatchDate.split('T')[0] : '',
      deliveryDate: shipment.deliveryDate ? shipment.deliveryDate.split('T')[0] : '',
      totalCost: String(shipment.totalCost || ''),
      notes: shipment.notes || '',
    })
    setFormErrors({})
    setShowAddModal(true)
  }

  const handleDeleteShipment = async (shipmentId: string) => {
    if (!window.confirm('Delete this shipment?')) return

    try {
      const response = await fetch(`/api/shipments/${shipmentId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete shipment')

      toast.success('Shipment deleted successfully')
      if (selectedShipment?.id === shipmentId) {
        setSelectedShipment(null)
      }
      await fetchShipments()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete shipment')
    }
  }

  const handleAdvanceStatus = async (shipment: Shipment) => {
    const currentIndex = SHIPMENT_PIPELINE.findIndex(step => step.value === shipment.status)
    const nextStatus = SHIPMENT_PIPELINE[currentIndex + 1]?.value

    if (!nextStatus) return

    try {
      const response = await fetch(`/api/shipments/${shipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to advance shipment status')
      }

      toast.success(`Shipment moved to ${formatStatus(nextStatus)}`)
      setSelectedShipment(data)
      await fetchShipments()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to advance status')
    }
  }

  const exportRows = shipments.map(shipment => ({
    'Ref ID': shipment.refId,
    'POD Name': shipment.podName,
    CPUs: shipment.cpus,
    Components: shipment.components || '',
    'Contact Person': shipment.contactPerson,
    'Mobile Number': shipment.mobileNumber,
    'Tracking ID': shipment.trackingId || '',
    Status: formatStatus(shipment.status),
    'Order Date': formatDate(shipment.orderDate),
    'Dispatch Date': formatDate(shipment.dispatchDate),
    'Delivery Date': formatDate(shipment.deliveryDate),
    'Total Cost': formatCurrency(shipment.totalCost),
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Shipment Management</h1>
          <p className="mt-1 text-gray-500">Track and manage computer shipments to PODs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              showFilterPanel
                ? 'bg-primary-100 text-primary-700'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
          <button
            onClick={() => exportToCSV(exportRows, 'shipments')}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            CSV
          </button>
          <button
            onClick={() => exportToExcel(exportRows, 'shipments')}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            Excel
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            Add Shipment
          </button>
        </div>
      </div>

      {!showFilterPanel ? (
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by POD, Ref ID, tracking ID..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(prev => (prev === status ? 'all' : status))}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {formatStatus(status)}
                </button>
              ))}
            </div>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="px-4 py-2 text-sm text-red-600 hover:text-red-700">
                Clear
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {loading ? <LoadingState message="Loading shipments..." rows={6} /> : null}
      {error && !loading ? <ErrorState message={error} onRetry={fetchShipments} /> : null}

      {!loading && !error ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {shipments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No shipments found"
                subtitle="Try adjusting your filters or create a new shipment."
                actionLabel="Add Shipment"
                onAction={openAddModal}
                icon={<Truck className="h-10 w-10" />}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ref ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">POD Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">CPUs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shipments.map(shipment => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-mono text-sm text-gray-900">{shipment.refId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{shipment.podName}</div>
                            <div className="max-w-xs truncate text-sm text-gray-500">{shipment.shippingAddress}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-semibold text-gray-900">{shipment.cpus}</span>
                          <span className="ml-1 text-sm text-gray-500">PCs</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-gray-900">{shipment.contactPerson}</div>
                            <div className="text-sm text-gray-500">{shipment.mobileNumber}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-500">{formatDate(shipment.orderDate)}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedShipment(shipment)}
                              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              title="View shipment"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openEditModal(shipment)}
                              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              title="Edit shipment"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteShipment(shipment.id)}
                              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              title="Delete shipment"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                page={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      ) : null}

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900">{editingShipment ? 'Edit Shipment' : 'Add New Shipment'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {formErrors.submit ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formErrors.submit}</div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">POD Name <span className="text-red-500">*</span></label>
                  <input name="podName" value={formData.podName} onChange={handleInputChange} className={`w-full rounded-lg border px-3 py-2 ${formErrors.podName ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.podName ? <p className="mt-1 text-xs text-red-500">{formErrors.podName}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">CPU Count <span className="text-red-500">*</span></label>
                  <input type="number" min="1" name="cpus" value={formData.cpus} onChange={handleInputChange} className={`w-full rounded-lg border px-3 py-2 ${formErrors.cpus ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.cpus ? <p className="mt-1 text-xs text-red-500">{formErrors.cpus}</p> : <p className="mt-1 text-xs text-gray-500">Components will be auto-generated</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Contact Person <span className="text-red-500">*</span></label>
                  <input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className={`w-full rounded-lg border px-3 py-2 ${formErrors.contactPerson ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.contactPerson ? <p className="mt-1 text-xs text-red-500">{formErrors.contactPerson}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                  <input name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={`w-full rounded-lg border px-3 py-2 ${formErrors.mobileNumber ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.mobileNumber ? <p className="mt-1 text-xs text-red-500">{formErrors.mobileNumber}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Order Date <span className="text-red-500">*</span></label>
                  <input type="date" name="orderDate" value={formData.orderDate} onChange={handleInputChange} className={`w-full rounded-lg border px-3 py-2 ${formErrors.orderDate ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.orderDate ? <p className="mt-1 text-xs text-red-500">{formErrors.orderDate}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Total Cost</label>
                  <input type="number" name="totalCost" value={formData.totalCost} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Shipping Address <span className="text-red-500">*</span></label>
                <textarea name="shippingAddress" value={formData.shippingAddress} onChange={handleInputChange} rows={2} className={`w-full rounded-lg border px-3 py-2 ${formErrors.shippingAddress ? 'border-red-500' : 'border-gray-200'}`} />
                {formErrors.shippingAddress ? <p className="mt-1 text-xs text-red-500">{formErrors.shippingAddress}</p> : null}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Serial Numbers</label>
                  <input name="serials" value={formData.serials} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tracking ID</label>
                  <input name="trackingId" value={formData.trackingId} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">QC Report</label>
                  <input name="qcReport" value={formData.qcReport} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Signed QC</label>
                  <input name="signedQc" value={formData.signedQc} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingShipment(null)
                    setFormData(initialFormData)
                    setFormErrors({})
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? (editingShipment ? 'Saving...' : 'Adding...') : editingShipment ? 'Save Shipment' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedShipment ? (
        <RecordDetailModal
          title="Shipment Details"
          refId={selectedShipment.refId}
          status={<StatusBadge status={selectedShipment.status} size="md" />}
          onClose={() => setSelectedShipment(null)}
          onEdit={() => openEditModal(selectedShipment)}
          onDelete={() => handleDeleteShipment(selectedShipment.id)}
          fields={[
            {
              label: 'Status Pipeline',
              value: (
                <div className="space-y-4">
                  <StatusPipeline steps={SHIPMENT_PIPELINE} currentStatus={selectedShipment.status} />
                  <button
                    onClick={() => handleAdvanceStatus(selectedShipment)}
                    disabled={selectedShipment.status === 'COMPLETED'}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {selectedShipment.status === 'COMPLETED'
                      ? 'Completed'
                      : `Advance to ${formatStatus(SHIPMENT_PIPELINE[SHIPMENT_PIPELINE.findIndex(step => step.value === selectedShipment.status) + 1]?.value || selectedShipment.status)}`}
                  </button>
                </div>
              ),
              fullWidth: true,
            },
            { label: 'POD Name', value: selectedShipment.podName },
            { label: 'CPUs', value: selectedShipment.cpus },
            { label: 'Contact Person', value: selectedShipment.contactPerson },
            { label: 'Mobile', value: selectedShipment.mobileNumber },
            { label: 'Address', value: selectedShipment.shippingAddress, fullWidth: true },
            { label: 'Order Date', value: formatDate(selectedShipment.orderDate) },
            { label: 'Tracking ID', value: selectedShipment.trackingId || '-' },
            { label: 'Serial Numbers', value: selectedShipment.serials || '-' },
            { label: 'Components', value: selectedShipment.components || '-' },
            { label: 'QC Report', value: selectedShipment.qcReport || '-' },
            { label: 'Signed QC', value: selectedShipment.signedQc || '-' },
            ...(selectedShipment.notes ? [{ label: 'Notes', value: selectedShipment.notes, fullWidth: true }] : []),
          ]}
        />
      ) : null}
    </div>
  )
}
