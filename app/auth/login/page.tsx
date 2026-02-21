'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, ArrowRight, Mail, Lock } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
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

      if (!API_URL) {
        throw new Error('API URL is not configured.')
      }

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please try again.')
      }

      const token: string | undefined = data.token
      const company = data.company
      const role = data.user?.role ?? 'TENANT_ADMIN'

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token || '')
        localStorage.setItem('userEmail', company?.email ?? email)
        localStorage.setItem('userRole', role)
        const tid = company?.id ?? company?._id ?? 'default-tenant'
        localStorage.setItem('tenantId', String(tid))
        document.cookie = `rembo_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`
      }

      const tenantId = company?.id ?? company?._id ?? 'default-tenant'
      router.push(`/app/${tenantId}/dashboard`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Phone size={22} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl text-foreground">Rembo</span>
        </Link>

        <div>
          <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
            Enterprise AI Calling Platform
          </h1>
          <p className="text-lg text-muted-foreground">
            Seamlessly integrate intelligent calling agents into your business workflows.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Phone size={20} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Unlimited Campaigns</p>
              <p className="text-sm text-muted-foreground">Deploy as many campaigns as you need</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Phone size={20} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Real-Time Analytics</p>
              <p className="text-sm text-muted-foreground">Track every campaign with detailed insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in-up">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>

            {/* Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-lg border border-border/50 bg-muted/50">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Demo Credentials:</p>
            <p className="text-sm text-foreground mb-1">Email: <code className="bg-card px-2 py-1 rounded text-primary">demo@example.com</code></p>
            <p className="text-sm text-foreground">Password: <code className="bg-card px-2 py-1 rounded text-primary">password</code></p>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
