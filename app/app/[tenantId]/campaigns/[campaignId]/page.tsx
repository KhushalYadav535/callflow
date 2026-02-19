'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, RefreshCw } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
type BackendStatus =
  | 'PENDING'
  | 'CALLING'
  | 'CONNECTED'
  | 'NOT_ANSWERED'
  | 'FAILED'
  | 'MAX_RETRY_DONE'

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
  retryCount: number
  lastCalledAt?: string
  nextRetryAt?: string
}

type ContactsResponse = {
  contacts: Contact[]
  pagination: {
    page: number
    limit: number
    total: number
  }
  stats: Record<string, number>
}

const statusLabels: Record<BackendStatus, string> = {
  PENDING: 'Pending',
  CALLING: 'Calling',
  CONNECTED: 'Connected',
  NOT_ANSWERED: 'Not Answered',
  FAILED: 'Failed',
  MAX_RETRY_DONE: 'Max Retries Done',
}

const statusColors: Record<BackendStatus, string> = {
  PENDING: 'bg-gray-500/10 text-gray-500',
  CALLING: 'bg-blue-500/10 text-blue-500',
  CONNECTED: 'bg-green-500/10 text-green-500',
  NOT_ANSWERED: 'bg-yellow-500/10 text-yellow-600',
  FAILED: 'bg-red-500/10 text-red-500',
  MAX_RETRY_DONE: 'bg-purple-500/10 text-purple-500',
}

export default function CampaignDetailPage() {
  const params = useParams<{ tenantId: string; campaignId: string }>()
  const tenantId = params.tenantId
  const campaignId = params.campaignId

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [statusFilter, setStatusFilter] = useState<BackendStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredContacts = useMemo(
    () =>
      statusFilter === 'ALL'
        ? contacts
        : contacts.filter((c) => c.callStatus === statusFilter),
    [contacts, statusFilter],
  )

  const fetchData = async (opts?: { silent?: boolean }) => {
    if (!API_URL || !campaignId) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setError('You are not logged in.')
      setLoading(false)
      return
    }

    try {
      if (!opts?.silent) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError('')

      const [campaignRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/api/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_URL}/api/contacts/${campaignId}?page=${page}&limit=100${
            statusFilter === 'ALL' ? '' : `&status=${statusFilter}`
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ])

      const campaignData = await campaignRes.json().catch(() => ({}))
      const contactsData = (await contactsRes.json().catch(() => ({}))) as ContactsResponse

      if (!campaignRes.ok) {
        throw new Error(campaignData.message || 'Failed to load campaign.')
      }
      if (!contactsRes.ok) {
        throw new Error((contactsData as any).message || 'Failed to load contacts.')
      }

      setCampaign(campaignData.campaign)
      setStats(contactsData.stats || {})
      setContacts(contactsData.contacts || [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load campaign details.'
      setError(message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, page, statusFilter])

  useEffect(() => {
    if (!API_URL || !campaignId) return
    const interval = setInterval(() => {
      fetchData({ silent: true })
    }, 10000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, statusFilter, page])

  const total =
    stats.PENDING +
      stats.CALLING +
      stats.CONNECTED +
      stats.NOT_ANSWERED +
      stats.FAILED +
      stats.MAX_RETRY_DONE || campaign?.totalContacts || 0

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/app/${tenantId}/campaigns`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ChevronLeft size={16} />
            Back to campaigns
          </Link>
        </div>
        <button
          onClick={() => fetchData({ silent: true })}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {campaign?.name || 'Campaign'}
        </h1>
        <p className="text-muted-foreground">
          Type: {campaign?.type ?? '-'} • Status: {campaign?.status ?? '-'} • Total
          contacts: {campaign?.totalContacts ?? total}
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {(['PENDING', 'CALLING', 'CONNECTED', 'NOT_ANSWERED', 'FAILED', 'MAX_RETRY_DONE'] as BackendStatus[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter((prev) => (prev === s ? 'ALL' : s))}
              className={`p-3 rounded-lg border text-left text-xs md:text-sm transition-colors ${
                statusFilter === s
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <p className="font-semibold">{statusLabels[s]}</p>
              <p className="text-lg font-bold">
                {stats[s] ?? 0}
              </p>
            </button>
          ),
        )}
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
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Phone
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Last Called
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Next Retry
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Tries
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 px-4 text-center text-muted-foreground text-sm"
                  >
                    Loading contacts...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 px-4 text-center text-muted-foreground text-sm"
                  >
                    No contacts found for this filter.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-border hover:bg-muted/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{c.phone}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.amount != null ? `₹${c.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[c.callStatus]}`}
                      >
                        {statusLabels[c.callStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.lastCalledAt
                        ? new Date(c.lastCalledAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.nextRetryAt
                        ? new Date(c.nextRetryAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.retryCount ?? 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

