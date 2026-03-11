'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCcw, 
  ArrowRightLeft,
  TrendingUp,
  MapPin,
  Loader2
} from 'lucide-react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

interface DashboardStats {
  totalPCsDeployed: number
  activePODs: number
  shipments: {
    total: number
    byStatus: Record<string, number>
    pending: number
    orderSent: number
    dispatched: number
    inTransit: number
    delivered: number
    completed: number
  }
  complaints: {
    total: number
    solved: number
    inProgress: number
    open: number
    resolutionRate: number
  }
  repossessions: {
    total: number
    pending: number
    collected: number
    inProgress: number
    completed: number
  }
  redeployments: {
    total: number
    pending: number
    orderSent: number
    inTransit: number
    delivered: number
    completed: number
    complaintsSolvedWithRepurposed: number
  }
  monthlyTrend: Array<{ month: string; deployments: number }>
  complaintTrend: Array<{ month: string; raised: number; solved: number }>
  states: string[]
}

export default function OverviewPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [shipmentsRes, complaintsRes, repossessionsRes, redeploymentsRes] = await Promise.all([
        fetch('/api/shipments'),
        fetch('/api/complaints'),
        fetch('/api/repossessions'),
        fetch('/api/redeployments'),
      ])

      // Check for authentication errors
      if (shipmentsRes.status === 401 || complaintsRes.status === 401 || 
          repossessionsRes.status === 401 || redeploymentsRes.status === 401) {
        // Redirect to sign-in if not authenticated
        router.push('/auth/signin')
        return
      }

      if (!shipmentsRes.ok || !complaintsRes.ok || !repossessionsRes.ok || !redeploymentsRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [shipmentsData, complaintsData, repossessionsData, redeploymentsData] = await Promise.all([
        shipmentsRes.json(),
        complaintsRes.json(),
        repossessionsRes.json(),
        redeploymentsRes.json(),
      ])

      const shipments = shipmentsData.shipments || []
      const complaints = complaintsData.complaints || []
      const repossessions = repossessionsData.repossessions || []
      const redeployments = redeploymentsData.redeployments || []

      // Calculate stats per PRD logic
      // PRD: Total PCs Deployed counts only COMPLETED shipments
      const completedShipments = shipments.filter((s: { status: string }) => s.status === 'COMPLETED')
      const totalPCsDeployed = completedShipments.reduce((acc: number, s: { cpus?: number }) => acc + (s.cpus || 1), 0)

      // Count unique PODs
      const uniquePODs = new Set(shipments.map((s: { podName: string }) => s.podName))
      const activePODs = uniquePODs.size

      // Shipment status breakdown
      const shipmentByStatus = {
        total: shipments.length,
        pending: shipments.filter((s: { status: string }) => s.status === 'PENDING').length,
        orderSent: shipments.filter((s: { status: string }) => s.status === 'ORDER_SENT').length,
        dispatched: shipments.filter((s: { status: string }) => s.status === 'DISPATCHED').length,
        inTransit: shipments.filter((s: { status: string }) => s.status === 'IN_TRANSIT').length,
        delivered: shipments.filter((s: { status: string }) => s.status === 'DELIVERED').length,
        completed: completedShipments.length,
        byStatus: shipments.reduce((acc: Record<string, number>, s: { status: string }) => {
          acc[s.status] = (acc[s.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      }

      // Complaint stats
      const solvedComplaints = complaints.filter((c: { status: string }) => c.status === 'SOLVED')
      const complaintStats = {
        total: complaints.length,
        solved: solvedComplaints.length,
        inProgress: complaints.filter((c: { status: string }) => c.status === 'IN_PROGRESS').length,
        open: complaints.filter((c: { status: string }) => c.status === 'OPEN').length,
        resolutionRate: complaints.length > 0 
          ? Math.round((solvedComplaints.length / complaints.length) * 100 * 10) / 10 
          : 0,
      }

      // Repossession stats
      const repossessionStats = {
        total: repossessions.length,
        pending: repossessions.filter((r: { status: string }) => r.status === 'PENDING').length,
        collected: repossessions.filter((r: { status: string }) => r.status === 'COLLECTED').length,
        inProgress: repossessions.filter((r: { status: string }) => r.status === 'IN_PROGRESS').length,
        completed: repossessions.filter((r: { status: string }) => r.status === 'COMPLETED').length,
      }

      // Redeployment stats
      const redeploymentStats = {
        total: redeployments.length,
        pending: redeployments.filter((r: { status: string }) => r.status === 'PENDING').length,
        orderSent: redeployments.filter((r: { status: string }) => r.status === 'ORDER_SENT').length,
        inTransit: redeployments.filter((r: { status: string }) => r.status === 'IN_TRANSIT').length,
        delivered: redeployments.filter((r: { status: string }) => r.status === 'DELIVERED').length,
        completed: redeployments.filter((r: { status: string }) => r.status === 'COMPLETED').length,
        complaintsSolvedWithRepurposed: redeployments.filter((r: { complaintTicket: string }) => r.complaintTicket).length,
      }

      // Monthly trends (last 6 months)
      const now = new Date()
      const monthlyTrend = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = date.toLocaleString('en', { month: 'short' })
        const monthStart = date.toISOString()
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
        
        const monthDeployments = completedShipments.filter((s: { orderDate: string }) => {
          const orderDate = new Date(s.orderDate)
          return orderDate >= new Date(monthStart) && orderDate <= new Date(monthEnd)
        })
        
        monthlyTrend.push({
          month: monthStr,
          deployments: monthDeployments.reduce((acc: number, s: { cpus?: number }) => acc + (s.cpus || 1), 0),
        })
      }

      // Complaint trend
      const complaintTrend = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = date.toLocaleString('en', { month: 'short' })
        const monthStart = date.toISOString()
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
        
        const monthComplaints = complaints.filter((c: { createdAt: string }) => {
          const created = new Date(c.createdAt)
          return created >= new Date(monthStart) && created <= new Date(monthEnd)
        })
        
        const monthSolved = monthComplaints.filter((c: { status: string }) => c.status === 'SOLVED')
        
        complaintTrend.push({
          month: monthStr,
          raised: monthComplaints.length,
          solved: monthSolved.length,
        })
      }

      // Extract states from addresses (simple extraction)
      const stateKeywords = ['Maharashtra', 'Gujarat', 'Rajasthan', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Madhya Pradesh', 'West Bengal', 'Kerala', 'Punjab', 'Haryana']
      const foundStates = new Set<string>()
      shipments.forEach((s: { shippingAddress: string }) => {
        stateKeywords.forEach(state => {
          if (s.shippingAddress?.toLowerCase().includes(state.toLowerCase())) {
            foundStates.add(state)
          }
        })
      })

      setStats({
        totalPCsDeployed,
        activePODs,
        shipments: shipmentByStatus,
        complaints: complaintStats,
        repossessions: repossessionStats,
        redeployments: redeploymentStats,
        monthlyTrend,
        complaintTrend,
        states: Array.from(foundStates),
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const complaintByStatus = [
    { name: 'Solved', value: stats.complaints.solved, color: '#22c55e' },
    { name: 'In Progress', value: stats.complaints.inProgress, color: '#f59e0b' },
    { name: 'Open', value: stats.complaints.open, color: '#ef4444' },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Overview Dashboard</h1>
        <p className="text-gray-500 mt-1">Computer Management Department - Apni Pathshala</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {/* Deployment Stats - PRD: Counts only COMPLETED shipments */}
        <div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowBreakdown(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Active
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.totalPCsDeployed.toLocaleString()}</h3>
          <p className="text-gray-500 text-sm mt-1">Total PCs Deployed</p>
          <p className="text-xs text-gray-400 mt-1">Click for breakdown</p>
        </div>

        {/* Complaint Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-sm font-medium ${stats.complaints.resolutionRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
              {stats.complaints.resolutionRate}% resolved
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.complaints.total}</h3>
          <p className="text-gray-500 text-sm mt-1">Total Complaints Raised</p>
        </div>

        {/* Repossession Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RefreshCcw className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.repossessions.total}</h3>
          <p className="text-gray-500 text-sm mt-1">Repossessions</p>
        </div>

        {/* Redeployment Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowRightLeft className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.redeployments.total}</h3>
          <p className="text-gray-500 text-sm mt-1">Redeployment Shipments</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deployment Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Deployment Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line 
                type="monotone" 
                dataKey="deployments" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Complaint Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Status</h3>
          {stats.complaints.total > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={complaintByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {complaintByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {complaintByStatus.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500">
              No complaints data
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Complaint Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.complaintTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="raised" fill="#ef4444" radius={[4, 4, 0, 0]} name="Raised" />
              <Bar dataKey="solved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Solved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Shipment Pipeline Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Pipeline</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: stats.shipments.pending, color: 'bg-gray-400' },
              { label: 'Order Sent', value: stats.shipments.orderSent, color: 'bg-blue-400' },
              { label: 'Dispatched', value: stats.shipments.dispatched, color: 'bg-indigo-400' },
              { label: 'In Transit', value: stats.shipments.inTransit, color: 'bg-cyan-400' },
              { label: 'Delivered', value: stats.shipments.delivered, color: 'bg-amber-400' },
              { label: 'Completed', value: stats.shipments.completed, color: 'bg-green-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-28 text-sm text-gray-600">{item.label}</div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ 
                      width: stats.shipments.total > 0 
                        ? `${(item.value / stats.shipments.total) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-medium text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Shipments</span>
              <span className="font-semibold text-gray-900">{stats.shipments.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Repossession → Redeployment Flow</h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.repossessions.completed}</div>
              <div className="text-sm text-gray-500">PCs Repossessed</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 w-16 bg-gray-200 relative">
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                  <TrendingUp className="w-4 h-4 text-gray-400 rotate-45" />
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.redeployments.completed}</div>
              <div className="text-sm text-gray-500">Redeployed</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 w-16 bg-gray-200"></div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.redeployments.complaintsSolvedWithRepurposed}</div>
              <div className="text-sm text-gray-500">Complaints Solved</div>
            </div>
          </div>
        </div>

        {/* Resolution Rate Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-sm text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              Overall
            </span>
          </div>
          <h3 className="text-4xl font-bold">{stats.complaints.resolutionRate}%</h3>
          <p className="text-green-100 mt-1">Complaint Resolution Rate</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-green-100">
              {stats.complaints.solved} of {stats.complaints.total} complaints resolved
            </p>
          </div>
        </div>
      </div>

      {/* Shipment Breakdown Modal */}
      {showBreakdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">PC Deployment Breakdown</h2>
              <button 
                onClick={() => setShowBreakdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Note:</strong> Total PCs Deployed counts only shipments with <span className="text-green-600 font-medium">Completed</span> status, as per PRD requirements.
              </p>
              
              {[
                { label: 'Pending', value: stats.shipments.pending, desc: 'Order not yet placed' },
                { label: 'Order Sent', value: stats.shipments.orderSent, desc: 'Vendor not yet confirmed' },
                { label: 'Dispatched', value: stats.shipments.dispatched, desc: 'Equipment in preparation' },
                { label: 'In Transit', value: stats.shipments.inTransit, desc: 'Equipment in transit' },
                { label: 'Delivered', value: stats.shipments.delivered, desc: 'Arrived, QC pending' },
                { label: 'Completed', value: stats.shipments.completed, desc: '✓ Delivered, QC verified' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className={`font-medium ${item.label === 'Completed' ? 'text-green-600' : 'text-gray-900'}`}>
                      {item.label}
                    </span>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total PCs Deployed (Completed only)</span>
                <span className="text-2xl font-bold text-green-600">{stats.totalPCsDeployed}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
