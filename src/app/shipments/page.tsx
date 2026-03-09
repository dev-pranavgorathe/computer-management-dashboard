'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Eye, Edit, Truck, Download, X, Loader2 } from 'lucide-react'
import { exportToCSV, exportToExcel, formatDate, formatCurrency } from '@/lib/export'

interface Shipment {
  id: string
  podName: string
  shippingAddress: string
  contactPerson: string
  mobileNumber: string
  peripherals: string
  orderDate: string
  dispatchDate: string | null
  deliveryDate: string | null
  setupDate: string | null
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
  peripherals: string
  orderDate: string
  dispatchDate: string
  deliveryDate: string
  setupDate: string
  totalCost: string
  notes: string
}

const initialFormData: FormData = {
  podName: '',
  shippingAddress: '',
  contactPerson: '',
  mobileNumber: '',
  peripherals: '',
  orderDate: new Date().toISOString().split('T')[0],
  dispatchDate: '',
  deliveryDate: '',
  setupDate: '',
  totalCost: '',
  notes: '',
}

const statusColors: Record<string, string> = {
  'Delivered': 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-yellow-100 text-yellow-700',
  'Pending': 'bg-gray-100 text-gray-700',
}

const statusOptions = ['Processing', 'In Transit', 'Delivered', 'Pending']

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

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
    // Status filter (for multiple selection)
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
    // Clear error when user types
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
    if (!formData.peripherals.trim()) errors.peripherals = 'Peripherals info is required'
    if (!formData.orderDate) errors.orderDate = 'Order date is required'
    if (!formData.totalCost || parseFloat(formData.totalCost) <= 0) errors.totalCost = 'Valid cost is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSubmitting(true)
      
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podName: formData.podName,
          shippingAddress: formData.shippingAddress,
          contactPerson: formData.contactPerson,
          mobileNumber: formData.mobileNumber,
          peripherals: formData.peripherals,
          orderDate: formData.orderDate,
          dispatchDate: formData.dispatchDate || null,
          deliveryDate: formData.deliveryDate || null,
          setupDate: formData.setupDate || null,
          totalCost: parseFloat(formData.totalCost),
          notes: formData.notes || null,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create shipment')
      }
      
      // Reset form and close modal
      setFormData(initialFormData)
      setFormErrors({})
      setShowAddModal(false)
      
      // Refresh shipments list
      await fetchShipments()
      
    } catch (err) {
      console.error('Error creating shipment:', err)
      setFormErrors({ submit: err instanceof Error ? err.message : 'Failed to create shipment' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Shipment Management</h1>
          <p className="text-gray-500 mt-1">Track and manage computer shipments to PODs</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilterPanel
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute -mt-8 ml-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                {(statusFilters.length || 0) + (dateRange.from ? 1 : 0)}
              </span>
            )}
            Filters
          </button>
          <button 
            onClick={() => exportToCSV(filteredShipments as unknown as Record<string, unknown>[], 'shipments')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            CSV
          </button>
          <button 
            onClick={() => exportToExcel(filteredShipments as unknown as Record<string, unknown>[], 'shipments')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Excel
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Shipment
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilterPanel && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by POD, ID, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
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
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{filteredShipments.length}</span> of {shipments.length} shipments
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Filter Bar (when advanced panel is closed) */}
      {!showFilterPanel && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by POD name or shipment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Clear Filters
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
                    Shipment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    POD Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
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
                      No shipments found. Click "Add Shipment" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{shipment.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{shipment.podName}</div>
                          <div className="text-sm text-gray-500">{shipment.shippingAddress}</div>
                        </div>
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status] || 'bg-gray-100 text-gray-700'}`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {formatCurrency(shipment.totalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="w-5 h-5" />
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
                <h2 className="text-xl font-semibold text-gray-900">Add New Shipment</h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
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
                    Total Cost <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    name="totalCost"
                    value={formData.totalCost}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.totalCost ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="₹0"
                  />
                  {formErrors.totalCost && <p className="text-red-500 text-xs mt-1">{formErrors.totalCost}</p>}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peripherals <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="peripherals"
                    value={formData.peripherals}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.peripherals ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Monitor, Keyboard, Mouse..."
                  />
                  {formErrors.peripherals && <p className="text-red-500 text-xs mt-1">{formErrors.peripherals}</p>}
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
                  rows={3}
                  placeholder="Enter full shipping address"
                />
                {formErrors.shippingAddress && <p className="text-red-500 text-xs mt-1">{formErrors.shippingAddress}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
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
                  {submitting ? 'Adding...' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
