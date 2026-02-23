'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Building2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Entitlement = { offeringId: string; isProvisioned: boolean }
type OfferingState = { offeringId: string; isActive: boolean }

export default function AdminTenantDetailPage() {
  const params = useParams<{ tenantId: string }>()
  const router = useRouter()
  const tenantId = params?.tenantId
  const [tenant, setTenant] = useState<{
    _id: string
    name: string
    email: string
    companyType?: string
  } | null>(null)
  const [users, setUsers] = useState<{ email: string; name?: string; role: string }[]>([])
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [states, setStates] = useState<OfferingState[]>([])
  const [offerings, setOfferings] = useState<{ offeringId: string; name: string }[]>([])
  const [accountCount, setAccountCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [provisioning, setProvisioning] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) return
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
      if (!token || !API_URL) return
      try {
        const [detailRes, dashRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/tenants/${tenantId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        const detail = await detailRes.json()
        const dash = await dashRes.json()
        if (detailRes.ok) {
          setTenant(detail.tenant)
          setUsers(detail.users || [])
          setEntitlements(detail.entitlements || [])
          setStates(detail.offeringStates || [])
          setAccountCount(detail.accountCount ?? 0)
        }
        if (dashRes.ok && dash.offerings) setOfferings(dash.offerings)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tenantId])

  const loadTenantDetail = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    if (!token || !API_URL || !tenantId) return
    const res = await fetch(`${API_URL}/api/admin/tenants/${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const detail = await res.json()
    if (res.ok) {
      setTenant(detail.tenant)
      setUsers(detail.users || [])
      setEntitlements(detail.entitlements || [])
      setStates(detail.offeringStates || [])
      setAccountCount(detail.accountCount ?? 0)
    }
  }

  const provision = async (offeringId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    if (!token || !API_URL) return
    setProvisioning(offeringId)
    try {
      const res = await fetch(`${API_URL}/api/admin/entitlements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId: tenantId, offeringId }),
      })
      if (res.ok) await loadTenantDetail()
    } finally {
      setProvisioning(null)
    }
  }

  const revoke = async (offeringId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    if (!token || !API_URL) return
    setProvisioning(offeringId)
    try {
      const res = await fetch(
        `${API_URL}/api/admin/entitlements?companyId=${tenantId}&offeringId=${offeringId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) await loadTenantDetail()
    } finally {
      setProvisioning(null)
    }
  }

  if (loading || !tenant) {
    return (
      <div className="text-slate-500">
        {loading ? 'Loading...' : 'Tenant not found'}
      </div>
    )
  }

  const provisioned = entitlements.filter((e) => e.isProvisioned).map((e) => e.offeringId)

  return (
    <div className="space-y-8">
      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm"
      >
        <ArrowLeft size={16} />
        Back to Tenants
      </Link>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Building2 size={28} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
            <p className="text-slate-400 flex items-center gap-2 mt-1">
              <Mail size={14} />
              {tenant.email}
            </p>
            <p className="text-slate-500 text-sm mt-2">Accounts: {accountCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Users</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.email} className="flex items-center gap-3 py-2">
              <User size={16} className="text-slate-500" />
              <span className="text-white">{u.email}</span>
              <span className="text-slate-500 text-sm">({u.role})</span>
            </div>
          ))}
          {!users.length && <p className="text-slate-500">No users</p>}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Provisioned Services</h2>
        <p className="text-slate-500 text-sm mb-4">Manage which offerings this tenant can use.</p>
        <div className="space-y-3">
          {offerings.map((o) => {
            const isProv = provisioned.includes(o.offeringId)
            return (
              <div
                key={o.offeringId}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50"
              >
                <span className="text-white">{o.name}</span>
                <button
                  onClick={() => (isProv ? revoke(o.offeringId) : provision(o.offeringId))}
                  disabled={provisioning === o.offeringId}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    isProv
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  } disabled:opacity-50`}
                >
                  {provisioning === o.offeringId ? '...' : isProv ? 'Revoke' : 'Provision'}
                </button>
              </div>
            )
          })}
          {!offerings.length && <p className="text-slate-500">Run seed:v2 to add offerings</p>}
        </div>
      </div>
    </div>
  )
}
