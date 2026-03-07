'use client'

import { useState } from 'react'
import { Search, Filter, Plus, Eye, Edit, Truck, Download, X } from 'lucide-react'
import { exportToCSV, exportToExcel, formatDate, formatCurrency } from '@/lib/export'

// Mock data - Replace with actual data from Google Sheets/API
const shipments = [
  {
    id: 'SHP001',
    podName: 'POD Mumbai Central',
    shippingAddress: '123 Main Street, Mumbai, Maharashtra 400001',
    contactPerson: 'Rahul Sharma',
    mobileNumber: '+91 98765 43210',
    peripherals: 'Monitor, Keyboard, Mouse, UPS',
    orderDate: '2024-01-15',
    dispatchDate: '2024-01-18',
    deliveryDate: '2024-01-22',
    setupDate: '2024-01-24',
    status: 'Delivered',
    totalCost: 45000,
  },
  {
    id: 'SHP002',
    podName: 'POD Delhi North',
    shippingAddress: '456 Park Avenue, New Delhi 110001',
    contactPerson: 'Priya Patel',
    mobileNumber: '+91 87654 32109',
    peripherals: 'Monitor, Keyboard, Mouse',
    orderDate: '2024-02-01',
    dispatchDate: '2024-02-03',
    deliveryDate: null,
    setupDate: null,
    status: 'In Transit',
    totalCost: 42000,
  },
  {
    id: 'SHP003',
    podName: 'POD Bangalore Tech',
    shippingAddress: '789 Tech Park, Bangalore 560001',
    contactPerson: 'Anil Kumar',
    mobileNumber: '+91 76543 21098',
    peripherals: 'Monitor, Keyboard, Mouse, UPS, Webcam',
    orderDate: '2024-02-10',
    dispatchDate: null,
    deliveryDate: null,
    setupDate: null,
    status: 'Processing',
    totalCost: 52000,
  },
  {
    id: 'SHP004',
    podName: 'POD Chennai South',
    shippingAddress: '321 Beach Road, Chennai 600001',
    contactPerson: 'Suresh Kumar',
    mobileNumber: '+91 65432 10987',
    peripherals: 'Monitor, Keyboard, Mouse',
    orderDate: '2024-02-15',
    dispatchDate: '2024-02-17',
    deliveryDate: '2024-02-20',
    setupDate: '2024-02-22',
    status: 'Delivered',
    totalCost: 48000,
  },
]

const statusColors: Record<string, string> = {
  'Delivered': 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-yellow-100 text-yellow-700',
  'Pending': 'bg-gray-100 text-gray-700',
}

const statusOptions = ['Processing', 'In Transit', 'Delivered', 'Pending']

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const filteredShipments = shipments.filter((shipment) => {
    // Search filter
    const matchesSearch = shipment.podName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(shipment.status)

    // Date range filter
    let matchesDateRange = true
    if (dateRange.from || dateRange.to) {
      const shipmentDate = new Date(shipment.orderDate)
      if (dateRange.from && shipmentDate < new Date(dateRange.from)) {
        matchesDateRange = false
      }
      if (dateRange.to && shipmentDate > new Date(dateRange.to)) {
        matchesDateRange = false
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange
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
            onClick={() => exportToCSV(filteredShipments, 'shipments')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            CSV
          </button>
          <button 
            onClick={() => exportToExcel(filteredShipments, 'shipments')}
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

      {/* Table */}
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
              {filteredShipments.map((shipment) => (
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status]}`}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Shipment</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">POD Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter POD name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="₹0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Enter full shipping address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peripherals / Components</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Monitor, Keyboard, Mouse, UPS..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
