'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Download, Edit, Eye, Loader2, Plus, Search, Trash2, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Modal from '@/components/Modal'
import { exportToCSV, exportToExcel, formatDate } from '@/lib/export'

interface Complaint {
  id: string
  refId: string
  ticket?: string | null
  podName: string
  phase?: string | null
  deviceType: string
  deviceSerial?: string | null
  issue: string
  description?: string | null
  contactPerson?: string | null
  mobileNumber?: string | null
  reportedDate?: string
  solvedDate?: string | null
  resolution?: string | null
  resolutionMethod?: string | null
  remarks?: string | null
  attachments?: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'SOLVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  mailSent: boolean
  mailSentAt?: string | null
  createdAt: string
}

interface ComplaintFormData {
  podName: string
  phase: string
  deviceType: string
  deviceSerial: string
  issue: string
  description: string
  contactPerson: string
  mobileNumber: string
  priority: Complaint['priority']
  status: Complaint['status']
  resolution: string
  resolutionMethod: string
  ticket: string
  remarks: string
  attachments: string
}

const initialFormData: ComplaintFormData = {
  podName: '',
  phase: '',
  deviceType: 'CPU',
  deviceSerial: '',
  issue: '',
  description: '',
  contactPerson: '',
  mobileNumber: '+91 ',
  priority: 'MEDIUM',
  status: 'OPEN',
  resolution: '',
  resolutionMethod: '',
  ticket: '',
  remarks: '',
  attachments: '',
}

const statusColors: Record<Complaint['status'], string> = {
  OPEN: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  SOLVED: 'bg-green-100 text-green-700',
}

const priorityColors: Record<Complaint['priority'], string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  HIGH: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-rose-100 text-rose-700',
}

const deviceTypes = ['CPU', 'MONITOR', 'KEYBOARD', 'MOUSE', 'WEBCAM', 'HEADPHONES', 'PSU', 'NETWORK_ADAPTER', 'OTHER']

const resolutionMethods = [
  { value: 'REPAIRED', label: 'Repaired' },
  { value: 'REPLACED_UNDER_WARRANTY', label: 'Replaced (Under Warranty)' },
  { value: 'REPLACED_OUT_OF_WARRANTY', label: 'Replaced (Out of Warranty)' },
  { value: 'REDEPLOYMENT', label: 'Redeployment' },
  { value: 'OTHER', label: 'Other' },
]

function formatResolutionMethod(method: string | null | undefined): string {
  if (!method) return '-'
  const found = resolutionMethods.find(m => m.value === method)
  return found ? found.label : method
}

function getFormData(complaint?: Complaint | null): ComplaintFormData {
  if (!complaint) {
    return { ...initialFormData, mobileNumber: '+91 ' }
  }

  return {
    podName: complaint.podName,
    phase: complaint.phase || '',
    deviceType: complaint.deviceType,
    deviceSerial: complaint.deviceSerial || '',
    issue: complaint.issue,
    description: complaint.description || '',
    contactPerson: complaint.contactPerson || '',
    mobileNumber: complaint.mobileNumber || '+91 ',
    priority: complaint.priority,
    status: complaint.status,
    resolution: complaint.resolution || '',
    resolutionMethod: complaint.resolutionMethod || '',
    ticket: complaint.ticket || '',
    remarks: complaint.remarks || '',
    attachments: complaint.attachments || '',
  }
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null)
  const [formData, setFormData] = useState<ComplaintFormData>({ ...initialFormData, mobileNumber: '+91 ' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [sendingMail, setSendingMail] = useState(false)

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '25',
      })

      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (deviceTypeFilter !== 'all') params.set('deviceType', deviceTypeFilter)

      const response = await fetch(`/api/complaints?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Failed to fetch complaints')

      const data = await response.json()
      setComplaints(data.complaints || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalRecords(data.pagination?.total || 0)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [currentPage, searchTerm, statusFilter, priorityFilter, deviceTypeFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, priorityFilter, deviceTypeFilter])

  // Combine OPEN and IN_PROGRESS for counting
  const stats = {
    total: totalRecords,
    solved: complaints.filter(c => c.status === 'SOLVED').length,
    openOrInProgress: complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length,
    open: complaints.filter(c => c.status === 'OPEN').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleOpenCreate = () => {
    setEditingComplaint(null)
    setFormData({ ...initialFormData, mobileNumber: '+91 ' })
    setFormErrors({})
    setShowFormModal(true)
  }

  const handleOpenEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/complaints/${id}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch complaint')
      const complaint = await response.json()
      setEditingComplaint(complaint)
      setFormData(getFormData(complaint))
      setFormErrors({})
      setShowFormModal(true)
    } catch (err) {
      console.error(err)
      toast.error('Failed to open complaint editor')
    }
  }

  const handleOpenView = async (id: string) => {
    try {
      const response = await fetch(`/api/complaints/${id}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch complaint')
      setSelectedComplaint(await response.json())
    } catch (err) {
      console.error(err)
      toast.error('Failed to load complaint details')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setFormErrors({})

      const payload: Record<string, string | null> = {
        podName: formData.podName,
        phase: formData.phase || null,
        deviceType: formData.deviceType,
        deviceSerial: formData.deviceSerial || null,
        issue: formData.issue,
        description: formData.description || null,
        contactPerson: formData.contactPerson || null,
        mobileNumber: formData.mobileNumber || null,
        priority: formData.priority,
        ticket: formData.ticket || null,
        attachments: formData.attachments || null,
      }

      // When creating, status is always OPEN
      // When editing, we can change status
      if (editingComplaint) {
        payload.status = formData.status
        payload.resolution = formData.resolution || null
        payload.resolutionMethod = formData.resolutionMethod || null
        payload.remarks = formData.remarks || null
        payload.solvedDate = formData.status === 'SOLVED' ? new Date().toISOString() : null
      }

      const response = await fetch(
        editingComplaint ? `/api/complaints/${editingComplaint.id}` : '/api/complaints',
        {
          method: editingComplaint ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        if (data.details) {
          const nextErrors: Record<string, string> = {}
          data.details.forEach((detail: { field: string; message: string }) => {
            nextErrors[detail.field] = detail.message
          })
          setFormErrors(nextErrors)
        }
        throw new Error(data.error || 'Failed to save complaint')
      }

      toast.success(editingComplaint ? 'Complaint updated' : 'Complaint created')
      setShowFormModal(false)
      setEditingComplaint(null)
      setFormData({ ...initialFormData, mobileNumber: '+91 ' })
      
      // Refresh the list and select the new/updated complaint
      await fetchComplaints()
      setSelectedComplaint(data)
    } catch (err) {
      console.error(err)
      setFormErrors(prev => ({
        ...prev,
        submit: err instanceof Error ? err.message : 'Failed to save complaint',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this complaint?')) return

    try {
      const response = await fetch(`/api/complaints/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete complaint')
      toast.success('Complaint deleted')
      if (selectedComplaint?.id === id) setSelectedComplaint(null)
      fetchComplaints()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete complaint')
    }
  }

  const handleSendMail = async (complaint: Complaint) => {
    if (complaint.mailSent) {
      toast.error('Mail already sent for this complaint')
      return
    }
    
    if (!window.confirm('Send complaint email to vendor? This will change status to IN_PROGRESS.')) return

    try {
      setSendingMail(true)
      // Update complaint with mailSent = true and status = IN_PROGRESS
      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mailSent: true,
          mailSentAt: new Date().toISOString(),
          status: 'IN_PROGRESS'
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send mail')
      }

      const updatedComplaint = await response.json()
      toast.success('Complaint email sent and status updated to IN_PROGRESS')
      setSelectedComplaint(updatedComplaint)
      fetchComplaints()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to send mail')
    } finally {
      setSendingMail(false)
    }
  }

  const handlePreviewMail = (complaint: Complaint) => {
    const mailContent = `
Complaint Email Preview
=======================
Ticket: ${complaint.ticket || 'N/A'}
Ref ID: ${complaint.refId}
POD Name: ${complaint.podName}
Phase: ${complaint.phase || 'N/A'}
Device Type: ${complaint.deviceType}
Device Serial: ${complaint.deviceSerial || 'N/A'}
Issue: ${complaint.issue}
Description: ${complaint.description || 'N/A'}
Contact Person: ${complaint.contactPerson || 'N/A'}
Mobile: ${complaint.mobileNumber || 'N/A'}
Priority: ${complaint.priority}
Reported Date: ${formatDate(complaint.createdAt)}
    `.trim()
    alert(mailContent)
  }

  // Show mail buttons only for OPEN status (not IN_PROGRESS or SOLVED)
  const canShowMailButtons = (complaint: Complaint) => {
    return complaint.status === 'OPEN' && !complaint.mailSent
  }

  const exportRows = complaints.map(complaint => ({
    'Ref ID': complaint.refId,
    Ticket: complaint.ticket || '',
    POD: complaint.podName,
    Phase: complaint.phase || '',
    Device: complaint.deviceType,
    Issue: complaint.issue,
    Priority: complaint.priority,
    Status: complaint.status,
    'Resolution Method': formatResolutionMethod(complaint.resolutionMethod),
    'Mail Sent': complaint.mailSent ? 'Yes' : 'No',
    'Contact Person': complaint.contactPerson || '',
    'Mobile Number': complaint.mobileNumber || '',
    'Reported Date': formatDate(complaint.createdAt),
    'Solved Date': formatDate(complaint.solvedDate || null),
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Complaint Management</h1>
          <p className="mt-1 text-gray-500">Track and resolve real complaints from the database</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToCSV(exportRows, 'complaints')}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            CSV
          </button>
          <button
            onClick={async () => { await exportToExcel(exportRows, 'complaints') }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            Excel
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            Log Complaint
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Records</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.solved}</div>
          <div className="text-sm text-gray-500">Solved on this page</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.openOrInProgress}</div>
          <div className="text-sm text-gray-500">Open / In Progress</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
          <div className="text-sm text-gray-500">Open (Pending Mail)</div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search by POD, ref ID, ticket, issue, serial..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoComplete="off"
            />
          </div>
          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SOLVED">Solved</option>
          </select>
          <select
            value={priorityFilter}
            onChange={event => setPriorityFilter(event.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select
            value={deviceTypeFilter}
            onChange={event => setDeviceTypeFilter(event.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All device types</option>
            {deviceTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-gray-100 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Loading complaints...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">POD Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">POD Phase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Issue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reported Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Solved Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No complaints found for the current filters.
                    </td>
                  </tr>
                ) : (
                  complaints.map(complaint => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{complaint.podName}</div>
                        <div className="text-sm text-gray-500">{complaint.ticket || 'No ticket'}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{complaint.phase || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>{complaint.deviceType.replace(/_/g, ' ')}</div>
                        <div className="text-gray-500">{complaint.deviceSerial || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-gray-700">{complaint.issue}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(complaint.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(complaint.solvedDate || null)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[complaint.status]}`}>
                          {complaint.status.replace(/_/g, ' ')}
                        </span>
                        {complaint.mailSent && (
                          <span className="ml-2 text-xs text-green-600">(Mail Sent)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {canShowMailButtons(complaint) && (
                            <>
                              <button 
                                onClick={() => handlePreviewMail(complaint)} 
                                className="p-1 text-gray-400 hover:text-gray-700"
                                title="Preview Mail"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleSendMail(complaint)} 
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Send Mail"
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleOpenView(complaint.id)} className="p-1 text-gray-400 hover:text-gray-700">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleOpenEdit(complaint.id)} className="p-1 text-gray-400 hover:text-gray-700">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(complaint.id)} className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm text-gray-500">
            <span>Showing page {currentPage} of {totalPages} • {totalRecords} total records</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="rounded border border-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="rounded border border-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormModal ? (
        <Modal
          title={editingComplaint ? 'Edit Complaint' : 'Log Complaint'}
          subtitle={editingComplaint?.refId}
          onClose={() => {
            setShowFormModal(false)
            setEditingComplaint(null)
            setFormData({ ...initialFormData, mobileNumber: '+91 ' })
            setFormErrors({})
          }}
          maxWidthClassName="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {formErrors.submit ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formErrors.submit}</div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">POD Name <span className="text-red-500">*</span></label>
                <input 
                  name="podName" 
                  value={formData.podName} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  autoComplete="off"
                  required
                />
                {formErrors.podName ? <p className="mt-1 text-xs text-red-500">{formErrors.podName}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">POD Phase</label>
                <input 
                  name="phase" 
                  value={formData.phase} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Device Type <span className="text-red-500">*</span></label>
                <select 
                  name="deviceType" 
                  value={formData.deviceType} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                >
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Device Serial</label>
                <input 
                  name="deviceSerial" 
                  value={formData.deviceSerial} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                <select 
                  name="priority" 
                  value={formData.priority} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              {editingComplaint ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Ticket Number</label>
                    <input 
                      name="ticket" 
                      value={formData.ticket} 
                      onChange={handleInputChange} 
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      autoComplete="off"
                      placeholder="TKT-XXXX or N/A"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange} 
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="SOLVED">Solved</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Resolution Method</label>
                    <select 
                      name="resolutionMethod" 
                      value={formData.resolutionMethod} 
                      onChange={handleInputChange} 
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <option value="">Select Resolution Method</option>
                      {resolutionMethods.map(method => (
                        <option key={method.value} value={method.value}>{method.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : null}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Person</label>
                <input 
                  name="contactPerson" 
                  value={formData.contactPerson} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number</label>
                <input 
                  name="mobileNumber" 
                  value={formData.mobileNumber} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="+91 XXXXX XXXXX"
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Issue <span className="text-red-500">*</span></label>
              <input 
                name="issue" 
                value={formData.issue} 
                onChange={handleInputChange} 
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                autoComplete="off"
                required
              />
              {formErrors.issue ? <p className="mt-1 text-xs text-red-500">{formErrors.issue}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows={3} 
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Attachments (Google Drive links, URLs - one per line)</label>
              <textarea 
                name="attachments" 
                value={formData.attachments} 
                onChange={handleInputChange} 
                rows={3} 
                placeholder="https://drive.google.com/...&#10;https://example.com/file.pdf"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                autoComplete="off"
              />
            </div>
            {editingComplaint ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Resolution Notes</label>
                  <textarea 
                    name="resolution" 
                    value={formData.resolution} 
                    onChange={handleInputChange} 
                    rows={2} 
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
                  <textarea 
                    name="remarks" 
                    value={formData.remarks} 
                    onChange={handleInputChange} 
                    rows={2} 
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    autoComplete="off"
                  />
                </div>
              </>
            ) : null}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowFormModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingComplaint ? 'Save Changes' : 'Create Complaint'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {selectedComplaint ? (
        <Modal
          title="Complaint Details"
          subtitle={`${selectedComplaint.refId} • ${selectedComplaint.ticket || 'No Ticket'}`}
          onClose={() => setSelectedComplaint(null)}
        >
          <div className="space-y-6 p-6">
            <div className="flex flex-wrap gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedComplaint.status]}`}>
                {selectedComplaint.status.replace(/_/g, ' ')}
              </span>
              <span className={`rounded px-2 py-1 text-xs font-medium ${priorityColors[selectedComplaint.priority]}`}>
                {selectedComplaint.priority}
              </span>
              {selectedComplaint.mailSent && (
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Mail Sent
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">POD Name</p>
                <p className="font-medium text-gray-900">{selectedComplaint.podName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">POD Phase</p>
                <p className="font-medium text-gray-900">{selectedComplaint.phase || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Device Type</p>
                <p className="font-medium text-gray-900">{selectedComplaint.deviceType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Device Serial</p>
                <p className="font-medium text-gray-900">{selectedComplaint.deviceSerial || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ticket Number</p>
                <p className="font-medium text-gray-900">{selectedComplaint.ticket || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reported</p>
                <p className="font-medium text-gray-900">{formatDate(selectedComplaint.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="font-medium text-gray-900">{selectedComplaint.contactPerson || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="font-medium text-gray-900">{selectedComplaint.mobileNumber || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issue</p>
              <p className="font-medium text-gray-900">{selectedComplaint.issue}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-900">{selectedComplaint.description || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolution</p>
              <p className="text-gray-900">{selectedComplaint.resolution || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolution Method</p>
              <p className="text-gray-900">{formatResolutionMethod(selectedComplaint.resolutionMethod)}</p>
            </div>
            
            {selectedComplaint.attachments && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Attachments</p>
                <div className="space-y-1">
                  {selectedComplaint.attachments.split('\n').filter(url => url.trim()).map((url, i) => (
                    <a 
                      key={i}
                      href={url.trim()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-sm break-all block"
                    >
                      {url.trim()}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mail buttons - only show for OPEN status */}
            {canShowMailButtons(selectedComplaint) && (
              <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <button
                  onClick={() => handlePreviewMail(selectedComplaint)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Preview Mail
                </button>
                <button
                  onClick={() => handleSendMail(selectedComplaint)}
                  disabled={sendingMail}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {sendingMail ? 'Sending...' : 'Send Mail to Vendor'}
                </button>
              </div>
            )}
            
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button onClick={() => handleOpenEdit(selectedComplaint.id)} className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600">
                Edit
              </button>
              <button onClick={() => handleDelete(selectedComplaint.id)} className="rounded-lg bg-red-600 px-4 py-2 text-white">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
