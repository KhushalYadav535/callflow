'use client'

import { useEffect, useState } from 'react'
import { FileStack, Plus, X, Copy, Ban } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Template = {
  _id: string
  name: string
  offeringId: string
  isActive: boolean
  isDeprecated?: boolean
  version?: string
  createdBy?: string
}

type Tenant = { _id: string; name: string }

type Offering = { offeringId: string; name: string }

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createOffering, setCreateOffering] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [cloneModal, setCloneModal] = useState<Template | null>(null)
  const [cloneTenantId, setCloneTenantId] = useState('')
  const [cloneName, setCloneName] = useState('')
  const [cloneLoading, setCloneLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [deprecating, setDeprecating] = useState<string | null>(null)

  const load = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    if (!token || !API_URL) return
    try {
      const [tRes, oRes, tenantsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/templates`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/offerings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/tenants`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const tData = await tRes.json()
      const oData = await oRes.json()
      const tenantsData = await tenantsRes.json()
      if (tRes.ok && tData.templates) setTemplates(tData.templates)
      if (oRes.ok && oData.offerings) setOfferings(oData.offerings)
      if (tenantsRes.ok && tenantsData.tenants) setTenants(tenantsData.tenants)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!createOffering || !createName.trim()) {
      setCreateError('Offering and name are required')
      return
    }
    const token = localStorage.getItem('adminToken')
    if (!token || !API_URL) return
    setCreateLoading(true)
    setCreateError('')
    try {
      const res = await fetch(`${API_URL}/api/admin/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offeringId: createOffering,
          name: createName.trim(),
          useDefaults: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Create failed')
      setShowCreate(false)
      setCreateName('')
      setCreateOffering('')
      load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleClone = async () => {
    if (!cloneModal || !cloneTenantId) return
    const token = localStorage.getItem('adminToken')
    if (!token || !API_URL) return
    setCloneLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/templates/${cloneModal._id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyId: cloneTenantId, name: cloneName.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Clone failed')
      setCloneModal(null)
      setCloneTenantId('')
      setCloneName('')
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Clone failed')
    } finally {
      setCloneLoading(false)
    }
  }

  const handleDeprecate = async (templateId: string, isDeprecated: boolean) => {
    const token = localStorage.getItem('adminToken')
    if (!token || !API_URL) return
    if (isDeprecated && !window.confirm('Deprecate this template? Existing clones will continue to work.')) return
    setDeprecating(templateId)
    try {
      const res = await fetch(`${API_URL}/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isDeprecated }),
      })
      if (res.ok) load()
    } finally {
      setDeprecating(null)
    }
  }

  if (loading) {
    return <div className="text-slate-500">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <FileStack size={24} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Bot Templates</h1>
            <p className="text-slate-500 text-sm">Templates tenants can clone for their bots</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400"
        >
          <Plus size={18} />
          Create Template
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Offering</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Version</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Created By</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t._id} className={`border-b border-slate-800/50 last:border-0 ${t.isDeprecated ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-4 text-white">{t.name} {t.isDeprecated && <span className="text-amber-500 text-xs">(deprecated)</span>}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-sm">{t.offeringId}</td>
                  <td className="py-3 px-4 text-slate-500 text-sm">{t.version || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        t.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'
                      }`}
                    >
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">{t.createdBy || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {!t.isDeprecated && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setCloneModal(t); setCloneTenantId(''); setCloneName(''); }}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                          title="Clone to tenant"
                        >
                          <Copy size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeprecate(t._id, !t.isDeprecated); }}
                        disabled={deprecating === t._id}
                        className={`p-1.5 rounded hover:bg-slate-700 ${t.isDeprecated ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
                        title={t.isDeprecated ? 'Restore' : 'Deprecate'}
                      >
                        <Ban size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!templates.length && (
          <div className="py-12 text-center text-slate-500">No templates. Create one or run npm run seed:v2.</div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => !createLoading && setShowCreate(false)}>
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Create Template</h2>
              <button onClick={() => !createLoading && setShowCreate(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-4">Uses default config for the selected offering.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Offering</label>
                <select
                  value={createOffering}
                  onChange={(e) => setCreateOffering(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="">Select offering</option>
                  {offerings.map((o) => (
                    <option key={o.offeringId} value={o.offeringId}>
                      {o.name} ({o.offeringId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Template Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. TPL-REM-002: Custom Reminder"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                />
              </div>
            </div>
            {createError && <p className="text-red-400 text-sm mt-2">{createError}</p>}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 disabled:opacity-50"
              >
                {createLoading ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => !createLoading && setShowCreate(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {cloneModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => !cloneLoading && setCloneModal(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Clone &quot;{cloneModal.name}&quot; to tenant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tenant</label>
                <select
                  value={cloneTenantId}
                  onChange={(e) => setCloneTenantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="">Select tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant._id} value={tenant._id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Custom name (optional)</label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder={`${cloneModal.name} (Tenant name)`}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleClone} disabled={!cloneTenantId || cloneLoading} className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 disabled:opacity-50">
                {cloneLoading ? 'Cloning...' : 'Clone'}
              </button>
              <button onClick={() => setCloneModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
