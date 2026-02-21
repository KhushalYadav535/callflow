'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Phone, Copy, Check, Upload, Shield, Ban } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type SettingsResponse = {
  settings: {
    name: string
    email: string
    n8nWebhookUrl?: string
    backendBaseUrl?: string
  }
}

const getUserRole = () =>
  typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'TENANT_ADMIN' : 'TENANT_ADMIN'

export default function SettingsPage() {
  const params = useParams<{ tenantId: string }>()
  const router = useRouter()
  const tenantId = params?.tenantId as string | undefined
  const userRole = getUserRole()

  useEffect(() => {
    if (userRole === 'RECOVERY_AGENT' && tenantId) {
      router.replace(`/app/${tenantId}/dashboard`)
    }
  }, [userRole, tenantId, router])

  if (userRole === 'RECOVERY_AGENT') {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">You don&apos;t have access to Settings. Redirecting...</p>
      </div>
    )
  }
  const [companyName, setCompanyName] = useState('')
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('')
  const [backendBaseUrl, setBackendBaseUrl] = useState('')
  const [vapiApiKey, setVapiApiKey] = useState('')
  const [vapiPhoneNumberId, setVapiPhoneNumberId] = useState('')
  const [callingWindowStart, setCallingWindowStart] = useState('09:00')
  const [callingWindowEnd, setCallingWindowEnd] = useState('19:00')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [optOutKeywords, setOptOutKeywords] = useState<string[]>([])
  const [optOutInput, setOptOutInput] = useState('')
  const [dndCount, setDndCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'integration' | 'compliance' | 'dnd'>('integration')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const webhookUrl = API_URL && tenantId
    ? `${API_URL.replace(/\/$/, '')}/api/webhooks/tenant/${tenantId}/phone`
    : ''

  const loadSettings = async () => {
    if (!API_URL) return
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      setError('')
      const [settingsRes, dndRes] = await Promise.all([
        fetch(`${API_URL}/api/settings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/settings/dnd-count`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const settingsData = (await settingsRes.json().catch(() => ({}))) as SettingsResponse
      const dndData = await dndRes.json().catch(() => ({}))
      if (settingsRes.ok) {
        const s = settingsData.settings as any
        setCompanyName(s?.name ?? '')
        setN8nWebhookUrl(s?.n8nWebhookUrl ?? '')
        setBackendBaseUrl(s?.backendBaseUrl ?? '')
        setVapiApiKey(s?.vapiApiKey ? '••••••••' : '')
        setVapiPhoneNumberId(s?.vapiPhoneNumberId ?? '')
      }
      if (dndRes.ok) setDndCount(dndData.total ?? 0)
    } catch {
      setError('Failed to load settings')
    }
  }

  const loadCompliance = async () => {
    if (!API_URL) return
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/api/settings/compliance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data) {
        setCallingWindowStart(data.callingWindowStart ?? '09:00')
        setCallingWindowEnd(data.callingWindowEnd ?? '19:00')
        setTimezone(data.timezone ?? 'Asia/Kolkata')
        setOptOutKeywords(Array.isArray(data.optOutKeywords) ? data.optOutKeywords : ['stop calling', "don't call", 'remove me', 'unsubscribe', 'band karo', 'mat karo'])
      } else {
        setCallingWindowStart('09:00')
        setCallingWindowEnd('19:00')
        setTimezone('Asia/Kolkata')
        setOptOutKeywords(['stop calling', "don't call", 'remove me', 'unsubscribe', 'band karo', 'mat karo'])
      }
    } catch {
      setCallingWindowStart('09:00')
      setCallingWindowEnd('19:00')
      setTimezone('Asia/Kolkata')
      setOptOutKeywords(['stop calling', "don't call", 'remove me', 'unsubscribe', 'band karo', 'mat karo'])
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!API_URL) {
        setLoading(false)
        return
      }
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        await Promise.all([loadSettings(), loadCompliance()])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCopy = async () => {
    if (!webhookUrl) return
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copy failed')
    }
  }

  const saveN8nWebhook = async () => {
    if (!API_URL || !n8nWebhookUrl.trim()) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const res = await fetch(`${API_URL}/api/settings/n8n-webhook`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ n8nWebhookUrl: n8nWebhookUrl.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to save')
      setSuccess('n8n webhook URL saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveVapi = async () => {
    if (!API_URL) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const body: Record<string, string> = {}
      if (vapiApiKey && vapiApiKey !== '••••••••') body.vapiApiKey = vapiApiKey
      if (vapiPhoneNumberId) body.vapiPhoneNumberId = vapiPhoneNumberId
      if (Object.keys(body).length === 0) {
        setError('Enter VAPI API Key or Phone Number ID to update')
        setSaving(false)
        return
      }
      const res = await fetch(`${API_URL}/api/settings/vapi`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to save')
      setSuccess('VAPI settings saved')
      if (body.vapiApiKey) setVapiApiKey('••••••••')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveBackendUrl = async () => {
    if (!API_URL || !backendBaseUrl.trim()) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const res = await fetch(`${API_URL}/api/settings/backend-url`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ backendBaseUrl: backendBaseUrl.trim().replace(/\/$/, '') }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to save')
      setSuccess('Backend URL saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveCompliance = async () => {
    if (!API_URL) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const res = await fetch(`${API_URL}/api/settings/compliance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ callingWindowStart, callingWindowEnd, timezone }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to save')
      setSuccess('Compliance settings saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveOptOutKeywords = async () => {
    if (!API_URL || optOutKeywords.length === 0) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const res = await fetch(`${API_URL}/api/settings/opt-out-keywords`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ keywords: optOutKeywords }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to save')
      setSuccess('Opt-out keywords saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addOptOutKeyword = () => {
    const kw = optOutInput.trim()
    if (kw && !optOutKeywords.includes(kw)) {
      setOptOutKeywords([...optOutKeywords, kw])
      setOptOutInput('')
    }
  }

  const removeOptOutKeyword = (kw: string) => {
    setOptOutKeywords(optOutKeywords.filter((k) => k !== kw))
  }

  const handleDndUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !API_URL) return
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/api/settings/dnd-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to upload')
      setDndCount(data.total ?? 0)
      setSuccess(`Added ${data.added ?? 0} numbers. Total: ${data.total ?? 0}`)
      await loadSettings()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const clearDnd = async () => {
    if (!API_URL || !window.confirm('Clear all DND numbers? This cannot be undone.')) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const res = await fetch(`${API_URL}/api/settings/dnd`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to clear')
      setDndCount(0)
      setSuccess('DND list cleared')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clear')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'integration' as const, label: 'Integration', icon: Phone },
    { id: 'compliance' as const, label: 'Compliance', icon: Shield },
    { id: 'dnd' as const, label: 'DND List', icon: Ban },
  ]

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure integration, compliance guardrails, and DND list.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      {activeTab === 'integration' && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                <p className="text-sm text-muted-foreground">{companyName || '—'}</p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    Inbound Webhook URL (copy for n8n)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!webhookUrl}
                    className="p-2 rounded-lg border border-border hover:bg-muted/50"
                    title="Copy URL"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/30 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">n8n Webhook URL (outbound)</label>
                <input
                  type="url"
                  value={n8nWebhookUrl}
                  onChange={(e) => setN8nWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n.com/webhook/..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                />
                <button
                  onClick={saveN8nWebhook}
                  disabled={saving}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Backend Base URL</label>
                <input
                  type="url"
                  value={backendBaseUrl}
                  onChange={(e) => setBackendBaseUrl(e.target.value)}
                  placeholder="https://your-backend.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                />
                <button
                  onClick={saveBackendUrl}
                  disabled={saving}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">VAPI Credentials</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">VAPI API Key</label>
                    <input
                      type="password"
                      value={vapiApiKey}
                      onChange={(e) => setVapiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">VAPI Phone Number ID</label>
                    <input
                      type="text"
                      value={vapiPhoneNumberId}
                      onChange={(e) => setVapiPhoneNumberId(e.target.value)}
                      placeholder="Phone number ID"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <button
                    onClick={saveVapi}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save VAPI'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          <p className="text-sm text-muted-foreground">Changes take effect on the next campaign launch.</p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Calling Window</label>
            <div className="flex gap-4 items-center flex-wrap">
              <input
                type="text"
                value={callingWindowStart}
                onChange={(e) => setCallingWindowStart(e.target.value)}
                placeholder="09:00"
                className="w-24 px-3 py-2 rounded-lg border border-border bg-background"
              />
              <span>to</span>
              <input
                type="text"
                value={callingWindowEnd}
                onChange={(e) => setCallingWindowEnd(e.target.value)}
                placeholder="19:00"
                className="w-24 px-3 py-2 rounded-lg border border-border bg-background"
              />
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
                className="px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <button
              onClick={saveCompliance}
              disabled={saving}
              className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Opt-out Keywords</label>
            <p className="text-xs text-muted-foreground mb-2">Transcript containing these phrases will set contact to OPT_OUT</p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={optOutInput}
                onChange={(e) => setOptOutInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOptOutKeyword())}
                placeholder="Add keyword..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
              />
              <button onClick={addOptOutKeyword} className="px-4 py-2 rounded-lg border border-border hover:bg-muted">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {optOutKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                >
                  {kw}
                  <button onClick={() => removeOptOutKeyword(kw)} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
            <button
              onClick={saveOptOutKeywords}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'dnd' && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {dndCount.toLocaleString()} numbers on DND list
            </p>
            <p className="text-xs text-muted-foreground">Upload CSV or Excel with column: phone, mobile, or number</p>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleDndUpload}
              disabled={uploading}
              className="hidden"
              id="dnd-upload"
            />
            <label
              htmlFor="dnd-upload"
              className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload DND File'}
            </label>
          </div>

          <button
            onClick={clearDnd}
            disabled={saving || dndCount === 0}
            className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            Clear All DND Numbers
          </button>
        </div>
      )}
    </div>
  )
}
