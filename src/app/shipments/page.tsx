'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Eye, Edit, Truck, Download, X, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { exportToCSV, exportToExcel, formatDate, formatCurrency } from '@/lib/export'
import StatusPipeline, { StatusBadge, SHIPMENT_PIPELINE } from '@/components/StatusPipeline'

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
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
  }
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

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Status options matching PRD pipeline
  const statusOptions = ['PENDING', 'ORDER_SENT', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED']

  // Fetch shipments from API
  const fetchShipments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilters.length === 1) params.append('status', statusFilters[0])
      if (dateRange.from) params.append('dateFrom', dateRange.from)
      if (dateRange.to) params.append('dateTo', dateRange.to)
      
      const response = await fetch(`/api/shipments?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch shipments')
      
      const data = await response.json()
      setShipments(data.shipments || [])
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
  }, [searchTerm, statusFilters.join(','), dateRange.from, dateRange.to])

  const filteredShipments = shipments.filter((shipment) => {
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(shipment.status)
    return matchesStatus
  })

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilters([])
    setDateRange({ from: '', to: '' })
  }

  const hasActiveFilters = searchTerm || statusFilters.length > 0 || dateRange.from || dateRange.to

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
        console.log('API Error Response:', errorData)
        // Handle validation errors with details
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors: Record<string, string> = {}
          errorData.details.forEach((detail: { field: string; message: string }) => {
            fieldErrors[detail.field] = detail.message
          })
          console.log('Setting field errors:', fieldErrors)
          setFormErrors(fieldErrors)
          throw new Error('Please fix the highlighted fields')
        }
        throw new Error(errorData.error || 'Failed to create shipment')
      }

      setFormData(initialFormData)
      setFormErrors({})
      setShowAddModal(false)
      setEditingShipment(null)
      await fetchShipments()
      toast.success(editingShipment ? 'Shipment updated successfully' : 'Shipment created successfully')

    } catch (err) {
      console.error('Error creating shipment:', err)
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
    const currentIndex = SHIPMENT_PIPELINE.findIndex((step) => step.value === shipment.status)
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

  const exportRows = filteredShipments.map((shipment) => ({
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Shipment Management</h1>
          <p className="text-gray-500 mt-1">Track and manage computer shipments to PODs</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilterPanel
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          <button 
            onClick={() => exportToCSV(exportRows, 'shipments')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            CSV
          </button>
          <button 
            onClick={() => exportToExcel(exportRows, 'shipments')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Excel
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Shipment
          </button>
        </div>
      </div>

      {/* Quick Filter Bar */}
      {!showFilterPanel && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by POD, Ref ID, tracking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    statusFilters.includes(status)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {formatStatus(status)}
                </button>
              ))}
            </div>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Loading shipments...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200 mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchShipments}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ref ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    POD Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPUs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No shipments found. Click Add Shipment to create one.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">{shipment.refId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{shipment.podName}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{shipment.shippingAddress}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{shipment.cpus}</span>
                        <span className="text-gray-500 text-sm ml-1">PCs</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-gray-900">{shipment.contactPerson}</div>
                          <div className="text-sm text-gray-500">{shipment.mobileNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {formatDate(shipment.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedShipment(shipment)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button onClick={() => openEditModal(shipment)} className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteShipment(shipment.id)} className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{editingShipment ? 'Edit Shipment' : 'Add New Shipment'}</h2>
                  <button 
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingShipment(null)
                      setFormData(initialFormData)
                      setFormErrors({})
                    }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {formErrors.submit}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    POD Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="podName"
                    value={formData.podName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.podName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter POD name"
                  />
                  {formErrors.podName && <p className="text-red-500 text-xs mt-1">{formErrors.podName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPU Count <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    name="cpus"
                    value={formData.cpus}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.cpus ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Number of CPUs"
                  />
                  {formErrors.cpus && <p className="text-red-500 text-xs mt-1">{formErrors.cpus}</p>}
                  <p className="text-xs text-gray-500 mt-1">Components will be auto-generated</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.contactPerson ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter contact name"
                  />
                  {formErrors.contactPerson && <p className="text-red-500 text-xs mt-1">{formErrors.contactPerson}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.mobileNumber ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="+91 XXXXX XXXXX"
                  />
                  {formErrors.mobileNumber && <p className="text-red-500 text-xs mt-1">{formErrors.mobileNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.orderDate ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.orderDate && <p className="text-red-500 text-xs mt-1">{formErrors.orderDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                  <input 
                    type="number" 
                    name="totalCost"
                    value={formData.totalCost}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="₹0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    formErrors.shippingAddress ? 'border-red-500' : 'border-gray-200'
                  }`}
                  rows={2}
                  placeholder="Enter full shipping address"
                />
                {formErrors.shippingAddress && <p className="text-red-500 text-xs mt-1">{formErrors.shippingAddress}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Numbers</label>
                  <input 
                    type="text" 
                    name="serials"
                    value={formData.serials}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Comma-separated serials"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                  <input 
                    type="text" 
                    name="trackingId"
                    value={formData.trackingId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Vendor tracking ID"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">QC Report</label>
                  <input 
                    type="text" 
                    name="qcReport"
                    value={formData.qcReport}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="QC report filename"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Signed QC</label>
                  <input 
                    type="text" 
                    name="signedQc"
                    value={formData.signedQc}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Signed QC filename"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Any additional notes..."
                />
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
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? (editingShipment ? 'Saving...' : 'Adding...') : (editingShipment ? 'Save Shipment' : 'Add Shipment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Shipment Details</h2>
                  <p className="text-sm text-gray-500">{selectedShipment.refId}</p>
                </div>
                <button 
                  onClick={() => setSelectedShipment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Status Pipeline */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Status Pipeline</h3>
                <StatusPipeline 
                  steps={SHIPMENT_PIPELINE} 
                  currentStatus={selectedShipment.status} 
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAdvanceStatus(selectedShipment)}
                    disabled={selectedShipment.status === 'COMPLETED'}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {selectedShipment.status === 'COMPLETED'
                      ? 'Completed'
                      : `Advance to ${formatStatus(SHIPMENT_PIPELINE[SHIPMENT_PIPELINE.findIndex((step) => step.value === selectedShipment.status) + 1]?.value || selectedShipment.status)}`}
                  </button>
                  <button
                    onClick={() => openEditModal(selectedShipment)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    Edit Shipment
                  </button>
                  <button
                    onClick={() => handleDeleteShipment(selectedShipment.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Delete Shipment
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">POD Name</label>
                  <p className="font-medium text-gray-900">{selectedShipment.podName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">CPUs</label>
                  <p className="font-medium text-gray-900">{selectedShipment.cpus}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Contact Person</label>
                  <p className="font-medium text-gray-900">{selectedShipment.contactPerson}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mobile</label>
                  <p className="font-medium text-gray-900">{selectedShipment.mobileNumber}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium text-gray-900">{selectedShipment.shippingAddress}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Order Date</label>
                  <p className="font-medium text-gray-900">{formatDate(selectedShipment.orderDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Tracking ID</label>
                  <p className="font-medium text-gray-900">{selectedShipment.trackingId || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Serial Numbers</label>
                  <p className="font-medium text-gray-900">{selectedShipment.serials || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Components</label>
                  <p className="font-medium text-gray-900">{selectedShipment.components || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">QC Report</label>
                  <p className="font-medium text-gray-900">{selectedShipment.qcReport || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Signed QC</label>
                  <p className="font-medium text-gray-900">{selectedShipment.signedQc || '-'}</p>
                </div>
              </div>
              
              {selectedShipment.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="text-sm text-gray-500">Notes</label>
                  <p className="text-gray-900">{selectedShipment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
