'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, ArrowRight, Mail, Lock, Building2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.company || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      if (!API_URL) {
        throw new Error('API URL is not configured.')
      }

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.company,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.')
      }

      const token: string | undefined = data.token
      const company = data.company

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token || '')
        localStorage.setItem('userEmail', company?.email ?? formData.email)
        localStorage.setItem('tenantId', company?.id ?? company?._id ?? 'default-tenant')
      }

      const tenantId = company?.id ?? company?._id ?? 'default-tenant'
      router.push(`/app/${tenantId}/dashboard`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Phone size={22} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl text-foreground">CallFlow</span>
        </Link>

        <div>
          <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
            Get Started Today
          </h1>
          <p className="text-lg text-muted-foreground">
            Join hundreds of enterprises using CallFlow to revolutionize their communication strategy.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Phone size={20} />
            </div>
            <div>
              <p className="font-semibold text-foreground">30-Day Free Trial</p>
              <p className="text-sm text-muted-foreground">No credit card required</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Phone size={20} />
            </div>
            <div>
              <p className="font-semibold text-foreground">24/7 Support</p>
              <p className="text-sm text-muted-foreground">Dedicated support team available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h2>
            <p className="text-muted-foreground">Join CallFlow and start your free trial</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in-up">
            {/* Company Input */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your Company"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
