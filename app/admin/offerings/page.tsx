'use client'

import { useEffect, useState } from 'react'
import { Package, Check, X } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Offering = {
  _id: string
  offeringId: string
  name: string
  description?: string
  isAvailable: boolean
}

export default function AdminOfferingsPage() {
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
      if (!token || !API_URL) return
      try {
        const res = await fetch(`${API_URL}/api/admin/offerings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok && data.offerings) setOfferings(data.offerings)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleAvailability = async (offeringId: string, current: boolean) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    if (!token || !API_URL) return
    setToggling(offeringId)
    try {
      const res = await fetch(`${API_URL}/api/admin/offerings/${offeringId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !current }),
      })
      if (res.ok) {
        setOfferings((prev) =>
          prev.map((o) =>
            o.offeringId === offeringId ? { ...o, isAvailable: !current } : o
          )
        )
      }
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return <div className="text-slate-500">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Package size={24} className="text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Offerings</h1>
          <p className="text-slate-500 text-sm">Manage offering availability for tenants</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Description</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((o) => (
                <tr key={o.offeringId} className="border-b border-slate-800/50 last:border-0">
                  <td className="py-3 px-4 text-white font-mono text-sm">{o.offeringId}</td>
                  <td className="py-3 px-4 text-white">{o.name}</td>
                  <td className="py-3 px-4 text-slate-500 text-sm">{o.description || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        o.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'
                      }`}
                    >
                      {o.isAvailable ? <Check size={12} /> : <X size={12} />}
                      {o.isAvailable ? 'Available' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleAvailability(o.offeringId, o.isAvailable)}
                      disabled={toggling === o.offeringId}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        o.isAvailable
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                      } disabled:opacity-50`}
                    >
                      {toggling === o.offeringId ? '...' : o.isAvailable ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!offerings.length && (
          <div className="py-12 text-center text-slate-500">No offerings. Run npm run seed:v2 to add defaults.</div>
        )}
      </div>
    </div>
  )
}
