'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Phone, Copy, Check, Upload, Shield, Ban, Zap, Database, RefreshCw, Key } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'integration' | 'compliance' | 'dnd' | 'offerings' | 'dataSync'>('integration')
  const [offerings, setOfferings] = useState<{ offeringId: string; name: string; description?: string; isProvisioned: boolean; isActive: boolean }[]>([])
  const [offeringsLoading, setOfferingsLoading] = useState(false)
  const [toggleModal, setToggleModal] = useState<{ offeringId: string; name: string; isActive: boolean } | null>(null)
  const [deactivationReason, setDeactivationReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [datasourceMode, setDatasourceMode] = useState<'pull' | 'push' | 'file'>('file')
  const [pullUrl, setPullUrl] = useState('')
  const [pullAuthType, setPullAuthType] = useState<'api_key' | 'basic' | 'oauth2'>('api_key')
  const [pullApiKey, setPullApiKey] = useState('')
  const [pullHeaderName, setPullHeaderName] = useState('X-API-Key')
  const [pullUsername, setPullUsername] = useState('')
  const [pullPassword, setPullPassword] = useState('')
  const [pullScheduleCron, setPullScheduleCron] = useState('')
  const [stalenessThresholdHours, setStalenessThresholdHours] = useState(26)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [fieldMappingBank, setFieldMappingBank] = useState('')
  const [fieldMappingCanonical, setFieldMappingCanonical] = useState('')
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'failed' | 'partial' | null>(null)
  const [staleAccountCount, setStaleAccountCount] = useState(0)
  const [pushHmacSecretSet, setPushHmacSecretSet] = useState(false)
  const [pushHmacSecret, setPushHmacSecret] = useState('')
  const [datasourceLoading, setDatasourceLoading] = useState(false)
  const [syncTriggering, setSyncTriggering] = useState(false)

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

  useEffect(() => {
    if (activeTab === 'offerings') loadOfferings()
  }, [activeTab])

  const loadDatasource = async () => {
    if (!API_URL || !tenantId) return
    const token = localStorage.getItem('token')
    if (!token) return
    setDatasourceLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/settings/datasource`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data) {
        setDatasourceMode(data.mode ?? 'file')
        setPullUrl(data.pullUrl ?? '')
        setPullAuthType(data.pullAuthType ?? 'api_key')
        setPullHeaderName(data.pullAuthConfig?._masked ? 'X-API-Key' : (data.pullAuthConfig?.headerName ?? 'X-API-Key'))
        setPullApiKey(data.pullAuthConfig?._masked ? '' : (data.pullAuthConfig?.apiKey ?? ''))
        setPullUsername(data.pullAuthConfig?._masked ? '' : (data.pullAuthConfig?.username ?? ''))
        setPullPassword(data.pullAuthConfig?._masked ? '' : (data.pullAuthConfig?.password ?? ''))
        setPullScheduleCron(data.pullScheduleCron ?? '')
        setStalenessThresholdHours(data.stalenessThresholdHours ?? 26)
        setFieldMapping(typeof data.fieldMapping === 'object' ? data.fieldMapping : {})
        setLastSyncAt(data.lastSyncAt ?? null)
        setLastSyncStatus(data.lastSyncStatus ?? null)
        setStaleAccountCount(data.staleAccountCount ?? 0)
        setPushHmacSecretSet(data.pushHmacSecretSet ?? false)
        setPushHmacSecret(data.pushHmacSecret ?? '')
      }
    } finally {
      setDatasourceLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'dataSync') loadDatasource()
  }, [activeTab])

  const saveDatasource = async () => {
    if (!API_URL) return
    const token = localStorage.getItem('token')
    if (!token) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const pullAuthConfig: Record<string, string> = {}
      if (datasourceMode === 'pull' && pullAuthType === 'api_key' && pullApiKey) {
        pullAuthConfig.apiKey = pullApiKey
        pullAuthConfig.headerName = pullHeaderName || 'X-API-Key'
      } else if (datasourceMode === 'pull' && pullAuthType === 'basic') {
        pullAuthConfig.username = pullUsername
        pullAuthConfig.password = pullPassword
      } else if (datasourceMode === 'pull' && pullAuthType === 'oauth2' && pullApiKey) {
        pullAuthConfig.accessToken = pullApiKey
      }
      const body: Record<string, unknown> = {
        mode: datasourceMode,
        pullUrl: datasourceMode === 'pull' ? pullUrl : undefined,
        pullAuthType: datasourceMode === 'pull' ? pullAuthType : undefined,
        pullAuthConfig: datasourceMode === 'pull' && Object.keys(pullAuthConfig).length > 0 ? pullAuthConfig : undefined,
        pullScheduleCron: datasourceMode === 'pull' ? pullScheduleCron || undefined : undefined,
        fieldMapping: fieldMapping,
        stalenessThresholdHours: stalenessThresholdHours,
      }
      if (pushHmacSecret && datasourceMode === 'push') body.pushHmacSecret = pushHmacSecret
      const res = await fetch(`${API_URL}/api/settings/datasource`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { message?: string }).message || 'Failed to save')
      setSuccess('Data sync config saved')
      loadDatasource()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const triggerPullSync = async () => {
    if (!API_URL || !tenantId) return
    const token = localStorage.getItem('token')
    if (!token) return
    setSyncTriggering(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_URL}/api/data/sync/pull/${tenantId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { message?: string }).message || 'Sync failed')
      setSuccess(`Sync complete: ${data.created ?? 0} created, ${data.updated ?? 0} updated`)
      loadDatasource()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed')
      loadDatasource()
    } finally {
      setSyncTriggering(false)
    }
  }

  const regenerateHmac = async () => {
    if (!API_URL || !window.confirm('Regenerate HMAC secret? Existing push integrations must be updated.')) return
    const token = localStorage.getItem('token')
    if (!token) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_URL}/api/settings/datasource/regenerate-hmac`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { message?: string }).message || 'Failed')
      setPushHmacSecret(data.pushHmacSecret ?? '')
      setPushHmacSecretSet(true)
      setSuccess('New HMAC secret generated. Save it — it won\'t be shown again.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const addFieldMapping = () => {
    const bank = fieldMappingBank.trim()
    const canonical = fieldMappingCanonical.trim()
    if (bank && canonical) {
      setFieldMapping((m) => ({ ...m, [canonical]: bank }))
      setFieldMappingBank('')
      setFieldMappingCanonical('')
    }
  }

  const removeFieldMapping = (canonical: string) => {
    setFieldMapping((m) => {
      const next = { ...m }
      delete next[canonical]
      return next
    })
  }

  const pushEndpointUrl = API_URL && tenantId
    ? `${API_URL.replace(/\/$/, '')}/api/data/tenant/${tenantId}/accounts`
    : ''

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

  const loadOfferings = async () => {
    if (!API_URL) return
    const token = localStorage.getItem('token')
    if (!token) return
    setOfferingsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/settings/offerings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.offerings) setOfferings(data.offerings)
    } finally {
      setOfferingsLoading(false)
    }
  }

  const openToggleModal = (offeringId: string, name: string, isActive: boolean) => {
    if (!isActive) {
      setToggleModal({ offeringId, name, isActive })
      setDeactivationReason('')
    } else {
      doToggleOffering(offeringId, true)
    }
  }

  const doToggleOffering = async (offeringId: string, isActive: boolean, reason?: string) => {
    if (!API_URL) return
    const token = localStorage.getItem('token')
    if (!token) return
    setToggleModal(null)
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const body: { isActive: boolean; deactivationReason?: string } = { isActive }
      if (!isActive && reason) body.deactivationReason = reason
      const res = await fetch(`${API_URL}/api/settings/offerings/${offeringId}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { message?: string }).message || 'Failed')
      setSuccess('Offering state updated')
      loadOfferings()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleOffering = async (offeringId: string, isActive: boolean) => {
    if (isActive) {
      doToggleOffering(offeringId, true)
    } else {
      const o = offerings.find((x) => x.offeringId === offeringId)
      openToggleModal(offeringId, o?.name ?? offeringId, isActive)
    }
  }

  const handleAccountUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !API_URL || !tenantId) return
    setUploading(true)
    setError('')
    setSuccess('')
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
      if (!res.ok) throw new Error((data as { message?: string }).message || 'Upload failed')
      setSuccess(`Imported ${data.total ?? 0} accounts (${data.created ?? 0} new, ${data.updated ?? 0} updated)`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const tabs = [
    { id: 'integration' as const, label: 'Integration', icon: Phone },
    { id: 'compliance' as const, label: 'Compliance', icon: Shield },
    { id: 'offerings' as const, label: 'Offerings', icon: Zap },
    { id: 'dataSync' as const, label: 'Data Sync', icon: Database },
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

      {activeTab === 'offerings' && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Control which provisioned offerings are currently active. Contact platform admin to enable new offerings.
          </p>
          {offeringsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              {offerings.filter((o) => o.isProvisioned).map((o) => (
                <div key={o.offeringId} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{o.name}</p>
                    {o.description && <p className="text-sm text-muted-foreground">{o.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{o.isActive ? 'Active' : 'Inactive'}</span>
                    <button
                      onClick={() => toggleOffering(o.offeringId, !o.isActive)}
                      disabled={saving}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        o.isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      {o.isActive ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              ))}
              {offerings.filter((o) => !o.isProvisioned).length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Not provisioned</p>
                  {offerings.filter((o) => !o.isProvisioned).map((o) => (
                    <div key={o.offeringId} className="flex items-center justify-between py-2 opacity-60">
                      <span>{o.name}</span>
                      <span className="text-xs text-muted-foreground">Contact platform team to enable</span>
                    </div>
                  ))}
                </div>
              )}
              {!offerings.length && <p className="text-muted-foreground">No offerings</p>}
            </div>
          )}

          {toggleModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setToggleModal(null)}>
              <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-semibold mb-2">Disable {toggleModal.name}?</h3>
                <p className="text-sm text-muted-foreground mb-3">Please provide a reason for deactivation (optional but recommended).</p>
                <textarea
                  placeholder="e.g. Festival season pause, Maintenance, ..."
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border mb-4"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleModal && doToggleOffering(toggleModal.offeringId, false, deactivationReason)}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                  >
                    Confirm Disable
                  </button>
                  <button onClick={() => setToggleModal(null)} className="px-4 py-2 rounded-lg border">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dataSync' && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          {datasourceLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
          <>
          <p className="text-sm text-muted-foreground">
            Configure how account data flows from your CBS into CallFlow. Choose Pull (API), Push (webhook), or File upload.
          </p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Sync Mode</label>
            <div className="flex gap-4">
              {(['pull', 'push', 'file'] as const).map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dsMode"
                    checked={datasourceMode === m}
                    onChange={() => setDatasourceMode(m)}
                  />
                  <span className="capitalize">{m}</span>
                </label>
              ))}
            </div>
          </div>

          {datasourceMode === 'pull' && (
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="font-medium">Pull Configuration</h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">CBS API URL</label>
                <input
                  type="url"
                  value={pullUrl}
                  onChange={(e) => setPullUrl(e.target.value)}
                  placeholder="https://cbs.example.com/api/accounts"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Auth Type</label>
                <select
                  value={pullAuthType}
                  onChange={(e) => setPullAuthType(e.target.value as 'api_key' | 'basic' | 'oauth2')}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                >
                  <option value="api_key">API Key</option>
                  <option value="basic">Basic Auth</option>
                  <option value="oauth2">OAuth2 Bearer</option>
                </select>
              </div>
              {pullAuthType === 'api_key' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Header Name</label>
                    <input
                      type="text"
                      value={pullHeaderName}
                      onChange={(e) => setPullHeaderName(e.target.value)}
                      placeholder="X-API-Key"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">API Key</label>
                    <input
                      type="password"
                      value={pullApiKey}
                      onChange={(e) => setPullApiKey(e.target.value)}
                      placeholder={pullApiKey ? '' : '••••••••'}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                    />
                  </div>
                </div>
              )}
              {pullAuthType === 'basic' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Username</label>
                    <input
                      type="text"
                      value={pullUsername}
                      onChange={(e) => setPullUsername(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                    <input
                      type="password"
                      value={pullPassword}
                      onChange={(e) => setPullPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                    />
                  </div>
                </div>
              )}
              {pullAuthType === 'oauth2' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bearer Token</label>
                  <input
                    type="password"
                    value={pullApiKey}
                    onChange={(e) => setPullApiKey(e.target.value)}
                    placeholder="Token"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Schedule (cron)</label>
                <input
                  type="text"
                  value={pullScheduleCron}
                  onChange={(e) => setPullScheduleCron(e.target.value)}
                  placeholder="0 */4 * * * (every 4 hours)"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Staleness threshold (hours)</label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={stalenessThresholdHours}
                  onChange={(e) => setStalenessThresholdHours(Number(e.target.value) || 26)}
                  className="w-32 px-4 py-2.5 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Field Mapping (bank field → canonical)</h4>
                <p className="text-xs text-muted-foreground mb-2">Canonical: externalAccountId, customerName, phone, outstandingAmount, dpd, dueDate, maturityDate, kycExpiryDate, productType</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={fieldMappingCanonical}
                    onChange={(e) => setFieldMappingCanonical(e.target.value)}
                    placeholder="Canonical field"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
                  />
                  <input
                    type="text"
                    value={fieldMappingBank}
                    onChange={(e) => setFieldMappingBank(e.target.value)}
                    placeholder="Bank API field"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
                  />
                  <button onClick={addFieldMapping} className="px-4 py-2 rounded-lg border border-border hover:bg-muted">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(fieldMapping).map(([canonical, bank]) => (
                    <span key={canonical} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm">
                      {canonical} ← {bank}
                      <button onClick={() => removeFieldMapping(canonical)} className="hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {datasourceMode === 'push' && (
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="font-medium">Push Configuration</h3>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-sm font-medium text-foreground">Inbound Push Endpoint URL</label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (pushEndpointUrl) {
                        await navigator.clipboard.writeText(pushEndpointUrl)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }
                    }}
                    className="p-2 rounded-lg border border-border hover:bg-muted/50"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={pushEndpointUrl}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/30 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">HMAC Secret</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={pushHmacSecret}
                    onChange={(e) => setPushHmacSecret(e.target.value)}
                    placeholder={pushHmacSecretSet && !pushHmacSecret ? '•••••••• (configured)' : 'Set secret for push auth'}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background"
                  />
                  <button
                    onClick={regenerateHmac}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-muted"
                  >
                    <Key size={16} />
                    Regenerate
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">POST to endpoint with X-HMAC-Signature: sha256=&lt;hex(hmac-sha256(body, secret))&gt;</p>
              </div>
            </div>
          )}

          {datasourceMode === 'file' && (
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="font-medium">File Upload</h3>
              <p className="text-sm text-muted-foreground">
                Required columns: Account ID, Customer Name, Phone. Optional: Outstanding, DPD, Due Date, Maturity Date, KYC Expiry, Product Type.
              </p>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleAccountUpload}
                  disabled={uploading}
                  className="hidden"
                  id="account-upload"
                />
                <label
                  htmlFor="account-upload"
                  className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Account File'}
                </label>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <h3 className="font-medium mb-3">Sync Status</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm text-muted-foreground">Last sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Never'}</span>
              <span className={`px-2 py-0.5 rounded text-sm ${lastSyncStatus === 'success' ? 'bg-green-500/20 text-green-700 dark:text-green-400' : lastSyncStatus === 'failed' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                {lastSyncStatus ?? '—'}
              </span>
              <span className="text-sm text-muted-foreground">Stale accounts: {staleAccountCount}</span>
              {datasourceMode === 'pull' && pullUrl && (
                <button
                  onClick={triggerPullSync}
                  disabled={syncTriggering || datasourceLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={syncTriggering ? 'animate-spin' : ''} />
                  {syncTriggering ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={saveDatasource}
            disabled={saving || datasourceLoading}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Config'}
          </button>
          {datasourceMode === 'file' && <p className="text-xs text-muted-foreground">File mode: upload saves automatically. Save Config updates sync mode and staleness threshold.</p>}
          </>
          )}
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
