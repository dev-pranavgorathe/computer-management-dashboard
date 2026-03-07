'use client'

import { useState } from 'react'
import { Search, Plus, Eye, Edit, RefreshCcw, CheckCircle } from 'lucide-react'

// Mock data
const repossessions = [
  {
    id: 'REP001',
    podName: 'POD Mumbai Central',
    repoDate: '2024-02-01',
    pcCount: 5,
    reason: 'POD Closure',
    condition: 'Good',
    storageLocation: 'Warehouse A - Mumbai',
    status: 'Available',
    remarks: 'All units in working condition',
  },
  {
    id: 'REP002',
    podName: 'POD Delhi North',
    repoDate: '2024-01-25',
    pcCount: 3,
    reason: 'Upgradation',
    condition: 'Needs Repair',
    storageLocation: 'Warehouse B - Delhi',
    status: 'Under Repair',
    remarks: '2 units need RAM replacement',
  },
  {
    id: 'REP003',
    podName: 'POD Bangalore Tech',
    repoDate: '2024-02-05',
    pcCount: 8,
    reason: 'POD Closure',
    condition: 'Good',
    storageLocation: 'Warehouse C - Bangalore',
    status: 'Redeployed',
    remarks: 'Moved to new POD locations',
  },
]

const statusColors: Record<string, string> = {
  'Available': 'bg-green-100 text-green-700',
  'Under Repair': 'bg-yellow-100 text-yellow-700',
  'Redeployed': 'bg-blue-100 text-blue-700',
}

const conditionColors: Record<string, string> = {
  'Good': 'text-green-600',
  'Fair': 'text-yellow-600',
  'Needs Repair': 'text-red-600',
}

export default function RepossessionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredRepossessions = repossessions.filter((repo) => {
    const matchesSearch = repo.podName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || repo.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalPODs: new Set(repossessions.map(r => r.podName)).size,
    totalPCs: repossessions.reduce((sum, r) => sum + r.pcCount, 0),
    available: repossessions.filter(r => r.status === 'Available').reduce((sum, r) => sum + r.pcCount, 0),
    underRepair: repossessions.filter(r => r.status === 'Under Repair').reduce((sum, r) => sum + r.pcCount, 0),
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Repossession Management</h1>
          <p className="text-gray-500 mt-1">Track recovered hardware assets from PODs</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Repossession
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.totalPODs}</div>
          <div className="text-sm text-gray-500">PODs with Repos</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">{stats.totalPCs}</div>
          <div className="text-sm text-gray-500">Total PCs Repossessed</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-sm text-gray-500">Available for Redeployment</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{stats.underRepair}</div>
          <div className="text-sm text-gray-500">Under Repair</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by POD name or repossession ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Available', 'Under Repair', 'Redeployed'].map((status) => (
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
                  Repo ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POD Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PCs Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRepossessions.map((repo) => (
                <tr key={repo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{repo.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{repo.podName}</div>
                    <div className="text-sm text-gray-500">{repo.repoDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-gray-900">{repo.pcCount}</span>
                    <span className="text-sm text-gray-500 ml-1">units</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {repo.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${conditionColors[repo.condition]}`}>
                      {repo.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[repo.status]}`}>
                      {repo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{repo.storageLocation}</div>
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
