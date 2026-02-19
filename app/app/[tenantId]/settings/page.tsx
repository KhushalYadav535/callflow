'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Phone, Copy, Check } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type SettingsResponse = {
  settings: {
    name: string
    email: string
    companyType?: string
  }
}

export default function SettingsPage() {
  const params = useParams<{ tenantId: string }>()
  const tenantId = params?.tenantId as string | undefined
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const webhookUrl = API_URL && tenantId
    ? `${API_URL.replace(/\/$/, '')}/api/webhooks/tenant/${tenantId}/phone`
    : ''

  useEffect(() => {
    const load = async () => {
      if (!API_URL) {
        setLoading(false)
        return
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setError('')
        const res = await fetch(`${API_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = (await res.json().catch(() => ({}))) as SettingsResponse
        if (!res.ok) throw new Error((data as any).message || 'Failed to load settings.')
        setCompanyName(data.settings?.name ?? '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings.')
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

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Company Settings</h1>
        <p className="text-muted-foreground">
          Tenant-specific webhook URL. Copy karke n8n ke HTTP Request node me paste karein; har tenant ka alag workflow hoga.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company</label>
              <p className="text-sm text-muted-foreground">{companyName || '—'}</p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone size={18} />
                  Phone
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!webhookUrl}
                  className="p-2 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy URL"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">For voice calls</p>
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/30 text-foreground font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-2">Flow</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>URL copy karke n8n ke HTTP Request node me paste karein.</li>
          <li>Vapi call ke baad n8n result isi URL pe POST karega.</li>
          <li>Backend data receive karke DB update karega; frontend backend APIs se fetch karega.</li>
        </ol>
      </div>
    </div>
  )
}
