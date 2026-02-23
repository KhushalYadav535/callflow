'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, ArrowRight, Mail, Lock } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password')
      }
      if (!API_URL) throw new Error('API URL is not configured')

      const res = await fetch(`${API_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Authentication failed')

      const token = data.token
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('adminToken', token)
        localStorage.setItem('adminEmail', data.admin?.email ?? email)
        document.cookie = `rembo_admin_token=${token}; path=/; max-age=${8 * 60 * 60}; samesite=lax`
      }

      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Shield size={24} className="text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Platform Admin</h1>
              <p className="text-sm text-slate-400">Super Admin Dashboard</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white mb-2">Sign in to manage the platform</h2>
          <p className="text-slate-400 text-sm mb-6">Track tenants, provision services, and oversee all accounts.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sdsite@sentientdigital.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-500 text-sm">
            Tenant login?{' '}
            <Link href="/auth/login" className="text-amber-500 hover:text-amber-400">Go to tenant portal</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
