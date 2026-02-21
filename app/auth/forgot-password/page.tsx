'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, ArrowRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email.trim()) {
        throw new Error('Please enter your email address')
      }

      if (!API_URL) throw new Error('API URL is not configured')
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Something went wrong')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Phone size={22} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl text-foreground">Rembo</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Reset your password</h1>
          <p className="text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h2>
          <p className="text-muted-foreground mb-8">
            Enter your registered email and we'll send you a reset link.
          </p>

          {sent ? (
            <div className="p-6 rounded-lg border border-border bg-muted/30 text-center">
              <p className="text-foreground font-medium mb-2">Check your email</p>
              <p className="text-sm text-muted-foreground mb-4">
                If an account exists for {email}, we've sent a password reset link. Please check your inbox.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                Back to Sign In
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          <p className="text-center text-muted-foreground mt-8">
            <Link href="/auth/login" className="text-primary hover:text-primary/80">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
