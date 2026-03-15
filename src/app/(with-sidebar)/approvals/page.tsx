'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface Approval {
  id: string
  entityType: string
  entityId: string
  action: string
  status: string
  reason?: string
  requester?: { name?: string; email?: string }
  createdAt: string
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/approvals?status=PENDING')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch approvals')
      setItems(data.approvals || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to fetch approvals')
    } finally {
      setLoading(false)
    }
  }

  const decide = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/approvals/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to process request')
      toast.success(data.message || `Request ${decision.toLowerCase()}d`)
      await fetchItems()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to process request')
    }
  }

  useEffect(() => { fetchItems() }, [])

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Approval Queue</h1>
      <p className="mt-1 text-gray-500">Critical actions requiring manager/admin sign-off.</p>

      {loading ? <div className="mt-6 text-gray-500">Loading...</div> : null}

      {!loading ? (
        <div className="mt-6 space-y-3">
          {items.length === 0 ? <div className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">No pending approvals.</div> : null}
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-gray-900">{item.action} · {item.entityType}</div>
                  <div className="text-sm text-gray-600">{item.entityId}</div>
                  <div className="text-xs text-gray-500">By {item.requester?.name || item.requester?.email || 'Unknown'} · {new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => decide(item.id, 'APPROVE')} className="rounded bg-green-600 px-3 py-1.5 text-sm text-white">Approve</button>
                  <button onClick={() => decide(item.id, 'REJECT')} className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
