'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Bot, Plus, Copy, Settings2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type BotConfig = {
  _id: string
  name: string
  offeringId: string
  isActive: boolean
  updatedAt: string
}

export default function BotsPage() {
  const params = useParams<{ tenantId: string }>()
  const tenantId = params?.tenantId as string
  const [botconfigs, setBotconfigs] = useState<BotConfig[]>([])
  const [templates, setTemplates] = useState<{ _id: string; name: string; offeringId: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showClone, setShowClone] = useState(false)
  const [cloneLoading, setCloneLoading] = useState(false)
  const [cloneError, setCloneError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [cloneName, setCloneName] = useState('')

  const load = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token || !API_URL) return
    try {
      const [configsRes, templatesRes] = await Promise.all([
        fetch(`${API_URL}/api/botconfigs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/botconfigs/templates`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const configsData = await configsRes.json()
      const templatesData = await templatesRes.json()
      if (configsRes.ok) setBotconfigs(configsData.botconfigs || [])
      if (templatesRes.ok) setTemplates(templatesData.templates || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [tenantId])

  const handleClone = async () => {
    if (!selectedTemplate) return
    const token = localStorage.getItem('token')
    if (!token || !API_URL) return
    setCloneLoading(true)
    setCloneError('')
    try {
      const res = await fetch(`${API_URL}/api/botconfigs/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ templateId: selectedTemplate, name: cloneName || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Clone failed')
      setShowClone(false)
      setSelectedTemplate('')
      setCloneName('')
      load()
    } catch (err) {
      setCloneError(err instanceof Error ? err.message : 'Clone failed')
    } finally {
      setCloneLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bot Configurations</h1>
          <p className="text-muted-foreground">Manage AI bot configs for account-first calling</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowClone(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Copy size={18} />
            Clone from Template
          </button>
        </div>
      </div>

      {showClone && (
        <div className="rounded-lg border border-border bg-card p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-4">Clone Template</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">Select template</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.offeringId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Custom Name (optional)</label>
              <input
                type="text"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                placeholder="My Recovery Bot"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            {cloneError && <p className="text-destructive text-sm">{cloneError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleClone}
                disabled={cloneLoading || !selectedTemplate}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              >
                {cloneLoading ? 'Cloning...' : 'Clone'}
              </button>
              <button
                onClick={() => { setShowClone(false); setCloneError(''); }}
                className="px-4 py-2 rounded-lg border border-border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : botconfigs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p>No bot configs yet. Clone from a template to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {botconfigs.map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between p-4 hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-sm text-muted-foreground">{b.offeringId}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      b.isActive ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-muted'
                    }`}
                  >
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Link
                    href={`/app/${tenantId}/bots/${b._id}`}
                    className="p-2 rounded hover:bg-muted"
                  >
                    <Settings2 size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
