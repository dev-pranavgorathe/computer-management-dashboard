'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Package, AlertTriangle, RefreshCw, ArrowRightLeft, CheckCircle, Clock, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { toast } from 'react-hot-toast'

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    shipments: { total: 0, byStatus: {}, recent: 0 },
    complaints: { total: 0, byStatus: {}, open: 0 },
    repossessions: { total: 0, byStatus: {} },
    redeployments: { total: 0, byStatus: {} },
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardStats()
    fetchRecentActivity()
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

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentShipments = shipments.filter((s: any) => new Date(s.createdAt) > weekAgo).length
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

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent activities from all modules
      const activities: any[] = []
      
      // Get recent shipments
      const shipmentsRes = await fetch('/api/shipments?limit=3')
      const shipmentsData = await shipmentsRes.json()
      const shipments = shipmentsData.shipments || []
      
      shipments.forEach((s: any) => {
        activities.push({
          type: s.status === 'DELIVERED' ? 'ship_done' : 'ship_new',
          label: `Shipment ${s.id} - ${s.podName}`,
          sub: s.status === 'DELIVERED' ? 'Delivered successfully' : 'Order placed',
          color: s.status === 'DELIVERED' ? '#22c55e' : '#3b82f6',
          ts: new Date(s.createdAt).toLocaleDateString(),
        })
      })

      // Get recent complaints
      const complaintsRes = await fetch('/api/complaints?limit=3')
      const complaintsData = await complaintsRes.json()
      const complaints = complaintsData.complaints || []
      
      complaints.forEach((c: any) => {
        activities.push({
          type: c.status === 'SOLVED' ? 'comp_solved' : 'comp_new',
          label: `Complaint ${c.id} - ${c.podName}`,
          sub: c.status === 'SOLVED' ? 'Issue resolved' : c.issue,
          color: c.status === 'SOLVED' ? '#22c55e' : '#ef4444',
          ts: new Date(c.reportedDate || c.createdAt).toLocaleDateString(),
        })
      })

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      
      setRecentActivity(activities.slice(0, 6))
    } catch (error) {
      console.error('Failed to fetch activity:', error)
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const shipmentTrendData = [
    { period: 'Jan', shipments: 12, complaints: 3 },
    { period: 'Feb', shipments: 15, complaints: 5 },
    { period: 'Mar', shipments: 18, complaints: 2 },
    { period: 'Apr', shipments: 10, complaints: 4 },
    { period: 'May', shipments: 22, complaints: 1 },
    { period: 'Jun', shipments: 25, complaints: 3 },
  ]

  return (
    <div className="p-6 lg:p-8 fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Monitor your POD network operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.shipments.total}</div>
              <div className="text-sm text-gray-500">Total Shipments</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{stats.shipments.recent} in last 7 days</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.complaints.total}</div>
              <div className="text-sm text-gray-500">Complaints</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-yellow-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{stats.complaints.open} open</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.repossessions.total}</div>
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
              <div className="text-2xl font-bold text-gray-900">{stats.redeployments.total}</div>
              <div className="text-sm text-gray-500">Redeployments</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Equipment reuse</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Shipment Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Shipment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={shipmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10.5 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="shipments" stroke="#3b82f6" strokeWidth={2.5} name="Shipments" dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Complaint Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Complaint Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={shipmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10.5 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" iconSize={7} />
              <Line type="monotone" dataKey="complaints" stroke="#ef4444" strokeWidth={2.5} name="Raised" dot={{ r: 4, fill: '#fff', stroke: '#ef4444', strokeWidth: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${activity.color}14`, border: `1px solid ${activity.color}33` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: activity.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{activity.label}</div>
                  <div className="text-xs text-gray-500">{activity.sub}</div>
                </div>
                <div className="text-xs text-gray-400">{activity.ts}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
