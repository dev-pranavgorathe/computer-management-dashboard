'use client'

import { useEffect, useState } from 'react'
import { Activity, User, Calendar, Filter, Search, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string | null
  ipAddress: string | null
  userAgent: string | null
  changes: string | null
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  } | null
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700 border-green-200',
  UPDATE: 'bg-blue-100 text-blue-700 border-blue-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  VIEW: 'bg-gray-100 text-gray-700 border-gray-200',
  LOGIN: 'bg-purple-100 text-purple-700 border-purple-200',
  LOGOUT: 'bg-orange-100 text-orange-700 border-orange-200',
  EXPORT: 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

const entityTypeLabels: Record<string, string> = {
  Shipment: '📦 Shipment',
  Complaint: '🎫 Complaint',
  Repossession: '🔄 Repossession',
  Redeployment: '↔️ Redeployment',
  User: '👤 User',
  PC: '💻 PC',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')

  useEffect(() => {
    fetchLogs()
  }, [actionFilter, entityFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (actionFilter !== 'all') params.append('action', actionFilter)
      if (entityFilter !== 'all') params.append('entityType', entityFilter)
      params.append('limit', '100')

      const res = await fetch(`/api/audit-logs?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setLogs(data.logs || [])
        setTotal(data.total || 0)
      } else {
        toast.error(data.error || 'Failed to fetch audit logs')
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      log.entityType.toLowerCase().includes(search) ||
      log.entityId.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search) ||
      log.user?.name?.toLowerCase().includes(search) ||
      log.user?.email?.toLowerCase().includes(search)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatChanges = (changes: string | null) => {
    if (!changes) return null
    try {
      const parsed = JSON.parse(changes)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return changes
    }
  }

  return (
    <div className="p-6 lg:p-8 fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Audit Logs</h1>
          <p className="mt-1 text-gray-500">Track all system activities and changes</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-500">Total Logs</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-5 w-5 text-green-600 font-bold text-lg">+</div>
            <span className="text-sm text-gray-500">Created</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {logs.filter(l => l.action === 'CREATE').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-5 w-5 text-blue-600 font-bold text-lg">✎</div>
            <span className="text-sm text-gray-500">Updated</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {logs.filter(l => l.action === 'UPDATE').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-5 w-5 text-red-600 font-bold text-lg">×</div>
            <span className="text-sm text-gray-500">Deleted</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {logs.filter(l => l.action === 'DELETE').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by entity, action, user..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="VIEW">View</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="EXPORT">Export</option>
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Entities</option>
          <option value="Shipment">Shipments</option>
          <option value="Complaint">Complaints</option>
          <option value="Repossession">Repossessions</option>
          <option value="Redeployment">Redeployments</option>
          <option value="User">Users</option>
          <option value="PC">PCs</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${actionColors[log.action] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {log.action}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {entityTypeLabels[log.entityType] || log.entityType}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {log.entityId}
                      </span>
                    </div>

                    {/* User & Time */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {log.user ? (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{log.user.name} ({log.user.email})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <User className="h-4 w-4" />
                          <span>System</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                      {log.ipAddress && (
                        <span className="text-xs text-gray-400 font-mono">
                          IP: {log.ipAddress}
                        </span>
                      )}
                    </div>

                    {/* Changes */}
                    {log.changes && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                            View changes
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 overflow-x-auto">
                            {formatChanges(log.changes)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {filteredLogs.length} of {total} records
      </div>
    </div>
  )
}
