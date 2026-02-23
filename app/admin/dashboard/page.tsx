'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Database, Activity, Phone, TrendingUp } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    tenants?: number
    accounts?: number
    eventsToday?: number
    offerings?: { offeringId: string; name: string; isAvailable: boolean }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
      if (!token || !API_URL) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const d = await res.json()
        if (res.ok) setData(d)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-slate-400 mt-1">Monitor all tenants and platform health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Tenants</p>
              <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : data?.tenants ?? 0}</p>
            </div>
            <Users size={32} className="text-amber-500/50" />
          </div>
          <Link href="/admin/tenants" className="text-amber-500 text-sm mt-2 inline-block hover:underline">View all →</Link>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Accounts</p>
              <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : data?.accounts ?? 0}</p>
            </div>
            <Database size={32} className="text-amber-500/50" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Events Today</p>
              <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : data?.eventsToday ?? 0}</p>
            </div>
            <Activity size={32} className="text-amber-500/50" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Offerings</p>
              <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : data?.offerings?.length ?? 0}</p>
            </div>
            <Phone size={32} className="text-amber-500/50" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Platform Offerings</h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data?.offerings?.map((o) => (
              <span
                key={o.offeringId}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  o.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {o.name} {o.isAvailable ? '✓' : '○'}
              </span>
            ))}
            {!data?.offerings?.length && <p className="text-slate-500">No offerings</p>}
          </div>
        )}
      </div>
    </div>
  )
}
