'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Database, Upload, Eye, Pause, Ban, RefreshCw, Bot } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Account = {
  _id: string
  externalAccountId: string
  customerName: string
  phone: string
  productType?: string
  dpd: number
  outstandingAmount?: number
  status: string
  lastCalledAt?: string
  nextCallAt?: string
  dataFreshnessAt?: string
  activeBotConfigId?: { _id: string; name: string; offeringId: string } | null
}

export default function AccountsPage() {
  const params = useParams<{ tenantId: string }>()
  const tenantId = params?.tenantId as string
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [offeringFilter, setOfferingFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [dpdMin, setDpdMin] = useState('')
  const [dpdMax, setDpdMax] = useState('')
  const [lastCalledFrom, setLastCalledFrom] = useState('')
  const [lastCalledTo, setLastCalledTo] = useState('')
  const [uploading, setUploading] = useState(false)
  const [syncTriggering, setSyncTriggering] = useState(false)
  const [datasourceMode, setDatasourceMode] = useState<'pull' | 'push' | 'file'>('file')
  const [uploadError, setUploadError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [botconfigs, setBotconfigs] = useState<{ _id: string; name: string; offeringId: string }[]>([])
  const [reassignModal, setReassignModal] = useState<Account | null>(null)
  const [reassignBotId, setReassignBotId] = useState('')

  const loadAccounts = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token || !API_URL) return
    try {
      const q = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) })
      if (statusFilter !== 'ALL') q.set('status', statusFilter)
      if (offeringFilter) q.set('offeringId', offeringFilter)
      if (productFilter) q.set('productType', productFilter)
      if (dpdMin) q.set('dpdMin', dpdMin)
      if (dpdMax) q.set('dpdMax', dpdMax)
      if (lastCalledFrom) q.set('lastCalledFrom', lastCalledFrom)
      if (lastCalledTo) q.set('lastCalledTo', lastCalledTo)
      const res = await fetch(`${API_URL}/api/accounts?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setAccounts(data.accounts || [])
        setStats(data.stats || {})
        setPagination((p) => ({ ...p, total: data.pagination?.total ?? 0 }))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [tenantId, pagination.page, statusFilter, offeringFilter, productFilter, dpdMin, dpdMax, lastCalledFrom, lastCalledTo])

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token || !API_URL) return
      try {
        const [dsRes, botRes] = await Promise.all([
          fetch(`${API_URL}/api/settings/datasource`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/botconfigs`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        const dsData = await dsRes.json()
        const botData = await botRes.json()
        if (dsRes.ok) setDatasourceMode(dsData.mode ?? 'file')
        if (botRes.ok) setBotconfigs(botData.botconfigs ?? [])
      } catch {}
    }
    load()
  }, [tenantId])

  const handlePullSync = async () => {
    const token = localStorage.getItem('token')
    if (!token || !API_URL || !tenantId) return
    setSyncTriggering(true)
    setUploadError('')
    try {
      const res = await fetch(`${API_URL}/api/data/sync/pull/${tenantId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Sync failed')
      loadAccounts()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncTriggering(false)
    }
  }

  const handleReassign = async (accountId: string, botConfigId: string) => {
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setActionLoading(accountId)
    try {
      const res = await fetch(`${API_URL}/api/accounts/${accountId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activeBotConfigId: botConfigId }),
      })
      if (res.ok) {
        setReassignModal(null)
        setReassignBotId('')
        loadAccounts()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !API_URL || !tenantId) return
    setUploading(true)
    setUploadError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/api/data/tenant/${tenantId}/accounts/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      loadAccounts()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handlePause = async (accountId: string) => {
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setActionLoading(accountId)
    try {
      const res = await fetch(`${API_URL}/api/accounts/${accountId}/pause`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) loadAccounts()
    } finally {
      setActionLoading(null)
    }
  }

  const handleExclude = async (accountId: string) => {
    if (!window.confirm('Permanently exclude this account from calling?')) return
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setActionLoading(accountId)
    try {
      const res = await fetch(`${API_URL}/api/accounts/${accountId}/exclude`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) loadAccounts()
    } finally {
      setActionLoading(null)
    }
  }

  const total = pagination.total || (stats.ACTIVE ?? 0) + (stats.PAUSED ?? 0) + (stats.COMPLETED ?? 0) + (stats.EXCLUDED ?? 0)
  const activeCount = stats.ACTIVE ?? 0
  const excludedCount = stats.EXCLUDED ?? 0
  const staleCount = stats.STALE ?? 0

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Accounts</h1>
          <p className="text-muted-foreground">Manage account profiles for account-first calling</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {datasourceMode === 'pull' && (
            <button
              onClick={handlePullSync}
              disabled={syncTriggering}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw size={18} className={syncTriggering ? 'animate-spin' : ''} />
              {syncTriggering ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id="account-upload"
          />
          <label
            htmlFor="account-upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted cursor-pointer disabled:opacity-50"
          >
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Upload'}
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Accounts</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Stale</p>
          <p className="text-2xl font-bold text-orange-600">{staleCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Excluded</p>
          <p className="text-2xl font-bold text-amber-600">{excludedCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-muted-foreground">{stats.COMPLETED ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'EXCLUDED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={offeringFilter}
            onChange={(e) => setOfferingFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
          >
            <option value="">All Offerings</option>
            <option value="reminder-bot">Reminder</option>
            <option value="recovery-bot">Recovery</option>
            <option value="sales-bot">Sales</option>
            <option value="maturity-bot">Maturity</option>
            <option value="kyc-bot">KYC</option>
          </select>
          <input
            type="text"
            placeholder="Product type"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm w-32"
          />
          <input
            type="number"
            placeholder="DPD min"
            value={dpdMin}
            onChange={(e) => setDpdMin(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm w-24"
          />
          <input
            type="number"
            placeholder="DPD max"
            value={dpdMax}
            onChange={(e) => setDpdMax(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm w-24"
          />
          <span className="text-muted-foreground text-sm">Last called:</span>
          <input
            type="date"
            placeholder="From"
            value={lastCalledFrom}
            onChange={(e) => setLastCalledFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm w-36"
          />
          <input
            type="date"
            placeholder="To"
            value={lastCalledTo}
            onChange={(e) => setLastCalledTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm w-36"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Database size={48} className="mx-auto mb-4 opacity-50" />
            <p>No accounts yet. Upload an Excel or CSV file to import account data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Account ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">DPD</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Outstanding</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Bot</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Last Called</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Next Call</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a._id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <Link
                        href={`/app/${tenantId}/accounts/${a._id}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {a.externalAccountId}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm">{a.customerName}</td>
                    <td className="py-3 px-4 text-sm font-mono">{a.phone}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{a.productType || '—'}</td>
                    <td className="py-3 px-4 text-sm">{a.dpd}</td>
                    <td className="py-3 px-4 text-sm">
                      {a.outstandingAmount != null ? a.outstandingAmount.toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm">{a.activeBotConfigId?.name || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          a.status === 'ACTIVE'
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                            : a.status === 'EXCLUDED'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                              : a.status === 'COMPLETED'
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-muted'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {a.lastCalledAt ? new Date(a.lastCalledAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {a.nextCallAt ? new Date(a.nextCallAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/app/${tenantId}/accounts/${a._id}`}
                          className="p-1.5 rounded hover:bg-muted"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        {a.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => setReassignModal(a)}
                              disabled={actionLoading === a._id}
                              className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                              title="Reassign Bot"
                            >
                              <Bot size={16} />
                            </button>
                            <button
                              onClick={() => handlePause(a._id)}
                              disabled={actionLoading === a._id}
                              className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                              title="Pause"
                            >
                              <Pause size={16} />
                            </button>
                            <button
                              onClick={() => handleExclude(a._id)}
                              disabled={actionLoading === a._id}
                              className="p-1.5 rounded hover:bg-destructive/20 text-destructive disabled:opacity-50"
                              title="Exclude"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.total > pagination.limit && (
          <div className="flex justify-between items-center p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

      {reassignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setReassignModal(null); setReassignBotId(''); }}>
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-4">Reassign Bot — {reassignModal.externalAccountId}</h3>
            <select
              className="w-full px-4 py-2 rounded-lg border border-border mb-4"
              value={reassignBotId}
              onChange={(e) => setReassignBotId(e.target.value)}
            >
              <option value="">Select bot...</option>
              {botconfigs.map((b) => (
                <option key={b._id} value={b._id}>{b.name} ({b.offeringId})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => reassignBotId && handleReassign(reassignModal._id, reassignBotId)}
                disabled={!reassignBotId || actionLoading === reassignModal._id}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              >
                Assign
              </button>
              <button onClick={() => { setReassignModal(null); setReassignBotId(''); }} className="px-4 py-2 rounded-lg border">Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
