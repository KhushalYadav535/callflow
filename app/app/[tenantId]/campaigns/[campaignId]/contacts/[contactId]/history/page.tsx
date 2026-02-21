'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type CallLog = {
  _id: string
  attemptNumber: number
  createdAt: string
  calledAt?: string
  outcome: string
  disposition?: string | null
  duration?: number
  transcript?: string | null
  recordingUrl?: string | null
  optOutDetected?: boolean
}

type ManualUpdate = {
  _id: string
  updatedBy: string
  timestamp?: string
  createdAt?: string
  oldDisposition?: string | null
  newDisposition: string
  note?: string | null
}

type ReassignLog = {
  _id: string
  updatedBy: string
  timestamp?: string
  createdAt?: string
  targetCampaignId: string
  targetCampaignName?: string | null
  newContactId: string
}

type HistoryResponse = {
  contact: { _id: string; name: string; phone: string; amount?: number; dueDate?: string; callStatus: string; paymentDisposition?: string }
  callLogs: CallLog[]
  manualUpdates: ManualUpdate[]
  reassignLogs?: ReassignLog[]
}

export default function ContactHistoryPage() {
  const params = useParams<{ tenantId: string; campaignId: string; contactId: string }>()
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedTranscript, setExpandedTranscript] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!API_URL || !params.contactId) return
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Not logged in')
      setLoading(false)
      return
    }
    fetch(`${API_URL}/api/contacts/${params.contactId}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => {
        if (d.message) throw new Error(d.message)
        setData(d)
      })
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [params.contactId])

  const toggleTranscript = (id: string) => {
    setExpandedTranscript((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const truncate = (s: string | null | undefined, len: number) => {
    if (!s) return ''
    return s.length <= len ? s : s.slice(0, len) + '...'
  }

  if (loading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6 text-destructive">{error}</p>
  if (!data) return null

  const { contact, callLogs, manualUpdates, reassignLogs = [] } = data
  const items = [
    ...callLogs.map((log) => ({ type: 'call' as const, ...log, sortAt: log.createdAt || log.calledAt })),
    ...manualUpdates.map((mu) => ({ type: 'manual' as const, ...mu, sortAt: (mu as any).timestamp || (mu as any).createdAt })),
    ...reassignLogs.map((rl) => ({ type: 'reassign' as const, ...rl, sortAt: rl.timestamp || rl.createdAt })),
  ].sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())

  return (
    <div className="space-y-6 pb-8">
      <Link
        href={`/app/${params.tenantId}/campaigns/${params.campaignId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft size={16} />
        Back to campaign
      </Link>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Contact</h2>
        <p><strong>Name:</strong> {contact.name}</p>
        <p><strong>Phone:</strong> {contact.phone}</p>
        {contact.amount != null && <p><strong>Amount:</strong> ₹{contact.amount.toLocaleString()}</p>}
        <p><strong>Status:</strong> {contact.callStatus}</p>
        {contact.paymentDisposition && <p><strong>Disposition:</strong> {contact.paymentDisposition}</p>}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Call & Update History</h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No history yet.</p>
        ) : (
          items.map((item) =>
            item.type === 'call' ? (
              <div key={item._id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex gap-2 flex-wrap items-center mb-2">
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-xs font-semibold">
                    Attempt {item.attemptNumber}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {new Date(item.createdAt || (item as any).calledAt).toLocaleString()}
                  </span>
                  <span className="px-2 py-1 rounded bg-muted text-xs">{item.outcome}</span>
                  {item.disposition && (
                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 text-xs">{item.disposition}</span>
                  )}
                  {item.duration != null && (
                    <span className="text-xs text-muted-foreground">{item.duration}s</span>
                  )}
                </div>
                {item.transcript && (
                  <div className="text-sm mt-2">
                    <p className="text-muted-foreground">
                      {expandedTranscript.has(item._id) ? item.transcript : truncate(item.transcript, 200)}
                    </p>
                    {item.transcript.length > 200 && (
                      <button
                        onClick={() => toggleTranscript(item._id)}
                        className="text-primary text-xs mt-1"
                      >
                        {expandedTranscript.has(item._id) ? 'Collapse' : 'Expand'}
                      </button>
                    )}
                  </div>
                )}
                {item.recordingUrl && (
                  <div className="mt-2">
                    <audio src={item.recordingUrl} controls className="w-full max-w-md" />
                  </div>
                )}
              </div>
            ) : item.type === 'reassign' ? (
              <div key={item._id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex gap-2 flex-wrap items-center mb-1">
                  <span className="px-2 py-1 rounded bg-teal-500/10 text-teal-600 text-xs font-semibold">
                    Reassigned
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {new Date((item as any).timestamp || (item as any).createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs">by {(item as any).updatedBy}</span>
                </div>
                <p className="text-sm">
                  Reassigned to campaign: {(item as any).targetCampaignName ?? (item as any).targetCampaignId ?? '—'}
                </p>
              </div>
            ) : (
              <div key={item._id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex gap-2 flex-wrap items-center mb-1">
                  <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-500 text-xs font-semibold">
                    Manual Update
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {new Date((item as any).timestamp || (item as any).createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs">by {(item as any).updatedBy}</span>
                </div>
                <p className="text-sm">
                  {(item as any).oldDisposition ?? '—'} → {(item as any).newDisposition}
                </p>
                {(item as any).note && (
                  <p className="text-sm text-muted-foreground mt-1">{(item as any).note}</p>
                )}
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}
