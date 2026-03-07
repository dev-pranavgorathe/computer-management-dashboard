'use client'

import { useState } from 'react'
import { Search, Plus, Eye, Edit, ArrowRightLeft, CheckCircle } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

// Mock data
const redeployments = [
  {
    id: 'RDP001',
    sourceRepo: 'REP001',
    sourcePOD: 'POD Mumbai Central',
    destinationPOD: 'POD Pune Central',
    pcCount: 3,
    shipDate: '2024-02-10',
    deliveryDate: '2024-02-12',
    status: 'Delivered',
    complaintResolved: 'CMP004',
  },
  {
    id: 'RDP002',
    sourceRepo: 'REP003',
    sourcePOD: 'POD Bangalore Tech',
    destinationPOD: 'POD Chennai South',
    pcCount: 5,
    shipDate: '2024-02-08',
    deliveryDate: null,
    status: 'In Transit',
    complaintResolved: null,
  },
  {
    id: 'RDP003',
    sourceRepo: 'REP001',
    sourcePOD: 'POD Mumbai Central',
    destinationPOD: 'POD Ahmedabad',
    pcCount: 2,
    shipDate: '2024-02-05',
    deliveryDate: '2024-02-07',
    status: 'Delivered',
    complaintResolved: 'CMP005',
  },
]

const flowData = [
  { stage: 'Repossessed', count: 67 },
  { stage: 'Repaired', count: 52 },
  { stage: 'Redeployed', count: 45 },
  { stage: 'Complaints Solved', count: 38 },
]

const statusColors: Record<string, string> = {
  'Delivered': 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-yellow-100 text-yellow-700',
}

export default function RedeploymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredRedeployments = redeployments.filter((redeploy) => {
    const matchesSearch = 
      redeploy.sourcePOD.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redeploy.destinationPOD.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redeploy.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || redeploy.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalShipments: redeployments.length,
    totalPCsRedeployed: redeployments.reduce((sum, r) => sum + r.pcCount, 0),
    complaintsSolved: redeployments.filter(r => r.complaintResolved).length,
    pendingShipments: redeployments.filter(r => r.status !== 'Delivered').length,
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Redeployment Management</h1>
          <p className="text-gray-500 mt-1">Track redeployment of recovered hardware assets</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Redeployment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.totalShipments}</div>
          <div className="text-sm text-gray-500">Total Shipments</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.totalPCsRedeployed}</div>
          <div className="text-sm text-gray-500">PCs Redeployed</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.complaintsSolved}</div>
          <div className="text-sm text-gray-500">Complaints Solved</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingShipments}</div>
          <div className="text-sm text-gray-500">Pending Shipments</div>
        </div>
      </div>

      {/* Flow Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Repossession → Redeployment Flow</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={flowData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="stage" type="category" stroke="#9ca3af" width={120} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by source or destination POD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Processing', 'In Transit', 'Delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Status' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

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
                  From POD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To POD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PCs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ship Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint Resolved
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRedeployments.map((redeploy) => (
                <tr key={redeploy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{redeploy.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{redeploy.sourcePOD}</div>
                        <div className="text-xs text-gray-500">Source: {redeploy.sourceRepo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{redeploy.destinationPOD}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-gray-900">{redeploy.pcCount}</span>
                    <span className="text-sm text-gray-500 ml-1">units</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {redeploy.shipDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[redeploy.status]}`}>
                      {redeploy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {redeploy.complaintResolved ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">{redeploy.complaintResolved}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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
    </div>
  )
}
