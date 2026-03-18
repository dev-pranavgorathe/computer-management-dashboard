'use client'

import { useEffect, useState } from 'react'
import { Monitor, Plus, Edit, Trash2, Wifi, WifiOff, Settings, AlertCircle, Search, Filter, Power } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Modal from '@/components/Modal'

interface PC {
  id: string
  pcId: string
  name: string
  podId?: string
  podName?: string
  serialNumber?: string
  model?: string
  os?: string
  cpu?: string
  ram?: string
  storage?: string
  ipAddress?: string
  macAddress?: string
  status: string
  lastHeartbeat?: string
  lastActiveAt?: string
  assignedUser?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    activityLogs: number
    websiteLogs: number
  }
  isActive: boolean
  createdAt: string
}

interface PCStats {
  total: number
  online: number
  offline: number
  maintenance: number
}

export default function PCManagementPage() {
  const [pcs, setPCs] = useState<PC[]>([])
  const [stats, setStats] = useState<PCStats>({ total: 0, online: 0, offline: 0, maintenance: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingPC, setEditingPC] = useState<PC | null>(null)
  const [formData, setFormData] = useState({
    pcId: '',
    name: '',
    podId: '',
    podName: '',
    serialNumber: '',
    model: '',
    os: '',
    cpu: '',
    ram: '',
    storage: '',
    ipAddress: '',
    macAddress: '',
    notes: '',
  })

  useEffect(() => {
    fetchPCs()
  }, [statusFilter])

  const fetchPCs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/pc?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setPCs(data.pcs || [])
        setStats(data.stats || { total: 0, online: 0, offline: 0, maintenance: 0 })
      } else {
        toast.error(data.error || 'Failed to fetch PCs')
      }
    } catch (error) {
      console.error('Failed to fetch PCs:', error)
      toast.error('Failed to load PCs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPC ? `/api/pc/${editingPC.pcId}` : '/api/pc'
      const method = editingPC ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(editingPC ? 'PC updated successfully' : 'PC created successfully')
        setShowModal(false)
        setEditingPC(null)
        resetForm()
        fetchPCs()
      } else {
        toast.error(data.error || 'Failed to save PC')
      }
    } catch (error) {
      console.error('Failed to save PC:', error)
      toast.error('Failed to save PC')
    }
  }

  const handleDelete = async (pc: PC) => {
    if (!confirm(`Are you sure you want to delete ${pc.name}?`)) return

    try {
      const res = await fetch(`/api/pc/${pc.pcId}`, { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        toast.success('PC deleted successfully')
        fetchPCs()
      } else {
        toast.error(data.error || 'Failed to delete PC')
      }
    } catch (error) {
      console.error('Failed to delete PC:', error)
      toast.error('Failed to delete PC')
    }
  }

  const handleStatusChange = async (pc: PC, newStatus: string) => {
    try {
      const res = await fetch(`/api/pc/${pc.pcId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`PC status updated to ${newStatus}`)
        fetchPCs()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      pcId: '',
      name: '',
      podId: '',
      podName: '',
      serialNumber: '',
      model: '',
      os: '',
      cpu: '',
      ram: '',
      storage: '',
      ipAddress: '',
      macAddress: '',
      notes: '',
    })
  }

  const openAddModal = () => {
    resetForm()
    setEditingPC(null)
    setShowModal(true)
  }

  const openEditModal = (pc: PC) => {
    setEditingPC(pc)
    setFormData({
      pcId: pc.pcId,
      name: pc.name,
      podId: pc.podId || '',
      podName: pc.podName || '',
      serialNumber: pc.serialNumber || '',
      model: pc.model || '',
      os: pc.os || '',
      cpu: pc.cpu || '',
      ram: pc.ram || '',
      storage: pc.storage || '',
      ipAddress: pc.ipAddress || '',
      macAddress: pc.macAddress || '',
      notes: pc.notes || '',
    })
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-100 text-green-700 border-green-200'
      case 'OFFLINE': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE': return <Wifi className="w-4 h-4" />
      case 'OFFLINE': return <WifiOff className="w-4 h-4" />
      case 'MAINTENANCE': return <Settings className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 lg:p-8 fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">PC Management</h1>
          <p className="mt-1 text-gray-500">Monitor and manage computers across all PODs</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add PC
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total PCs"
          value={stats.total}
          icon={<Monitor className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Online"
          value={stats.online}
          icon={<Wifi className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Offline"
          value={stats.offline}
          icon={<WifiOff className="h-6 w-6" />}
          color="gray"
        />
        <StatCard
          title="Maintenance"
          value={stats.maintenance}
          icon={<Settings className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPCs()}
            placeholder="Search PCs..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        <button
          onClick={fetchPCs}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-5 w-5" />
          Filter
        </button>
      </div>

      {/* PC Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading PCs...</div>
        ) : pcs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No PCs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PC ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">POD</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Active</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pcs.map((pc) => (
                  <tr key={pc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-blue-600">{pc.pcId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{pc.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{pc.podName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(pc.status)}`}>
                        {getStatusIcon(pc.status)}
                        {pc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pc.assignedUser ? pc.assignedUser.name : <span className="text-gray-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {pc.lastActiveAt ? new Date(pc.lastActiveAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(pc)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(pc)}
                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingPC ? 'Edit PC' : 'Add New PC'}
          onClose={() => {
            setShowModal(false)
            setEditingPC(null)
            resetForm()
          }}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">PC ID *</label>
                <input
                  type="text"
                  value={formData.pcId}
                  onChange={(e) => setFormData({ ...formData, pcId: e.target.value })}
                  required
                  disabled={!!editingPC}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="PC-001"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Main Office PC 1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">POD ID</label>
                <input
                  type="text"
                  value={formData.podId}
                  onChange={(e) => setFormData({ ...formData, podId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="POD-001"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">POD Name</label>
                <input
                  type="text"
                  value={formData.podName}
                  onChange={(e) => setFormData({ ...formData, podName: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Mumbai Head Office"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="XYZ123ABC"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Dell OptiPlex 7090"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Operating System</label>
                <input
                  type="text"
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Zorin OS 16"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">CPU</label>
                <input
                  type="text"
                  value={formData.cpu}
                  onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Intel i3 Gen 7th"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">RAM</label>
                <input
                  type="text"
                  value={formData.ram}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="8GB DDR4"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Storage</label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="256GB SSD"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">IP Address</label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">MAC Address</label>
                <input
                  type="text"
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="00:1A:2B:3C:4D:5E"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Additional notes about this PC..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors font-medium"
              >
                {editingPC ? 'Update PC' : 'Add PC'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setEditingPC(null)
                  resetForm()
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon, color }: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'gray' | 'yellow'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
