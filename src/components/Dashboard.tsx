'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Package, AlertTriangle, RefreshCw, ArrowRightLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    shipments: 0,
    complaints: 0,
    repossessions: 0,
    redeployments: 0
  })
  
  const [shipmentData] = useState([
    { period: 'Jan', shipments: 12, complaints: 3 },
    { period: 'Feb', shipments: 15, complaints: 5 },
    { period: 'Mar', shipments: 18, complaints: 2 },
    { period: 'Apr', shipments: 10, complaints: 4 },
    { period: 'May', shipments: 22, complaints: 1 },
    { period: 'Jun', shipments: 25, complaints: 3 },
  ])

  useEffect(() => {
    // Fetch stats from API
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Will connect to Supabase APIs
      setStats({
        shipments: 13,
        complaints: 24,
        repossessions: 15,
        redeployments: 7
      })
    } catch (error) {
      console.error('Failed to fetch stats')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-6 h-6 text-blue-600" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.shipments}</div>
              <div className="text-sm text-gray-500">Shipments</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.complaints}</div>
              <div className="text-sm text-gray-500">Complaints</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <RefreshCw className="w-6 h-6 text-purple-600" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.repossessions}</div>
              <div className="text-sm text-gray-500">Repossessions</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <ArrowRightLeft className="w-6 h-6 text-green-600" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.redeployments}</div>
              <div className="text-sm text-gray-500">Redeployments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Shipment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={shipmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="shipments" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Complaint Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={shipmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="complaints" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
