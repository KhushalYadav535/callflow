import { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Zap, Users, Shield, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About - Rembo',
  description: 'About Rembo AI Calling Platform',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Phone size={18} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Rembo</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/auth/login" className="text-foreground hover:text-primary">Sign In</Link>
            <Link href="/auth/register" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About Rembo</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Rembo is an AI-powered multi-tenant calling platform for enterprises. We help companies automate outbound calling campaigns—from debt recovery and payment reminders to sales follow-ups—using intelligent voice agents.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="flex gap-4 p-6 rounded-xl border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">AI-Powered</h3>
                <p className="text-muted-foreground text-sm">
                  Our voice agents handle complex conversations naturally, with structured disposition capture and promise-to-pay tracking.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Multi-Tenant</h3>
                <p className="text-muted-foreground text-sm">
                  Complete data isolation per company. Each tenant gets their own campaigns, contacts, and compliance settings.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Compliance-First</h3>
                <p className="text-muted-foreground text-sm">
                  Built-in guardrails: calling window restrictions, DND exclusion, opt-out handling, and maximum attempt caps.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Real-Time Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Live dashboards, per-campaign stats, connect rates, and full call history with transcripts and recordings.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
