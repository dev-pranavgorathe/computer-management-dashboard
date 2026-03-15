'use client'

import { useEffect, useState } from 'react'
import { ArrowRightLeft, Download, Edit, Eye, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Modal from '@/components/Modal'
import { exportToCSV, exportToExcel, formatDate } from '@/lib/export'

interface Redeployment {
  id: string
  refId: string
  podName: string
  shippingAddress?: string | null
  contactPerson?: string | null
  mobileNumber?: string | null
  sourcePod?: string | null
  components?: string | null
  serials?: string | null
  complaintTicket?: string | null
  trackingId?: string | null
  orderDate: string
  dispatchDate?: string | null
  deliveryDate?: string | null
  notes?: string | null
  status: 'PENDING' | 'ORDER_SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED'
  createdAt: string
}

interface RedeploymentFormData {
  podName: string
  shippingAddress: string
  contactPerson: string
  mobileNumber: string
  sourcePod: string
  components: string
  serials: string
  complaintTicket: string
  trackingId: string
  orderDate: string
  dispatchDate: string
  deliveryDate: string
  notes: string
  status: Redeployment['status']
}

const initialFormData: RedeploymentFormData = {
  podName: '',
  shippingAddress: '',
  contactPerson: '',
  mobileNumber: '',
  sourcePod: '',
  components: '',
  serials: '',
  complaintTicket: '',
  trackingId: '',
  orderDate: new Date().toISOString().split('T')[0],
  dispatchDate: '',
  deliveryDate: '',
  notes: '',
  status: 'PENDING',
}

const statusColors: Record<Redeployment['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ORDER_SENT: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

function getFormData(item?: Redeployment | null): RedeploymentFormData {
  if (!item) return initialFormData

  return {
    podName: item.podName,
    shippingAddress: item.shippingAddress || '',
    contactPerson: item.contactPerson || '',
    mobileNumber: item.mobileNumber || '',
    sourcePod: item.sourcePod || '',
    components: item.components || '',
    serials: item.serials || '',
    complaintTicket: item.complaintTicket || '',
    trackingId: item.trackingId || '',
    orderDate: item.orderDate.split('T')[0],
    dispatchDate: item.dispatchDate ? item.dispatchDate.split('T')[0] : '',
    deliveryDate: item.deliveryDate ? item.deliveryDate.split('T')[0] : '',
    notes: item.notes || '',
    status: item.status,
  }
}

export default function RedeploymentsPage() {
  const [redeployments, setRedeployments] = useState<Redeployment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedRecord, setSelectedRecord] = useState<Redeployment | null>(null)
  const [editingRecord, setEditingRecord] = useState<Redeployment | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [formData, setFormData] = useState<RedeploymentFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchRedeployments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '25',
      })
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/redeployments?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch redeployments')
      const data = await response.json()
      setRedeployments(data.redeployments || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalRecords(data.pagination?.total || 0)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load redeployments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRedeployments()
  }, [currentPage, searchTerm, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const stats = {
    total: totalRecords,
    completed: redeployments.filter(item => item.status === 'COMPLETED').length,
    delivered: redeployments.filter(item => item.status === 'DELIVERED').length,
    linkedToComplaints: redeployments.filter(item => item.complaintTicket).length,
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openCreate = () => {
    setEditingRecord(null)
    setFormData(initialFormData)
    setFormErrors({})
    setShowFormModal(true)
  }

  const openEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/redeployments/${id}`)
      if (!response.ok) throw new Error('Failed to fetch redeployment')
      const item = await response.json()
      setEditingRecord(item)
      setFormData(getFormData(item))
      setShowFormModal(true)
    } catch (err) {
      console.error(err)
      toast.error('Failed to open redeployment')
    }
  }

  const openView = async (id: string) => {
    try {
      const response = await fetch(`/api/redeployments/${id}`)
      if (!response.ok) throw new Error('Failed to fetch redeployment')
      setSelectedRecord(await response.json())
    } catch (err) {
      console.error(err)
      toast.error('Failed to load redeployment details')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      const response = await fetch(
        editingRecord ? `/api/redeployments/${editingRecord.id}` : '/api/redeployments',
        {
          method: editingRecord ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            podName: formData.podName,
            shippingAddress: formData.shippingAddress || null,
            contactPerson: formData.contactPerson || null,
            mobileNumber: formData.mobileNumber || null,
            sourcePod: formData.sourcePod || null,
            components: formData.components || null,
            serials: formData.serials || null,
            complaintTicket: formData.complaintTicket || null,
            trackingId: formData.trackingId || null,
            orderDate: formData.orderDate,
            dispatchDate: formData.dispatchDate || null,
            deliveryDate: formData.deliveryDate || null,
            notes: formData.notes || null,
            ...(editingRecord && { status: formData.status }),
          }),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        if (data.details) {
          const nextErrors: Record<string, string> = {}
          data.details.forEach((detail: { field: string; message: string }) => {
            nextErrors[detail.field] = detail.message
          })
          setFormErrors(nextErrors)
        }
        throw new Error(data.error || 'Failed to save redeployment')
      }

      toast.success(editingRecord ? 'Redeployment updated' : 'Redeployment created')
      setShowFormModal(false)
      setEditingRecord(null)
      setFormData(initialFormData)
      fetchRedeployments()
    } catch (err) {
      console.error(err)
      setFormErrors(prev => ({
        ...prev,
        submit: err instanceof Error ? err.message : 'Failed to save redeployment',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this redeployment?')) return

    try {
      const response = await fetch(`/api/redeployments/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete redeployment')
      toast.success('Redeployment deleted')
      if (selectedRecord?.id === id) setSelectedRecord(null)
      fetchRedeployments()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete redeployment')
    }
  }

  const exportRows = redeployments.map(item => ({
    'Ref ID': item.refId,
    'Source POD': item.sourcePod || '',
    'Destination POD': item.podName,
    Components: item.components || '',
    Serials: item.serials || '',
    'Complaint Ticket': item.complaintTicket || '',
    Status: item.status,
    'Order Date': formatDate(item.orderDate),
    'Delivery Date': formatDate(item.deliveryDate || null),
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Redeployment Management</h1>
          <p className="mt-1 text-gray-500">Track live redeployment workflows instead of mock records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportToCSV(exportRows, 'redeployments')} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50">
            <Download className="h-5 w-5" />
            CSV
          </button>
          <button onClick={() => exportToExcel(exportRows, 'redeployments')} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50">
            <Download className="h-5 w-5" />
            Excel
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
            <Plus className="h-5 w-5" />
            Create Redeployment
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Records</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
          <div className="text-sm text-gray-500">Delivered</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.linkedToComplaints}</div>
          <div className="text-sm text-gray-500">Linked Complaints</div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search by source POD, destination POD, ref ID, ticket..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ORDER_SENT">Order Sent</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-gray-100 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Loading redeployments...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Redeployment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Components</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {redeployments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No redeployments found.</td>
                  </tr>
                ) : (
                  redeployments.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.refId}</div>
                        <div className="text-sm text-gray-500">{item.complaintTicket || 'No linked complaint'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{item.sourcePod || 'Unknown source'}</div>
                            <div className="text-sm text-gray-500">to {item.podName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.components || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[item.status]}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.orderDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openView(item.id)} className="p-1 text-gray-400 hover:text-gray-700"><Eye className="h-5 w-5" /></button>
                          <button onClick={() => openEdit(item.id)} className="p-1 text-gray-400 hover:text-gray-700"><Edit className="h-5 w-5" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm text-gray-500">
            <span>Showing page {currentPage} of {totalPages} • {totalRecords} total records</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="rounded border border-gray-200 px-3 py-1 disabled:opacity-50">Previous</button>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="rounded border border-gray-200 px-3 py-1 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}

      {showFormModal ? (
        <Modal
          title={editingRecord ? 'Edit Redeployment' : 'Create Redeployment'}
          subtitle={editingRecord?.refId}
          onClose={() => {
            setShowFormModal(false)
            setEditingRecord(null)
            setFormData(initialFormData)
          }}
          maxWidthClassName="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {formErrors.submit ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formErrors.submit}</div> : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Destination POD</label>
                <input name="podName" value={formData.podName} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Source POD</label>
                <input name="sourcePod" value={formData.sourcePod} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Person</label>
                <input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number</label>
                <input name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Order Date</label>
                <input type="date" name="orderDate" value={formData.orderDate} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" disabled={!editingRecord}>
                  <option value="PENDING">Pending</option>
                  <option value="ORDER_SENT">Order Sent</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Dispatch Date</label>
                <input type="date" name="dispatchDate" value={formData.dispatchDate} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Date</label>
                <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Shipping Address</label>
              <textarea name="shippingAddress" value={formData.shippingAddress} onChange={handleInputChange} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Components</label>
              <textarea name="components" value={formData.components} onChange={handleInputChange} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Serials</label>
                <input name="serials" value={formData.serials} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tracking ID</label>
                <input name="trackingId" value={formData.trackingId} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Complaint Ticket</label>
                <input name="complaintTicket" value={formData.complaintTicket} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowFormModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600">Cancel</button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingRecord ? 'Save Changes' : 'Create Redeployment'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {selectedRecord ? (
        <Modal title="Redeployment Details" subtitle={selectedRecord.refId} onClose={() => setSelectedRecord(null)}>
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedRecord.status]}`}>
                {selectedRecord.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Destination POD</p>
                <p className="font-medium text-gray-900">{selectedRecord.podName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Source POD</p>
                <p className="font-medium text-gray-900">{selectedRecord.sourcePod || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedRecord.orderDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedRecord.deliveryDate || null)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Components</p>
              <p className="text-gray-900">{selectedRecord.components || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Complaint Ticket</p>
              <p className="text-gray-900">{selectedRecord.complaintTicket || '-'}</p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button onClick={() => openEdit(selectedRecord.id)} className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600">Edit</button>
              <button onClick={() => handleDelete(selectedRecord.id)} className="rounded-lg bg-red-600 px-4 py-2 text-white">Delete</button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
