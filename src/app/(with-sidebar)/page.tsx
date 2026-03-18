'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Package, AlertTriangle, RefreshCw, ArrowRightLeft, CheckCircle, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

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

  // Monthly trend data (mock for now, can be enhanced with real date grouping)
  const trendData = [
    { month: 'Jan', shipments: 12, complaints: 5 },
    { month: 'Feb', shipments: 19, complaints: 8 },
    { month: 'Mar', shipments: stats?.shipments.recent || 0, complaints: stats?.complaints.open || 0 },
  ]

  return (
    <div className="p-6 fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Real-time insights into your computer management operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Shipments"
          value={stats?.shipments.total || 0}
          subtitle={`${stats?.shipments.recent || 0} this week`}
          icon={<Package className="h-6 w-6" />}
          color="blue"
          trend={stats?.shipments.recent && stats.shipments.recent > 0 ? `+${stats.shipments.recent}` : undefined}
        />
        <KPICard
          title="Active Complaints"
          value={stats?.complaints.open || 0}
          subtitle={`of ${stats?.complaints.total || 0} total`}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="orange"
        />
        <KPICard
          title="Repossessions"
          value={stats?.repossessions.total || 0}
          subtitle="In progress"
          icon={<RefreshCw className="h-6 w-6" />}
          color="purple"
        />
        <KPICard
          title="Redeployments"
          value={stats?.redeployments.total || 0}
          subtitle="Active transfers"
          icon={<ArrowRightLeft className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Overall Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
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

        {/* Bar Chart - Shipment Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipment Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shipmentStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }} 
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart - Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="shipments" stroke="#3b82f6" strokeWidth={2} name="Shipments" />
            <Line type="monotone" dataKey="complaints" stroke="#f59e0b" strokeWidth={2} name="Complaints" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton href="/shipments" label="Add Shipment" icon={<Package className="h-5 w-5" />} />
          <QuickActionButton href="/complaints" label="Log Complaint" icon={<AlertTriangle className="h-5 w-5" />} />
          <QuickActionButton href="/repossessions" label="New Repossession" icon={<RefreshCw className="h-5 w-5" />} />
          <QuickActionButton href="/redeployments" label="Redeploy Assets" icon={<ArrowRightLeft className="h-5 w-5" />} />
        </div>
      </div>
    </div>
  )
}

// KPI Card Component
function KPICard({ title, value, subtitle, icon, color, trend }: {
  title: string
  value: number
  subtitle?: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'purple'
  trend?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-sm font-medium flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

// Quick Action Button Component
function QuickActionButton({ href, label, icon }: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
    >
      <div className="p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
      <span className="font-medium text-gray-700 group-hover:text-blue-700">{label}</span>
    </a>
  )
}
