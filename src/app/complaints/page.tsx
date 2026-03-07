'use client'

import { useState } from 'react'
import { Search, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

// Mock data
const complaints = [
  {
    id: 'CMP001',
    podName: 'POD Mumbai Central',
    complaintDate: '2024-02-10',
    issueType: 'Hardware',
    description: 'Monitor not working properly',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Tech Team A',
    resolutionDate: null,
  },
  {
    id: 'CMP002',
    podName: 'POD Delhi North',
    complaintDate: '2024-02-08',
    issueType: 'Software',
    description: 'Operating system crash',
    priority: 'Medium',
    status: 'Solved',
    assignedTo: 'Tech Team B',
    resolutionDate: '2024-02-09',
  },
  {
    id: 'CMP003',
    podName: 'POD Bangalore Tech',
    complaintDate: '2024-02-12',
    issueType: 'Network',
    description: 'Internet connectivity issues',
    priority: 'High',
    status: 'Pending',
    assignedTo: null,
    resolutionDate: null,
  },
]

const statusColors: Record<string, string> = {
  'Solved': 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
}

const priorityColors: Record<string, string> = {
  'High': 'bg-red-100 text-red-700',
  'Medium': 'bg-orange-100 text-orange-700',
  'Low': 'bg-gray-100 text-gray-700',
}

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = complaint.podName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: complaints.length,
    solved: complaints.filter(c => c.status === 'Solved').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    pending: complaints.filter(c => c.status === 'Pending').length,
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Complaint Management</h1>
          <p className="text-gray-500 mt-1">Track and resolve POD complaints</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Log Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Complaints</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.solved}</div>
          <div className="text-sm text-gray-500">Solved</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by POD name or complaint ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Pending', 'In Progress', 'Solved'].map((status) => (
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
                  Complaint ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POD Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{complaint.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{complaint.podName}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {complaint.issueType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[complaint.priority]}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status]}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {complaint.complaintDate}
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
