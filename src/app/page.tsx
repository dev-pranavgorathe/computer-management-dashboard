'use client'

import { 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCcw, 
  ArrowRightLeft,
  TrendingUp,
  MapPin
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

// Mock data - Replace with actual data from Google Sheets/API
const deploymentData = {
  totalPCs: 1250,
  totalPODs: 85,
  states: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Madhya Pradesh'],
  monthlyTrend: [
    { month: 'Jan', deployments: 45 },
    { month: 'Feb', deployments: 52 },
    { month: 'Mar', deployments: 38 },
    { month: 'Apr', deployments: 65 },
    { month: 'May', deployments: 72 },
    { month: 'Jun', deployments: 58 },
  ]
}

const complaintData = {
  totalRaised: 156,
  totalSolved: 132,
  resolutionRate: 84.6,
  byStatus: [
    { name: 'Solved', value: 132, color: '#22c55e' },
    { name: 'In Progress', value: 18, color: '#f59e0b' },
    { name: 'Pending', value: 6, color: '#ef4444' },
  ],
  trend: [
    { month: 'Jan', raised: 25, solved: 22 },
    { month: 'Feb', raised: 30, solved: 28 },
    { month: 'Mar', raised: 22, solved: 20 },
    { month: 'Apr', raised: 28, solved: 25 },
    { month: 'May', raised: 32, solved: 24 },
    { month: 'Jun', raised: 19, solved: 13 },
  ]
}

const repossessionData = {
  totalPODs: 23,
  totalPCs: 67,
}

const redeploymentData = {
  totalShipments: 45,
  complaintsSolvedWithRepurposed: 38,
}

export default function OverviewPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Overview Dashboard</h1>
        <p className="text-gray-500 mt-1">Computer Management Department - Apni Pathshala</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {/* Deployment Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{deploymentData.totalPCs.toLocaleString()}</h3>
          <p className="text-gray-500 text-sm mt-1">Total PCs Deployed</p>
        </div>

        {/* Complaint Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-sm font-medium ${complaintData.resolutionRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
              {complaintData.resolutionRate}% resolved
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{complaintData.totalRaised}</h3>
          <p className="text-gray-500 text-sm mt-1">Total Complaints Raised</p>
        </div>

        {/* Repossession Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RefreshCcw className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{repossessionData.totalPCs}</h3>
          <p className="text-gray-500 text-sm mt-1">PCs Repossessed</p>
        </div>

        {/* Redeployment Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowRightLeft className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{redeploymentData.totalShipments}</h3>
          <p className="text-gray-500 text-sm mt-1">Redeployment Shipments</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deployment Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Deployment Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={deploymentData.monthlyTrend}>
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
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={complaintData.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complaintData.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {complaintData.byStatus.map((item) => (
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
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Complaint Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={complaintData.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="raised" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="solved" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Deployment Reach Map */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Deployment Reach
            </div>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {deploymentData.states.map((state, index) => (
              <div 
                key={state}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-sm text-gray-700">{state}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Active in <span className="font-semibold text-gray-900">{deploymentData.states.length}</span> states across India
            </p>
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
              <div className="text-2xl font-bold text-purple-600">{repossessionData.totalPCs}</div>
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
              <div className="text-2xl font-bold text-green-600">{redeploymentData.totalShipments}</div>
              <div className="text-sm text-gray-500">Redeployed</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 w-16 bg-gray-200"></div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{redeploymentData.complaintsSolvedWithRepurposed}</div>
              <div className="text-sm text-gray-500">Complaints Solved</div>
            </div>
          </div>
        </div>

        {/* Resolution Rate Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-sm text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              This Month
            </span>
          </div>
          <h3 className="text-4xl font-bold">{complaintData.resolutionRate}%</h3>
          <p className="text-green-100 mt-1">Complaint Resolution Rate</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-green-100">
              {complaintData.totalSolved} of {complaintData.totalRaised} complaints resolved
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
