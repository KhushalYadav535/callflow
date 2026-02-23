'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Calendar, DollarSign, Bot, Ban, Pause, MessageSquarePlus } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Account = {
  _id: string
  externalAccountId: string
  customerName: string
  phone: string
  productType?: string
  dpd: number
  outstandingAmount?: number
  dueDate?: string
  maturityDate?: string
  kycExpiryDate?: string
  status: string
  lastCalledAt?: string
  nextCallAt?: string
  dataFreshnessAt?: string
  activeBotConfigId?: { _id: string; name: string; offeringId: string } | null
}

type Event = {
  _id: string
  eventType: string
  timestamp: string
  payload?: Record<string, unknown>
  source: string
}

export default function AccountDetailPage() {
  const params = useParams<{ tenantId: string; accountId: string }>()
  const tenantId = params?.tenantId
  const accountId = params?.accountId
  const [account, setAccount] = useState<Account | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [botconfigs, setBotconfigs] = useState<{ _id: string; name: string; offeringId: string }[]>([])
  const [dispositionModal, setDispositionModal] = useState(false)
  const [reassignModal, setReassignModal] = useState(false)
  const [dispValue, setDispValue] = useState('')
  const [ptpDate, setPtpDate] = useState('')
  const [reassignBotId, setReassignBotId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState<{ _id: string; note: string; createdBy: string; createdAt: string }[]>([])
  const [noteModal, setNoteModal] = useState(false)
  const [noteInput, setNoteInput] = useState('')

  const load = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token || !API_URL || !accountId) return
    try {
      const [accRes, evRes, botRes, notesRes] = await Promise.all([
        fetch(`${API_URL}/api/accounts/${accountId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/events/account/${accountId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/botconfigs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/accounts/${accountId}/notes`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const accData = await accRes.json()
      const evData = await evRes.json()
      const botData = await botRes.json()
      const notesData = await notesRes.json()
      if (accRes.ok) setAccount(accData)
      if (evRes.ok) setEvents(evData.events || [])
      if (botRes.ok) setBotconfigs(botData.botconfigs ?? [])
      if (notesRes.ok) setNotes(notesData.notes ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [accountId])

  const handleDisposition = async () => {
    if (!dispValue.trim() || !accountId) return
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/accounts/${accountId}/disposition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disposition: dispValue.trim(), promiseToPayDate: ptpDate || undefined }),
      })
      if (res.ok) {
        setDispositionModal(false)
        setDispValue('')
        setPtpDate('')
        load()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleExclude = async () => {
    if (!window.confirm('Permanently exclude this account from calling?')) return
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/accounts/${accountId}/exclude`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) load()
    } finally {
      setActionLoading(false)
    }
  }

  const handlePause = async () => {
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/accounts/${accountId}/pause`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) load()
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteInput.trim() || !accountId) return
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/accounts/${accountId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: noteInput.trim() }),
      })
      if (res.ok) {
        setNoteModal(false)
        setNoteInput('')
        load()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleReassign = async () => {
    if (!reassignBotId || !accountId) return
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/accounts/${accountId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activeBotConfigId: reassignBotId }),
      })
      if (res.ok) {
        setReassignModal(false)
        setReassignBotId('')
        load()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const getStalenessBadge = () => {
    if (!account?.dataFreshnessAt) return { label: 'Unknown', cls: 'bg-muted' }
    const hrs = (Date.now() - new Date(account.dataFreshnessAt).getTime()) / (1000 * 60 * 60)
    if (hrs < 24) return { label: 'Fresh', cls: 'bg-green-500/20 text-green-700 dark:text-green-400' }
    if (hrs < 48) return { label: 'Amber', cls: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' }
    return { label: 'Stale', cls: 'bg-red-500/20 text-red-700 dark:text-red-400' }
  }

  if (loading || !account) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">{loading ? 'Loading...' : 'Account not found'}</p>
      </div>
    )
  }

  const staleness = getStalenessBadge()

  return (
    <div className="space-y-8 pb-8">
      <Link
        href={`/app/${tenantId}/accounts`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
      >
        <ArrowLeft size={16} />
        Back to Accounts
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{account.externalAccountId}</h1>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  account.status === 'ACTIVE'
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : account.status === 'EXCLUDED'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      : 'bg-muted'
                }`}
              >
                {account.status}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${staleness.cls}`}>
                {staleness.label}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <span>{account.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground" />
                <span className="font-mono">{account.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-muted-foreground" />
                <span>Outstanding: {account.outstandingAmount?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">DPD:</span>
                <span>{account.dpd}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span>Due: {account.dueDate ? new Date(account.dueDate).toLocaleDateString() : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Product:</span>
                <span>{account.productType || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {account.activeBotConfigId && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Bot size={16} className="text-muted-foreground" />
              <span className="font-medium">Assigned Bot:</span>
              <Link
                href={`/app/${tenantId}/bots/${account.activeBotConfigId._id}`}
                className="text-primary hover:underline"
              >
                {account.activeBotConfigId.name}
              </Link>
              <span className="text-muted-foreground">({account.activeBotConfigId.offeringId})</span>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium mb-3">Manual Actions</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setDispositionModal(true)}
              disabled={actionLoading || account.status === 'COMPLETED'}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-sm"
            >
              Update Disposition
            </button>
            <button
              onClick={() => setReassignModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm"
            >
              Reassign Bot
            </button>
            {account.status === 'ACTIVE' && (
              <button onClick={handlePause} disabled={actionLoading} className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm flex items-center gap-1">
                <Pause size={14} /> Pause
              </button>
            )}
            <button
              onClick={handleExclude}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 text-sm flex items-center gap-1"
            >
              <Ban size={14} /> Exclude
            </button>
            <button
              onClick={() => setNoteModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm flex items-center gap-1"
            >
              <MessageSquarePlus size={14} /> Add Note
            </button>
          </div>
        </div>

        {noteModal && (
          <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
            <h4 className="font-medium mb-2">Add Note</h4>
            <textarea
              placeholder="Enter note..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border mb-2"
            />
            <div className="flex gap-2">
              <button onClick={handleAddNote} disabled={!noteInput.trim() || actionLoading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Save</button>
              <button onClick={() => { setNoteModal(false); setNoteInput(''); }} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium mb-2">Notes</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notes.map((n) => (
                <div key={n._id} className="text-sm p-2 rounded bg-muted/30">
                  <p>{n.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.createdBy} · {new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {dispositionModal && (
          <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
            <h4 className="font-medium mb-2">Set Disposition</h4>
            <input
              type="text"
              placeholder="e.g. paid, promise_to_pay, dispute, not_reachable"
              value={dispValue}
              onChange={(e) => setDispValue(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border mb-2"
            />
            <input
              type="date"
              placeholder="PTP Date (if promise_to_pay)"
              value={ptpDate}
              onChange={(e) => setPtpDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border mb-2"
            />
            <div className="flex gap-2">
              <button onClick={handleDisposition} disabled={!dispValue.trim() || actionLoading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Save</button>
              <button onClick={() => { setDispositionModal(false); setDispValue(''); setPtpDate(''); }} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            </div>
          </div>
        )}

        {reassignModal && (
          <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
            <h4 className="font-medium mb-2">Reassign to Bot</h4>
            <select
              value={reassignBotId}
              onChange={(e) => setReassignBotId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border mb-2"
            >
              <option value="">Select bot...</option>
              {botconfigs.map((b) => (
                <option key={b._id} value={b._id}>{b.name} ({b.offeringId})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={handleReassign} disabled={!reassignBotId || actionLoading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Assign</button>
              <button onClick={() => { setReassignModal(false); setReassignBotId(''); }} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Event Timeline</h2>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">No events yet</p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="flex items-start gap-4 py-2 border-b border-border/50 last:border-0"
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono shrink-0 ${
                    ev.eventType.includes('DISPATCHED') ? 'bg-blue-500/20' :
                    ev.eventType.includes('CONNECTED') ? 'bg-green-500/20' :
                    ev.eventType.includes('DISPOSITION') ? 'bg-purple-500/20' :
                    'bg-muted'
                  }`}
                >
                  {ev.eventType}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {new Date(ev.timestamp).toLocaleString()} · {ev.source}
                  </p>
                  {ev.payload && Object.keys(ev.payload).length > 0 && (
                    <pre className="mt-1 text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
