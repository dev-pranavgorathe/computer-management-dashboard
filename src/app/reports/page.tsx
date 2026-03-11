'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, TrendingUp, CheckCircle, AlertCircle, RefreshCcw, ArrowRightLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { toast } from 'react-hot-toast'

interface ReportData {
  dateRange: string
  pcsDeployed: number
  totalShipments: number
  complaintsRaised: number
  complaintsSolved: number
  repossessions: number
  redeployments: number
  resolutionRate: number
  activityData: Array<{ name: string; count: number; type: string }>
  achievements: string
  challenges: string
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<'weekly' | 'monthly' | 'custom'>('weekly')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // In production, this would be an API call with date parameters
      // For now, we'll use mock data
      const mockData: ReportData = {
        dateRange: dateRange === 'custom' ? `${customStartDate} to ${customEndDate}` : dateRange,
        pcsDeployed: 45,
        totalShipments: 52,
        complaintsRaised: 12,
        complaintsSolved: 10,
        repossessions: 3,
        redeployments: 4,
        resolutionRate: 83.33,
        activityData: [
          { name: 'Week 1', count: 15, type: 'shipments' },
          { name: 'Week 2', count: 12, type: 'shipments' },
          { name: 'Week 3', count: 18, type: 'shipments' },
          { name: 'Week 4', count: 7, type: 'shipments' },
        ],
        achievements: '• Successfully deployed 45 computers across 8 PODs\n• Reduced complaint resolution time by 25%\n• Completed 3 repossessions ahead of schedule\n• Implemented new QC checklist',
        challenges: '• Delayed shipments due to vendor stock issues (3 cases)\n• Higher than expected complaint rate at new PODs\n• Need for additional training on new hardware models\n• Coordination challenges with remote POD locations'
      }
      
      setReportData(mockData)
      toast.success('Report generated successfully!')
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dateRange !== 'custom') {
      fetchReportData()
    }
  }, [dateRange])

  const handleGenerateReport = () => {
    if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
      toast.error('Please select both start and end dates')
      return
    }
    fetchReportData()
  }

  const handleExportPDF = () => {
    toast.success('PDF export coming in v2!')
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Summary Reports</h1>
            <p className="text-gray-600 mt-2">Generate operational summary reports</p>
          </div>
          {reportData && (
            <button
              onClick={handleExportPDF}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Date Range</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('weekly')}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 'weekly' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setDateRange('monthly')}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 'monthly' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 'custom' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom
            </button>
          </div>

          {dateRange === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={handleGenerateReport}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Generate Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Generating report...</p>
          </div>
        </div>
      )}

      {/* Report Content */}
      {reportData && !loading && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">{dateRange === 'weekly' ? 'This Week' : dateRange === 'monthly' ? 'This Month' : 'Custom Range'}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.pcsDeployed}</p>
              <p className="text-sm text-gray-600 mt-1">PCs Deployed</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.totalShipments}</p>
              <p className="text-sm text-gray-600 mt-1">Total Shipments</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.complaintsRaised}</p>
              <p className="text-sm text-gray-600 mt-1">Complaints Raised</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.complaintsSolved}</p>
              <p className="text-sm text-gray-600 mt-1">Complaints Solved</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <RefreshCcw className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.repossessions}</p>
              <p className="text-sm text-gray-600 mt-1">Repossessions</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <ArrowRightLeft className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.redeployments}</p>
              <p className="text-sm text-gray-600 mt-1">Redeployments</p>
            </div>
          </div>

          {/* Complaint Resolution Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Complaint Resolution Rate</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {reportData.complaintsSolved} of {reportData.complaintsRaised} complaints resolved
                </span>
                <span className="text-2xl font-bold text-green-600">{reportData.resolutionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${reportData.resolutionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Operational Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Key Achievements</h3>
              <textarea
                value={reportData.achievements}
                onChange={(e) => setReportData({ ...reportData, achievements: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="List key achievements..."
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Challenges Faced</h3>
              <textarea
                value={reportData.challenges}
                onChange={(e) => setReportData({ ...reportData, challenges: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="List challenges faced..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
