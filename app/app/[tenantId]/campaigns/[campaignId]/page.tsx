'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

const getUserRole = () =>
  typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'TENANT_ADMIN' : 'TENANT_ADMIN'
import Link from 'next/link'
import { ChevronLeft, RefreshCw, Pause, Play, History, UserMinus, ArrowRightLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
type BackendStatus =
  | 'PENDING'
  | 'CALLING'
  | 'CONNECTED'
  | 'NOT_ANSWERED'
  | 'FAILED'
  | 'MAX_RETRY_DONE'
  | 'PAID'
  | 'OPT_OUT'
  | 'DND_EXCLUDED'
  | 'WITHDRAWN'
  | 'REASSIGNED'

type Campaign = {
  _id: string
  name: string
  type: 'RECOVERY' | 'REMINDER' | 'SALES'
  status: CampaignStatus
  totalContacts: number
  createdAt: string
}

type Contact = {
  _id: string
  name: string
  phone: string
  amount: number
  dueDate?: string
  loanType?: string
  email?: string
  city?: string
  callStatus: BackendStatus
  paymentDisposition?: string
  promiseToPayDate?: string
  retryCount: number
  lastCalledAt?: string
  nextRetryAt?: string
}

type ContactsResponse = {
  contacts: Contact[]
  pagination: { page: number; limit: number; total: number }
  stats: Record<string, number>
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CALLING: 'Calling',
  CONNECTED: 'Connected',
  NOT_ANSWERED: 'Not Answered',
  FAILED: 'Failed',
  MAX_RETRY_DONE: 'Max Retries Done',
  PAID: 'Paid',
  OPT_OUT: 'Opt Out',
  DND_EXCLUDED: 'DND Excluded',
  WITHDRAWN: 'Withdrawn',
  REASSIGNED: 'Reassigned',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-500/10 text-gray-500',
  CALLING: 'bg-blue-500/10 text-blue-500',
  CONNECTED: 'bg-green-500/10 text-green-500',
  NOT_ANSWERED: 'bg-yellow-500/10 text-yellow-600',
  FAILED: 'bg-red-500/10 text-red-500',
  MAX_RETRY_DONE: 'bg-purple-500/10 text-purple-500',
  PAID: 'bg-green-500/10 text-green-500',
  OPT_OUT: 'bg-red-500/10 text-red-500',
  DND_EXCLUDED: 'bg-gray-500/10 text-gray-500',
  WITHDRAWN: 'bg-gray-500/10 text-gray-500',
  REASSIGNED: 'bg-gray-500/10 text-gray-500',
}

const ALL_STATUSES: BackendStatus[] = [
  'PENDING',
  'CALLING',
  'CONNECTED',
  'NOT_ANSWERED',
  'FAILED',
  'MAX_RETRY_DONE',
  'PAID',
  'OPT_OUT',
  'DND_EXCLUDED',
  'WITHDRAWN',
]

export default function CampaignDetailPage() {
  const params = useParams<{ tenantId: string; campaignId: string }>()
  const tenantId = params.tenantId
  const campaignId = params.campaignId
  const [userRole] = useState(getUserRole)
  const canManageCampaigns = userRole === 'TENANT_ADMIN' || userRole === 'CAMPAIGN_MANAGER'
  const canManageContacts = userRole === 'TENANT_ADMIN' || userRole === 'RECOVERY_AGENT'
  const canUpdateDisposition = userRole === 'TENANT_ADMIN' || userRole === 'CAMPAIGN_MANAGER' || userRole === 'RECOVERY_AGENT'

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [statusFilter, setStatusFilter] = useState<BackendStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)
  const [reassignContact, setReassignContact] = useState<Contact | null>(null)
  const [targetCampaigns, setTargetCampaigns] = useState<{ _id: string; name: string; status: string }[]>([])
  const [selectedTargetId, setSelectedTargetId] = useState('')
  const [dispositionContact, setDispositionContact] = useState<Contact | null>(null)
  const [dispositionValue, setDispositionValue] = useState('')
  const [dispositionPtpDate, setDispositionPtpDate] = useState('')
  const [dispositionNote, setDispositionNote] = useState('')
  const [dispositionError, setDispositionError] = useState('')

  const filteredContacts = useMemo(
    () =>
      statusFilter === 'ALL'
        ? contacts
        : contacts.filter((c) => c.callStatus === statusFilter),
    [contacts, statusFilter]
  )

  const fetchData = async (opts?: { silent?: boolean }) => {
    if (!API_URL || !campaignId) return
    const token = localStorage.getItem('token')
    if (!token) {
      setError('You are not logged in.')
      setLoading(false)
      return
    }
    try {
      if (!opts?.silent) setLoading(true)
      else setIsRefreshing(true)
      setError('')
        const [campaignRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/api/campaigns/${campaignId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(
          `${API_URL}/api/contacts/${campaignId}?page=${page}&limit=100${statusFilter === 'ALL' ? '' : `&status=${statusFilter}`}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ])
      const campaignData = await campaignRes.json().catch(() => ({}))
      const contactsData = (await contactsRes.json().catch(() => ({}))) as ContactsResponse
      if (!campaignRes.ok) throw new Error(campaignData.message || 'Failed to load campaign.')
      if (!contactsRes.ok) throw new Error((contactsData as any).message || 'Failed to load contacts.')
      setCampaign(campaignData.campaign)
      setStats(contactsData.stats || {})
      setContacts(contactsData.contacts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign details.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handlePause = async () => {
    if (!API_URL || actioning) return
    const token = localStorage.getItem('token')
    if (!token) return
    setActioning('pause')
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/pause`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to pause')
      await fetchData({ silent: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to pause')
    } finally {
      setActioning(null)
    }
  }

  const handleResume = async () => {
    if (!API_URL || actioning) return
    const token = localStorage.getItem('token')
    if (!token) return
    setActioning('resume')
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/launch`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to resume')
      await fetchData({ silent: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resume')
    } finally {
      setActioning(null)
    }
  }

  const openDispositionModal = (contact: Contact, disposition: string) => {
    setDispositionContact(contact)
    setDispositionValue(disposition)
    setDispositionPtpDate('')
    setDispositionNote('')
    setDispositionError('')
  }

  const closeDispositionModal = () => {
    setDispositionContact(null)
    setDispositionValue('')
    setDispositionPtpDate('')
    setDispositionNote('')
    setDispositionError('')
  }

  const handleDispositionSubmit = async () => {
    if (!dispositionContact || !API_URL || actioning) return
    setDispositionError('')
    if (dispositionValue === 'promise_to_pay') {
      const trimmed = dispositionPtpDate.trim()
      if (!trimmed) {
        setDispositionError('Promise-to-pay date is required for Promise to Pay disposition.')
        return
      }
      const d = new Date(trimmed)
      if (isNaN(d.getTime())) {
        setDispositionError('Invalid date format. Use YYYY-MM-DD.')
        return
      }
    }
    const body: Record<string, string> = { disposition: dispositionValue }
    if (dispositionValue === 'promise_to_pay' && dispositionPtpDate.trim()) {
      body.promiseToPayDate = dispositionPtpDate.trim()
    }
    if (dispositionNote.trim()) body.note = dispositionNote.trim()
    const token = localStorage.getItem('token')
    if (!token) return
    setActioning(dispositionContact._id)
    try {
      const res = await fetch(`${API_URL}/api/contacts/${dispositionContact._id}/disposition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to update')
      closeDispositionModal()
      await fetchData({ silent: true })
    } catch (e) {
      setDispositionError(e instanceof Error ? e.message : 'Failed to update disposition')
    } finally {
      setActioning(null)
    }
  }

  const openReassignModal = async (contact: Contact) => {
    setReassignContact(contact)
    setSelectedTargetId('')
    const token = localStorage.getItem('token')
    if (!API_URL || !token) return
    try {
      const res = await fetch(`${API_URL}/api/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      const all: { _id: string; name: string; status: string }[] = data.campaigns || []
      const eligible = all.filter(
        (c: { _id: string; status: string }) =>
          c._id !== campaignId &&
          (c.status === 'ACTIVE' || c.status === 'PAUSED')
      )
      setTargetCampaigns(eligible)
    } catch {
      setTargetCampaigns([])
    }
  }

  const handleReassign = async () => {
    if (!reassignContact || !selectedTargetId || !API_URL || actioning) return
    const token = localStorage.getItem('token')
    if (!token) return
    setActioning(reassignContact._id)
    try {
      const res = await fetch(`${API_URL}/api/contacts/${reassignContact._id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetCampaignId: selectedTargetId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to reassign')
      setReassignContact(null)
      await fetchData({ silent: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reassign')
    } finally {
      setActioning(null)
    }
  }

  const handleWithdraw = async (contact: Contact) => {
    if (!API_URL || actioning || !window.confirm(`Are you sure you want to remove ${contact.name} from this campaign?`)) return
    const token = localStorage.getItem('token')
    if (!token) return
    setActioning(contact._id)
    try {
      const res = await fetch(`${API_URL}/api/contacts/${contact._id}/withdraw`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to withdraw')
      await fetchData({ silent: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to withdraw')
    } finally {
      setActioning(null)
    }
  }

  const handleDispositionSelect = (c: Contact, v: string) => {
    openDispositionModal(c, v)
  }

  useEffect(() => {
    fetchData()
  }, [campaignId, page, statusFilter])

  useEffect(() => {
    if (!API_URL || !campaignId) return
    const interval = setInterval(() => fetchData({ silent: true }), 10000)
    return () => clearInterval(interval)
  }, [campaignId, statusFilter, page])

  const total =
    Object.keys(stats).reduce((sum, k) => sum + (stats[k] ?? 0), 0) || campaign?.totalContacts || 0

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/app/${tenantId}/campaigns`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft size={16} />
          Back to campaigns
        </Link>
        <div className="flex gap-2">
          {canManageCampaigns && campaign?.status === 'ACTIVE' && (
            <button
              onClick={handlePause}
              disabled={!!actioning}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-50"
            >
              <Pause size={16} />
              Pause Campaign
            </button>
          )}
          {canManageCampaigns && campaign?.status === 'PAUSED' && (
            <button
              onClick={handleResume}
              disabled={!!actioning}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20 disabled:opacity-50"
            >
              <Play size={16} />
              Resume Campaign
            </button>
          )}
          <button
            onClick={() => fetchData({ silent: true })}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{campaign?.name || 'Campaign'}</h1>
        <p className="text-muted-foreground">
          Type: {campaign?.type ?? '-'} • Status: {campaign?.status ?? '-'} • Total contacts: {campaign?.totalContacts ?? total}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['ALL', ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {s === 'ALL' ? 'All' : statusLabels[s] ?? s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {ALL_STATUSES.slice(0, 6).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter((prev) => (prev === s ? 'ALL' : s))}
            className={`p-3 rounded-lg border text-left text-xs md:text-sm transition-colors ${
              statusFilter === s ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            }`}
          >
            <p className="font-semibold">{statusLabels[s]}</p>
            <p className="text-lg font-bold">{stats[s] ?? 0}</p>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Due Date</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Disposition</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">PTP Date</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Tries</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Last Called</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-6 px-4 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 px-4 text-center text-muted-foreground">
                    No contacts for this filter.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => (
                  <tr
                    key={c._id}
                    className={`border-b border-border hover:bg-muted/40 ${
                      c.paymentDisposition === 'dispute' ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">{c.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{c.phone}</td>
                    <td className="py-3 px-4">
                      {c.amount != null ? `₹${c.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.dueDate
                        ? new Date(c.dueDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[c.callStatus] ?? 'bg-gray-500/10'}`}>
                        {statusLabels[c.callStatus] ?? c.callStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.paymentDisposition ? (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            c.paymentDisposition === 'paid'
                              ? 'bg-green-500/10 text-green-500'
                              : c.paymentDisposition === 'promise_to_pay'
                              ? 'bg-amber-500/10 text-amber-600'
                              : c.paymentDisposition === 'dispute'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-gray-500/10 text-gray-500'
                          }`}
                        >
                          {c.paymentDisposition.replace('_', ' ')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.promiseToPayDate
                        ? new Date(c.promiseToPayDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="py-3 px-4">{c.retryCount ?? 0}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.lastCalledAt ? new Date(c.lastCalledAt).toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/app/${tenantId}/campaigns/${campaignId}/contacts/${c._id}/history`}
                          className="p-1.5 rounded hover:bg-muted text-foreground"
                          title="View History"
                        >
                          <History size={14} />
                        </Link>
                        {(canUpdateDisposition || canManageContacts) &&
                          c.callStatus !== 'WITHDRAWN' &&
                          c.callStatus !== 'REASSIGNED' && (
                          <>
                            {canUpdateDisposition && (
                            <select
                              value=""
                              onChange={(e) => {
                                const v = e.target.value
                                e.target.value = ''
                                if (v) handleDispositionSelect(c, v)
                              }}
                              disabled={actioning === c._id}
                              className="text-xs px-2 py-1 rounded border border-border bg-background"
                            >
                              <option value="">Update disposition</option>
                              <option value="paid">Paid</option>
                              <option value="promise_to_pay">Promise to Pay</option>
                              <option value="not_reachable">Not Reachable</option>
                              <option value="dispute">Dispute</option>
                            </select>
                            )}
                            {canManageContacts && (
                            <>
                            <button
                              onClick={() => openReassignModal(c)}
                              disabled={actioning === c._id}
                              className="p-1.5 rounded hover:bg-primary/10 text-primary disabled:opacity-50"
                              title="Reassign to another campaign"
                            >
                              <ArrowRightLeft size={14} />
                            </button>
                            <button
                              onClick={() => handleWithdraw(c)}
                              disabled={actioning === c._id}
                              className="p-1.5 rounded hover:bg-destructive/10 text-destructive disabled:opacity-50"
                              title="Withdraw"
                            >
                              <UserMinus size={14} />
                            </button>
                            </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!dispositionContact} onOpenChange={(open) => !open && closeDispositionModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Disposition</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {dispositionContact && `Updating disposition for ${dispositionContact.name} to ${dispositionValue.replace('_', ' ')}`}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {dispositionValue === 'promise_to_pay' && (
              <div>
                <label className="block text-sm font-medium mb-1">Promise-to-Pay Date (required)</label>
                <input
                  type="date"
                  value={dispositionPtpDate}
                  onChange={(e) => setDispositionPtpDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Note (optional)</label>
              <input
                type="text"
                value={dispositionNote}
                onChange={(e) => setDispositionNote(e.target.value)}
                placeholder="e.g. Customer paid via bank transfer"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            {dispositionError && (
              <p className="text-sm text-destructive">{dispositionError}</p>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={closeDispositionModal}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleDispositionSubmit}
              disabled={actioning === dispositionContact?._id}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {actioning === dispositionContact?._id ? 'Updating...' : 'Update'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reassignContact} onOpenChange={(open) => !open && setReassignContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Contact</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Move {reassignContact?.name} to another campaign. They will be set to PENDING in the new campaign.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <label className="block text-sm font-medium">Target Campaign</label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            >
              <option value="">Select campaign...</option>
              {targetCampaigns.map((tc) => (
                <option key={tc._id} value={tc._id}>
                  {tc.name} ({tc.status})
                </option>
              ))}
            </select>
            {targetCampaigns.length === 0 && (
              <p className="text-sm text-muted-foreground">No ACTIVE or PAUSED campaigns available.</p>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setReassignContact(null)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleReassign}
              disabled={!selectedTargetId || actioning === reassignContact?._id}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {actioning === reassignContact?._id ? 'Reassigning...' : 'Reassign'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
