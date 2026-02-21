import { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Check, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing - Rembo',
  description: 'Pricing plans for Rembo AI Calling Platform',
}

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for trying out Rembo',
    features: ['Up to 3 campaigns', '1,000 calls/month', 'Email support'],
    cta: 'Get Started',
    href: '/auth/register',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$99/mo',
    description: 'For growing teams',
    features: ['Unlimited campaigns', '50,000 calls/month', 'Priority support', 'Advanced analytics'],
    cta: 'Start Trial',
    href: '/auth/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Unlimited everything', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
    cta: 'Contact Sales',
    href: '/auth/register',
    popular: false,
  },
]

export default function PricingPage() {
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
            <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <Link href="/auth/login" className="text-foreground hover:text-primary">Sign In</Link>
            <Link href="/auth/register" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your calling volume and scale as you grow.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-3xl font-bold text-foreground mt-2">{plan.price}</p>
                <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check size={18} className="text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full py-2.5 rounded-lg text-center font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
