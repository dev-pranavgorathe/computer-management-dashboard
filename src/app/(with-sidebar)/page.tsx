'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Package, AlertTriangle, RefreshCw, ArrowRightLeft, CheckCircle, Clock, Database, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { toast } from 'react-hot-toast'

interface DashboardStats {
  shipments: { total: number; byStatus: Record<string, number>; recent: number }
  complaints: { total: number; byStatus: Record<string, number>; open: number }
  repossessions: { total: number; byStatus: Record<string, number> }
  redeployments: { total: number; byStatus: Record<string, number> }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [shipmentsRes, complaintsRes, repossessionsRes, redeploymentsRes] = await Promise.all([
        fetch('/api/shipments'),
        fetch('/api/complaints'),
        fetch('/api/repossessions'),
        fetch('/api/redeployments'),
      ])

      const shipmentsData = await shipmentsRes.json()
      const complaintsData = await complaintsRes.json()
      const repossessionsData = await repossessionsRes.json()
      const redeploymentsData = await redeploymentsRes.json()

      const shipments = shipmentsData.shipments || []
      const complaints = complaintsData.complaints || []
      const repossessions = repossessionsData.repossessions || []
      const redeployments = redeploymentsData.redeployments || []

      const byStatus = (items: any[], statusField = 'status') => {
        return items.reduce((acc: Record<string, number>, item: any) => {
          const status = item[statusField] || 'UNKNOWN'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
      }

      // Calculate recent shipments (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentShipments = shipments.filter((s: any) => new Date(s.createdAt) > weekAgo).length

      // Calculate open complaints
      const openComplaints = complaints.filter((c: any) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length

      setStats({
        shipments: { total: shipments.length, byStatus: byStatus(shipments), recent: recentShipments },
        complaints: { total: complaints.length, byStatus: byStatus(complaints, 'status'), open: openComplaints },
        repossessions: { total: repossessions.length, byStatus: byStatus(repossessions) },
        redeployments: { total: redeployments.length, byStatus: byStatus(redeployments) },
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedDemoData = async () => {
    try {
      setSeeding(true)
      const res = await fetch('/api/seed-demo', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        toast.success(`✅ Demo data seeded! ${JSON.stringify(data.stats)}`)
        fetchDashboardStats()
      } else {
        toast.error(data.error || 'Failed to seed demo data')
      }
    } catch (error) {
      toast.error('Failed to seed demo data')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 fade-in">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-xl"></div>
            <div className="h-80 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  const statusData = stats ? [
    { name: 'Shipments', value: stats.shipments.total, color: COLORS[0] },
    { name: 'Complaints', value: stats.complaints.total, color: COLORS[1] },
    { name: 'Repossessions', value: stats.repossessions.total, color: COLORS[2] },
    { name: 'Redeployments', value: stats.redeployments.total, color: COLORS[3] },
  ] : []

  const shipmentStatusData = stats ? Object.entries(stats.shipments.byStatus).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  })) : []

  return (
    <div className="p-6 lg:p-8 fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Monitor your POD network operations</p>
        </div>
        {stats && (stats.shipments.total + stats.complaints.total + stats.repossessions.total + stats.redeployments.total) === 0 && (
          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Seed Demo Data
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats?.shipments.total || 0}</div>
              <div className="text-sm text-gray-500">Total Shipments</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{stats?.shipments.recent || 0} in last 7 days</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats?.complaints.total || 0}</div>
              <div className="text-sm text-gray-500">Complaints</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-yellow-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{stats?.complaints.open || 0} open</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats?.repossessions.total || 0}</div>
              <div className="text-sm text-gray-500">Repossessions</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-purple-600">
            <ArrowRightLeft className="w-4 h-4 mr-1" />
            <span>Equipment recovery</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowRightLeft className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats?.redeployments.total || 0}</div>
              <div className="text-sm text-gray-500">Redeployments</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Equipment reuse</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      {stats && (stats.shipments.total + stats.complaints.total + stats.repossessions.total + stats.redeployments.total) > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overview Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Operations Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Shipment Status Bar Chart */}
          {shipmentStatusData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Shipment Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shipmentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {stats && (stats.shipments.total + stats.complaints.total + stats.repossessions.total + stats.redeployments.total) === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding some demo data to see the dashboard in action.</p>
          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {seeding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Seeding Demo Data...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Seed Demo Data
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
