'use client'

import { useEffect, useState } from 'react'
import { CheckSquare, Clock, CheckCircle, XCircle, User, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ApprovalRequest {
  id: string
  entityType: string
  entityId: string
  action: string
  status: string
  reason: string | null
  payload: string | null
  requesterId: string
  requester: {
    id: string
    name: string
    email: string
    role: string
  }
  approverId: string | null
  approver: {
    id: string
    name: string
    email: string
  } | null
  createdAt: string
  reviewedAt: string | null
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('PENDING')

  useEffect(() => {
    fetchApprovals()
  }, [statusFilter])

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/approvals?status=${statusFilter}`)
      const data = await res.json()

      if (res.ok) {
        setApprovals(data.approvals || [])
      } else {
        toast.error(data.error || 'Failed to fetch approvals')
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error)
      toast.error('Failed to load approval requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (approvalId: string, approved: boolean) => {
    try {
      setProcessing(approvalId)
      
      const res = await fetch(`/api/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: approved ? 'APPROVED' : 'REJECTED',
          reviewNotes: approved ? 'Approved via dashboard' : 'Rejected via dashboard'
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(approved ? 'Request approved successfully' : 'Request rejected')
        fetchApprovals()
      } else {
        toast.error(data.error || 'Failed to process approval')
      }
    } catch (error) {
      console.error('Failed to process approval:', error)
      toast.error('Failed to process request')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Shipment: '📦 Shipment',
      Complaint: '🎫 Complaint',
      Repossession: '🔄 Repossession',
      Redeployment: '↔️ Redeployment',
    }
    return labels[type] || type
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      DELETE: 'Delete Request',
      COMPLETE: 'Complete Request',
      UPDATE: 'Update Request',
    }
    return labels[action] || action
  }

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length
  const approvedCount = approvals.filter(a => a.status === 'APPROVED').length
  const rejectedCount = approvals.filter(a => a.status === 'REJECTED').length

  return (
    <div className="p-6 lg:p-8 fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Approval Queue</h1>
        <p className="mt-1 text-gray-500">Review and approve or reject pending requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-500">Approved</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-500">Rejected</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{rejectedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{approvals.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading approval requests...</p>
          </div>
        ) : approvals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50 text-gray-400" />
            <p className="text-gray-500">No approval requests found</p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
                      {approval.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {getEntityTypeLabel(approval.entityType)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getActionLabel(approval.action)}
                    </span>
                  </div>

                  {/* Requester Info */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{approval.requester.name}</span>
                      <span className="text-gray-400">({approval.requester.email})</span>
                    </div>
                  </div>

                  {/* Reason */}
                  {approval.reason && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {approval.reason}
                      </p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Created: {formatDate(approval.createdAt)}</span>
                    </div>
                    {approval.reviewedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Reviewed: {formatDate(approval.reviewedAt)}</span>
                      </div>
                    )}
                    {approval.approver && (
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>By: {approval.approver.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {approval.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(approval.id, true)}
                      disabled={processing === approval.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing === approval.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(approval.id, false)}
                      disabled={processing === approval.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing === approval.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
