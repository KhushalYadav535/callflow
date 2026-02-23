'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bot, Save, Plus, Trash2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type TriggerCondition = { field: string; operator: string; value: unknown }
type DispositionOption = { value: string; label: string; action: string; terminal: boolean }
type BotConfig = {
  _id: string
  name: string
  offeringId: string
  isActive: boolean
  trigger?: { conditions?: TriggerCondition[] }
  script?: { voice?: string; language?: string; promptTemplate?: string; variables?: string[] }
  retryRules?: { maxAttempts?: number; intervalHours?: number; excludeDays?: number[]; coolOffHours?: number }
  dispositions?: DispositionOption[]
  compliance?: { callingWindow?: { start?: string; end?: string }; timezone?: string; dndCheck?: boolean; maxAttemptsPerDay?: number }
  escalation?: Record<string, unknown>
  capabilities?: Record<string, boolean>
  productFilter?: string[]
  amountFilter?: { min?: number; max?: number }
}

const OPERATORS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'within_days', 'past_days', 'in']
const FIELDS = ['dpd', 'dueDate', 'maturityDate', 'kycExpiryDate', 'lastCalledAt', 'outstandingAmount', 'productType', 'status']
const DISPOSITION_ACTIONS = [
  { value: 'retry', label: 'Retry' },
  { value: 'close_cycle', label: 'Close cycle' },
  { value: 'set_account_completed', label: 'Set account completed' },
  { value: 'capture_ptp_date', label: 'Capture PTP date' },
  { value: 'schedule_callback', label: 'Schedule callback' },
  { value: 'escalate_to_agent', label: 'Escalate to agent' },
  { value: 'escalate_for_approval', label: 'Escalate for approval' },
  { value: 'escalate_legal', label: 'Escalate legal' },
  { value: 'retry_in_days', label: 'Retry in days' },
  { value: 'create_lead_in_crm', label: 'Create lead in CRM' },
  { value: 'close_with_cooling_off', label: 'Close with cooling off' },
  { value: 'send_branch_confirmation', label: 'Send branch confirmation' },
  { value: 'escalate_to_field_agent', label: 'Escalate to field agent' },
  { value: 'send_digital_link', label: 'Send digital link' },
  { value: 'flag_for_noc', label: 'Flag for NOC' },
  { value: 'create_renewal_lead', label: 'Create renewal lead' },
]

export default function BotConfigDetailPage() {
  const params = useParams<{ tenantId: string; botConfigId: string }>()
  const tenantId = params?.tenantId
  const botConfigId = params?.botConfigId
  const [bot, setBot] = useState<BotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'trigger' | 'script' | 'dispositions' | 'retry' | 'compliance' | 'escalation' | 'capabilities'>('general')
  const [matchingCount, setMatchingCount] = useState<number | null>(null)
  const [allowedCapabilities, setAllowedCapabilities] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    isActive: true,
    promptTemplate: '',
    voice: 'sonia',
    language: 'hi-IN',
    conditions: [] as TriggerCondition[],
    dispositions: [] as DispositionOption[],
    maxAttempts: 3,
    intervalHours: 24,
    coolOffHours: 0,
    callingStart: '09:00',
    callingEnd: '19:00',
    timezone: 'Asia/Kolkata',
    dndCheck: true,
    maxAttemptsPerDay: 3,
  })

  useEffect(() => {
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token || !API_URL || !botConfigId) return
      try {
        const [botRes, offerRes, previewRes] = await Promise.all([
          fetch(`${API_URL}/api/botconfigs`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/offerings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/botconfigs/${botConfigId}/preview`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const data = await botRes.json()
        const offerData = await offerRes.json()
        const previewData = await previewRes.json()
        const found = (data.botconfigs || []).find((b: { _id: string }) => b._id === botConfigId)
        if (found) {
          const o = (offerData.offerings || []).find((x: { offeringId: string }) => x.offeringId === found.offeringId)
          setAllowedCapabilities(o?.allowedCapabilities ?? found.offeringId ? ['ptpCapture', 'settlementNegotiation', 'legalNotice', 'callbackScheduling', 'leadCapture', 'coolingOff'] : [])
          setMatchingCount(previewData.matchingAccountCount ?? null)
          setBot(found)
          const conds = found.trigger?.conditions ?? []
          const disps = found.dispositions ?? []
          setForm({
            name: found.name ?? '',
            isActive: found.isActive ?? true,
            promptTemplate: found.script?.promptTemplate ?? '',
            voice: found.script?.voice ?? 'sonia',
            language: found.script?.language ?? 'hi-IN',
            conditions: conds.length ? conds : [{ field: 'dpd', operator: 'eq', value: 0 }],
            dispositions: disps.length ? disps : [],
            maxAttempts: found.retryRules?.maxAttempts ?? 3,
            intervalHours: found.retryRules?.intervalHours ?? 24,
            coolOffHours: found.retryRules?.coolOffHours ?? 0,
            callingStart: found.compliance?.callingWindow?.start ?? '09:00',
            callingEnd: found.compliance?.callingWindow?.end ?? '19:00',
            timezone: found.compliance?.timezone ?? 'Asia/Kolkata',
            dndCheck: found.compliance?.dndCheck ?? true,
            maxAttemptsPerDay: found.compliance?.maxAttemptsPerDay ?? 3,
            productFilter: Array.isArray(found.productFilter) ? found.productFilter : [],
            amountMin: found.amountFilter?.min ?? '',
            amountMax: found.amountFilter?.max ?? '',
            escalationOnDisposition: (found.escalation as { onDisposition?: string })?.onDisposition ?? '',
            escalationRouteTo: (found.escalation as { routeTo?: string })?.routeTo ?? '',
            escalationNotifyEmail: (found.escalation as { notifyEmail?: string })?.notifyEmail ?? '',
            capabilities: typeof found.capabilities === 'object' && found.capabilities ? found.capabilities : {},
          })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [botConfigId])

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    if (!token || !API_URL || !botConfigId) return
    setSaving(true)
    try {
      const body = {
        name: form.name,
        isActive: form.isActive,
        script: {
          voice: form.voice,
          language: form.language,
          promptTemplate: form.promptTemplate,
        },
        trigger: { conditions: form.conditions.filter((c) => c.field && c.operator !== undefined) },
        dispositions: form.dispositions.filter((d) => d.value && d.label),
        retryRules: {
          maxAttempts: form.maxAttempts,
          intervalHours: form.intervalHours,
          coolOffHours: form.coolOffHours,
        },
        compliance: {
          callingWindow: { start: form.callingStart, end: form.callingEnd },
          timezone: form.timezone,
          dndCheck: form.dndCheck,
          maxAttemptsPerDay: form.maxAttemptsPerDay,
        },
        productFilter: form.productFilter.length ? form.productFilter : undefined,
        amountFilter: (form.amountMin !== '' || form.amountMax !== '') ? { min: form.amountMin !== '' ? Number(form.amountMin) : undefined, max: form.amountMax !== '' ? Number(form.amountMax) : undefined } : undefined,
        escalation: (form.escalationOnDisposition || form.escalationRouteTo || form.escalationNotifyEmail) ? { onDisposition: form.escalationOnDisposition || undefined, routeTo: form.escalationRouteTo || undefined, notifyEmail: form.escalationNotifyEmail || undefined } : undefined,
        capabilities: Object.keys(form.capabilities).length ? form.capabilities : undefined,
      }
      const res = await fetch(`${API_URL}/api/botconfigs/${botConfigId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated = await res.json()
        setBot(updated)
        const prevRes = await fetch(`${API_URL}/api/botconfigs/${botConfigId}/preview`, { headers: { Authorization: `Bearer ${token}` } })
        const prevData = await prevRes.json()
        setMatchingCount(prevData.matchingAccountCount ?? null)
      }
    } finally {
      setSaving(false)
    }
  }

  const addCondition = () => {
    setForm((f) => ({ ...f, conditions: [...f.conditions, { field: 'dpd', operator: 'eq', value: 0 }] }))
  }
  const removeCondition = (i: number) => {
    setForm((f) => ({ ...f, conditions: f.conditions.filter((_, idx) => idx !== i) }))
  }
  const updateCondition = (i: number, key: keyof TriggerCondition, val: unknown) => {
    setForm((f) => ({
      ...f,
      conditions: f.conditions.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)),
    }))
  }

  const addDisposition = () => {
    setForm((f) => ({ ...f, dispositions: [...f.dispositions, { value: '', label: '', action: 'retry', terminal: false }] }))
  }
  const removeDisposition = (i: number) => {
    setForm((f) => ({ ...f, dispositions: f.dispositions.filter((_, idx) => idx !== i) }))
  }
  const updateDisposition = (i: number, key: keyof DispositionOption, val: unknown) => {
    setForm((f) => ({
      ...f,
      dispositions: f.dispositions.map((d, idx) => (idx === i ? { ...d, [key]: val } : d)),
    }))
  }

  if (loading || !bot) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">{loading ? 'Loading...' : 'Bot config not found'}</p>
      </div>
    )
  }

  const tabs = [
    { id: 'general' as const, label: 'General' },
    { id: 'trigger' as const, label: 'Trigger' },
    { id: 'script' as const, label: 'Script' },
    { id: 'dispositions' as const, label: 'Dispositions' },
    { id: 'retry' as const, label: 'Retry' },
    { id: 'compliance' as const, label: 'Compliance' },
    { id: 'escalation' as const, label: 'Escalation' },
    { id: 'capabilities' as const, label: 'Capabilities' },
  ]

  return (
    <div className="space-y-8 pb-8">
      <Link href={`/app/${tenantId}/bots`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
        <ArrowLeft size={16} /> Back to Bots
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{bot.name}</h1>
          <span className="text-muted-foreground text-sm">{bot.offeringId}</span>
        </div>

        <div className="flex gap-2 border-b border-border mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === t.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              <label htmlFor="isActive">Active (evaluate trigger rules)</label>
            </div>
          </div>
        )}

        {activeTab === 'trigger' && (
          <div className="space-y-4">
            {matchingCount !== null && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <strong>Matching accounts:</strong> {matchingCount} (preview of how many accounts match this trigger)
              </div>
            )}
            <p className="text-sm text-muted-foreground">Accounts match when ALL conditions are true.</p>
            {form.conditions.map((c, i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap">
                <select value={c.field} onChange={(e) => updateCondition(i, 'field', e.target.value)} className="px-3 py-2 rounded-lg border border-border w-40">
                  {FIELDS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <select value={c.operator} onChange={(e) => updateCondition(i, 'operator', e.target.value)} className="px-3 py-2 rounded-lg border border-border w-32">
                  {OPERATORS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={typeof c.value === 'object' ? JSON.stringify(c.value) : String(c.value ?? '')}
                  onChange={(e) => {
                    const v = e.target.value
                    const num = Number(v)
                    updateCondition(i, 'value', Number.isNaN(num) ? v : num)
                  }}
                  placeholder="Value"
                  className="px-3 py-2 rounded-lg border border-border w-24"
                />
                <button onClick={() => removeCondition(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={addCondition} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">
              <Plus size={16} /> Add condition
            </button>
            <div className="pt-4 border-t border-border space-y-3">
              <label className="block text-sm font-medium">Product filter (optional)</label>
              <p className="text-xs text-muted-foreground">Only call accounts with these product types. Comma-separated. Leave empty for all.</p>
              <input
                type="text"
                value={form.productFilter.join(', ')}
                onChange={(e) => setForm((f) => ({ ...f, productFilter: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
                placeholder="e.g. housing_loan, personal_loan"
                className="w-full px-3 py-2 rounded-lg border border-border"
              />
              <label className="block text-sm font-medium">Amount filter (optional)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min outstanding" value={form.amountMin} onChange={(e) => setForm((f) => ({ ...f, amountMin: e.target.value }))} className="px-3 py-2 rounded-lg border border-border w-36" />
                <input type="number" placeholder="Max outstanding" value={form.amountMax} onChange={(e) => setForm((f) => ({ ...f, amountMax: e.target.value }))} className="px-3 py-2 rounded-lg border border-border w-36" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Voice</label>
              <input type="text" value={form.voice} onChange={(e) => setForm({ ...form, voice: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border" placeholder="sonia" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <input type="text" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border" placeholder="hi-IN" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prompt Template</label>
              <textarea value={form.promptTemplate} onChange={(e) => setForm({ ...form, promptTemplate: e.target.value })} rows={6} className="w-full px-3 py-2 rounded-lg border border-border font-mono text-sm" placeholder="Use {{amount}}, {{dueDate}}, etc." />
            </div>
          </div>
        )}

        {activeTab === 'dispositions' && (
          <div className="space-y-4">
            {form.dispositions.map((d, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                <input type="text" value={d.value} onChange={(e) => updateDisposition(i, 'value', e.target.value)} placeholder="value" className="px-3 py-2 rounded-lg border border-border" />
                <input type="text" value={d.label} onChange={(e) => updateDisposition(i, 'label', e.target.value)} placeholder="Label" className="px-3 py-2 rounded-lg border border-border" />
                <select value={d.action} onChange={(e) => updateDisposition(i, 'action', e.target.value)} className="px-3 py-2 rounded-lg border border-border">
                  {d.action && !DISPOSITION_ACTIONS.some((a) => a.value === d.action) && (
                    <option value={d.action}>{d.action}</option>
                  )}
                  {DISPOSITION_ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={d.terminal} onChange={(e) => updateDisposition(i, 'terminal', e.target.checked)} />
                  Terminal
                </label>
                <button onClick={() => removeDisposition(i)} className="p-2 text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={addDisposition} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">
              <Plus size={16} /> Add disposition
            </button>
          </div>
        )}

        {activeTab === 'retry' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max attempts</label>
              <input type="number" min={1} value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) || 3 })} className="w-32 px-3 py-2 rounded-lg border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Interval (hours)</label>
              <input type="number" min={0} value={form.intervalHours} onChange={(e) => setForm({ ...form, intervalHours: Number(e.target.value) || 24 })} className="w-32 px-3 py-2 rounded-lg border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cool-off (hours)</label>
              <input type="number" min={0} value={form.coolOffHours} onChange={(e) => setForm({ ...form, coolOffHours: Number(e.target.value) || 0 })} className="w-32 px-3 py-2 rounded-lg border border-border" />
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Calling window start</label>
                <input type="text" value={form.callingStart} onChange={(e) => setForm({ ...form, callingStart: e.target.value })} placeholder="09:00" className="w-full px-3 py-2 rounded-lg border border-border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Calling window end</label>
                <input type="text" value={form.callingEnd} onChange={(e) => setForm({ ...form, callingEnd: e.target.value })} placeholder="19:00" className="w-full px-3 py-2 rounded-lg border border-border" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <input type="text" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max attempts per day</label>
              <input type="number" min={1} value={form.maxAttemptsPerDay} onChange={(e) => setForm({ ...form, maxAttemptsPerDay: Number(e.target.value) || 3 })} className="w-32 px-3 py-2 rounded-lg border border-border" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dndCheck" checked={form.dndCheck} onChange={(e) => setForm({ ...form, dndCheck: e.target.checked })} />
              <label htmlFor="dndCheck">Check DND list before calling</label>
            </div>
          </div>
        )}

        {activeTab === 'escalation' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">On disposition (trigger)</label>
              <input type="text" value={form.escalationOnDisposition} onChange={(e) => setForm((f) => ({ ...f, escalationOnDisposition: e.target.value }))} placeholder="e.g. dispute, hardship" className="w-full px-3 py-2 rounded-lg border border-border" />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated disposition values that trigger escalation</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Route to</label>
              <input type="text" value={form.escalationRouteTo} onChange={(e) => setForm((f) => ({ ...f, escalationRouteTo: e.target.value }))} placeholder="e.g. agent_queue, legal_team" className="w-full px-3 py-2 rounded-lg border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notify email</label>
              <input type="email" value={form.escalationNotifyEmail} onChange={(e) => setForm((f) => ({ ...f, escalationNotifyEmail: e.target.value }))} placeholder="supervisor@example.com" className="w-full px-3 py-2 rounded-lg border border-border" />
            </div>
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enable capability flags. Greyed = not provisioned for your tenant.</p>
            {['ptpCapture', 'settlementNegotiation', 'legalNotice', 'callbackScheduling', 'leadCapture', 'coolingOff'].map((cap) => {
              const allowed = allowedCapabilities.includes(cap)
              return (
                <label key={cap} className={`flex items-center gap-2 ${!allowed ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.capabilities[cap] ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, capabilities: { ...f.capabilities, [cap]: e.target.checked } }))}
                    disabled={!allowed}
                  />
                  <span>{cap}</span>
                  {!allowed && <span className="text-xs text-muted-foreground">(Not provisioned)</span>}
                </label>
              )
            })}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Save size={18} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
