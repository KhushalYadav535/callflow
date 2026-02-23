'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Mail } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Tenant = {
  _id: string
  name: string
  email: string
  companyType?: string
  createdAt: string
  accountCount?: number
  callsToday?: number
  activeOfferings?: string[]
  lastSyncAt?: string
  lastSyncStatus?: string
  syncMode?: string
  syncFailedLastHour?: boolean
}

export default function AdminTenantsPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const loadTenants = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    if (!token || !API_URL) return
    try {
      const res = await fetch(`${API_URL}/api/admin/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const d = await res.json()
      if (res.ok) setTenants(d.tenants || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenants()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreateLoading(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    if (!token || !API_URL) return
    try {
      const res = await fetch(`${API_URL}/api/admin/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create tenant')
      setShowCreate(false)
      setForm({ name: '', email: '', password: '' })
      loadTenants()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tenants</h1>
          <p className="text-slate-400 mt-1">Manage all tenant accounts and provision services</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-400"
        >
          <Plus size={18} />
          New Tenant
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 max-w-md">
          <h2 className="text-lg font-semibold text-white mb-4">Create Tenant</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Company Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white"
              />
            </div>
            {createError && <p className="text-red-400 text-sm">{createError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-medium disabled:opacity-50"
              >
                {createLoading ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No tenants yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Tenant</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Accounts</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Calls Today</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Services</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Sync</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr
                    key={t._id}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer ${t.syncFailedLastHour ? 'bg-red-500/5' : ''}`}
                    onClick={() => router.push(`/admin/tenants/${t._id}`)}
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-white flex items-center gap-2">
                        {t.name}
                        {t.syncFailedLastHour && (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs" title="SYNC_FAILED in last hour">Sync failed</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail size={12} />
                        {t.email}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{t.accountCount ?? 0}</td>
                    <td className="py-3 px-4 text-slate-400">{t.callsToday ?? 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(t.activeOfferings || []).map((o) => (
                          <span key={o} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">
                            {o}
                          </span>
                        ))}
                        {!t.activeOfferings?.length && <span className="text-slate-600">—</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {t.syncMode || '—'} {t.lastSyncStatus && `(${t.lastSyncStatus})`}
                      {t.syncFailedLastHour && <span className="ml-1 text-red-400">⚠</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-sm">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
