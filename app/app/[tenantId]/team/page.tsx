'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const getUserRole = () =>
  typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'TENANT_ADMIN' : 'TENANT_ADMIN'
import { Users, Plus, Mail, Lock, User } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type UserRole = 'TENANT_ADMIN' | 'CAMPAIGN_MANAGER' | 'RECOVERY_AGENT'

type TeamUser = {
  _id: string
  email: string
  name?: string
  role: UserRole
  createdAt: string
}

export default function TeamPage() {
  const params = useParams<{ tenantId: string }>()
  const router = useRouter()
  const userRole = getUserRole()
  const [users, setUsers] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'RECOVERY_AGENT' as UserRole })

  const loadUsers = async () => {
    if (!API_URL) return
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      setError('')
      const res = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to load team')
      setUsers(data.users || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userRole !== 'TENANT_ADMIN' && params?.tenantId) {
      router.replace(`/app/${params.tenantId}/dashboard`)
    }
  }, [userRole, params?.tenantId, router])

  useEffect(() => {
    if (userRole === 'TENANT_ADMIN') loadUsers()
  }, [userRole])

  if (userRole !== 'TENANT_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Only Tenant Admins can access Team. Redirecting...</p>
      </div>
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!API_URL || !form.email || !form.password) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim() || undefined,
          role: form.role,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).message || 'Failed to create user')
      setSuccess('User created successfully')
      setForm({ email: '', password: '', name: '', role: 'RECOVERY_AGENT' })
      setShowForm(false)
      loadUsers()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create')
    } finally {
      setSaving(false)
    }
  }

  const roleLabels: Record<UserRole, string> = {
    TENANT_ADMIN: 'Tenant Admin',
    CAMPAIGN_MANAGER: 'Campaign Manager',
    RECOVERY_AGENT: 'Recovery Agent',
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Team</h1>
          <p className="text-muted-foreground">
            Create and manage Campaign Managers and Recovery Agents. Only Tenant Admins can access this page.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={18} />
          Add User
        </button>
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

      {showForm && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="user@company.com"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name (optional)</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Display name"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="CAMPAIGN_MANAGER">Campaign Manager</option>
                <option value="RECOVERY_AGENT">Recovery Agent</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Campaign Manager: create/launch campaigns, settings. Recovery Agent: disposition, withdraw, reassign, view history.
              </p>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-muted">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <p className="p-6 text-muted-foreground">Loading...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-muted-foreground">No team members yet. Add users to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Role</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-4 px-6 font-medium">{u.name || '—'}</td>
                    <td className="py-4 px-6 text-muted-foreground">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
