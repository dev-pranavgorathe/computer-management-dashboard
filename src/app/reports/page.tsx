'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, Download, FileText, Loader2, TrendingUp } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'react-hot-toast'

interface ReportResponse {
  summary: {
    pcsDeployed: number
    totalShipments: number
    complaintsRaised: number
    complaintsSolved: number
    repossessions: number
    redeployments: number
    resolutionRate: number
  }
  highlights: {
    completedPods: number
    linkedRedeployments: number
  }
  activityData: Array<{
    name: string
    shipments: number
    complaints: number
    repossessions: number
    redeployments: number
  }>
  achievements: string[]
  challenges: string[]
}

type DateRange = 'weekly' | 'monthly' | 'custom'

function getPresetRange(range: DateRange, customStartDate: string, customEndDate: string) {
  if (range === 'custom') {
    return {
      dateFrom: customStartDate,
      dateTo: customEndDate,
    }
  }

  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - (range === 'weekly' ? 6 : 29))

  return {
    dateFrom: start.toISOString().split('T')[0],
    dateTo: now.toISOString().split('T')[0],
  }
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('weekly')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [reportData, setReportData] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReportData = async (selectedRange: DateRange = dateRange) => {
    const { dateFrom, dateTo } = getPresetRange(selectedRange, customStartDate, customEndDate)

    if (!dateFrom || !dateTo) {
      toast.error('Please select both start and end dates')
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
      })

      const response = await fetch(`/api/reports?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to generate report')

      const data = await response.json()
      setReportData(data)
      toast.success('Report generated successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dateRange !== 'custom') {
      fetchReportData(dateRange)
    }
  }, [dateRange])

  const handleExport = () => {
    if (!reportData) return

    const lines = [
      'Apni Pathshala - Summary Report',
      '',
      `PCs Deployed: ${reportData.summary.pcsDeployed}`,
      `Total Shipments: ${reportData.summary.totalShipments}`,
      `Complaints Raised: ${reportData.summary.complaintsRaised}`,
      `Complaints Solved: ${reportData.summary.complaintsSolved}`,
      `Resolution Rate: ${reportData.summary.resolutionRate}%`,
      `Repossessions: ${reportData.summary.repossessions}`,
      `Redeployments: ${reportData.summary.redeployments}`,
      '',
      'Achievements',
      ...reportData.achievements.map(item => `- ${item}`),
      '',
      'Challenges',
      ...reportData.challenges.map(item => `- ${item}`),
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `summary-report-${new Date().toISOString().split('T')[0]}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported')
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Summary Reports</h1>
          <p className="mt-1 text-gray-500">Generate reports from real operational data</p>
        </div>
        {reportData ? (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            <Download className="h-5 w-5" />
            Export Summary
          </button>
        ) : null}
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Select Date Range</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('weekly')}
              className={`rounded-lg px-4 py-2 ${dateRange === 'weekly' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setDateRange('monthly')}
              className={`rounded-lg px-4 py-2 ${dateRange === 'monthly' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`rounded-lg px-4 py-2 ${dateRange === 'custom' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Custom
            </button>
          </div>

          {dateRange === 'custom' ? (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input type="date" value={customStartDate} onChange={event => setCustomStartDate(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2" />
                <span className="text-gray-500">to</span>
                <input type="date" value={customEndDate} onChange={event => setCustomEndDate(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <button onClick={() => fetchReportData('custom')} className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
                Generate Report
              </button>
            </>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-100 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Generating report...</span>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-green-50 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Deployments</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.summary.pcsDeployed}</p>
              <p className="mt-1 text-sm text-gray-600">PCs deployed</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-blue-50 p-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Logistics</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.summary.totalShipments}</p>
              <p className="mt-1 text-sm text-gray-600">Total shipments</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-orange-50 p-3">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">{reportData.summary.resolutionRate}% resolved</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.summary.complaintsRaised}</p>
              <p className="mt-1 text-sm text-gray-600">Complaints raised</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Complaints solved</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{reportData.summary.complaintsSolved}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Repossessions</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">{reportData.summary.repossessions}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Redeployments</p>
              <p className="mt-2 text-3xl font-bold text-indigo-600">{reportData.summary.redeployments}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Operational Activity</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={reportData.activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Area type="monotone" dataKey="shipments" stackId="1" stroke="#2563eb" fill="#93c5fd" />
                  <Area type="monotone" dataKey="complaints" stackId="1" stroke="#f97316" fill="#fdba74" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Repossessions and Redeployments</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={reportData.activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="repossessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="redeployments" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Achievements</h3>
              <div className="space-y-3">
                {reportData.achievements.map(item => (
                  <div key={item} className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Challenges</h3>
              <div className="space-y-3">
                {reportData.challenges.map(item => (
                  <div key={item} className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
