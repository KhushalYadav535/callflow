'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type FunnelData = {
  dispatched?: number
  connected?: number
  connectRate?: number
  dispositions?: Record<string, number>
  optOutCount?: number
  avgCallDuration?: number
}

type TrendPoint = {
  date: string
  connected: number
  dispatched: number
  connectRate: number
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const params = useParams<{ tenantId: string }>()
  const tenantId = params?.tenantId as string
  const [funnel, setFunnel] = useState<FunnelData | null>(null)
  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [latency, setLatency] = useState<{ p50: number; p90: number; p99: number } | null>(null)
  const [optOutData, setOptOutData] = useState<{ data: { date: string; optOutCount: number }[]; topKeywords: { keyword: string; count: number }[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [offeringId, setOfferingId] = useState('')
  const [botComparison, setBotComparison] = useState<{ botConfigId: string; name: string; offeringId: string; dispatched: number; connected: number; connectRate: number; ptpCount: number; ptpRate: number }[]>([])
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token || !API_URL) return
      try {
        const base = `dateFrom=${dateFrom}&dateTo=${dateTo}`
        const offering = offeringId ? `&offeringId=${offeringId}` : ''
        const [funnelRes, trendsRes, latencyRes, optOutRes, botCompRes] = await Promise.all([
          fetch(`${API_URL}/api/analytics/funnel?${base}${offering}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/analytics/trends?reportType=connect_rate&granularity=daily&${base}${offering}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/analytics/trends?reportType=latency&${base}${offering}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/analytics/trends?reportType=opt_out_trend&granularity=daily&${base}${offering}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/analytics/bot-comparison?${base}`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const [funnelData, trendsData, latencyData, optOutDataRes, botCompData] = await Promise.all([
          funnelRes.json(),
          trendsRes.json(),
          latencyRes.json(),
          optOutRes.json(),
          botCompRes.json(),
        ])
        if (funnelRes.ok) setFunnel(funnelData)
        if (trendsRes.ok && trendsData.data) setTrends(trendsData.data)
        if (latencyRes.ok) setLatency({ p50: latencyData.p50 ?? 0, p90: latencyData.p90 ?? 0, p99: latencyData.p99 ?? 0 })
        if (optOutRes.ok) setOptOutData({ data: optOutDataRes.data ?? [], topKeywords: optOutDataRes.topKeywords ?? [] })
        if (botCompRes.ok) setBotComparison(botCompData.bots ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dateFrom, dateTo, offeringId])

  const dispEntries = funnel?.dispositions
    ? Object.entries(funnel.dispositions).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    : []
  const pieData = dispEntries.map(([name, value], i) => ({ name: name.replace(/_/g, ' '), value, color: COLORS[i % COLORS.length] }))

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Funnel analysis and trend reports</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={offeringId}
            onChange={(e) => setOfferingId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background"
          >
            <option value="">All Offerings</option>
            <option value="reminder-bot">Reminder</option>
            <option value="recovery-bot">Recovery</option>
            <option value="sales-bot">Sales</option>
            <option value="maturity-bot">Maturity</option>
            <option value="kyc-bot">KYC</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background" />
          <span>to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Dispatched</p>
              <p className="text-3xl font-bold mt-1">{funnel?.dispatched ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="text-3xl font-bold mt-1">{funnel?.connected ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Connect Rate</p>
              <p className="text-3xl font-bold mt-1">{funnel?.connectRate ?? 0}%</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Opt-outs</p>
              <p className="text-3xl font-bold mt-1">{funnel?.optOutCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Avg Call (sec)</p>
              <p className="text-3xl font-bold mt-1">{funnel?.avgCallDuration ?? 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Disposition Donut</h2>
              {pieData.length === 0 ? (
                <p className="text-muted-foreground text-sm">No disposition data in date range</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [v, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Latency (p50 / p90 / p99 sec)</h2>
              {latency && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">{latency.p50}</p>
                    <p className="text-xs text-muted-foreground">p50</p>
                  </div>
                  <div className="rounded bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">{latency.p90}</p>
                    <p className="text-xs text-muted-foreground">p90</p>
                  </div>
                  <div className="rounded bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">{latency.p99}</p>
                    <p className="text-xs text-muted-foreground">p99</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {optOutData && optOutData.topKeywords.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Top Opt-out Keywords</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Keyword</th>
                      <th className="text-right py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optOutData.topKeywords.map((k) => (
                      <tr key={k.keyword} className="border-b border-border/50">
                        <td className="py-2">{k.keyword}</td>
                        <td className="text-right py-2">{k.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {botComparison.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Bot Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Bot</th>
                      <th className="text-right py-2">Dispatched</th>
                      <th className="text-right py-2">Connected</th>
                      <th className="text-right py-2">Connect Rate</th>
                      <th className="text-right py-2">PTP Count</th>
                      <th className="text-right py-2">PTP Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {botComparison.map((b) => (
                      <tr key={b.botConfigId} className="border-b border-border/50">
                        <td className="py-2 font-medium">{b.name} <span className="text-muted-foreground">({b.offeringId})</span></td>
                        <td className="text-right py-2">{b.dispatched}</td>
                        <td className="text-right py-2">{b.connected}</td>
                        <td className="text-right py-2">{b.connectRate}%</td>
                        <td className="text-right py-2">{b.ptpCount}</td>
                        <td className="text-right py-2">{b.ptpRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {trends.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Connect Rate Trend (Daily)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="connectRate" fill="#3b82f6" name="Connect %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  )
}
