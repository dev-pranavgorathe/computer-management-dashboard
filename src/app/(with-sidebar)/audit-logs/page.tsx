'use client'

import { useEffect, useState } from 'react'

interface LogItem {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: string
  user?: { name?: string; email?: string; role?: string }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/audit-logs?limit=200')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch logs')
        setLogs(data.logs || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch logs')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Audit Logs</h1>
      <p className="mt-1 text-gray-500">Track who changed what and when.</p>

      {loading ? <div className="mt-6 text-gray-500">Loading logs...</div> : null}
      {error ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {!loading && !error ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Action</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Entity</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Entity ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-800">{log.user?.name || log.user?.email || 'System'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{log.action}</td>
                    <td className="px-4 py-3 text-gray-700">{log.entityType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{log.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
