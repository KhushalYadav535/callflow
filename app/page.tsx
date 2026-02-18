import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone, Zap, Users, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CallFlow AI - Enterprise AI Calling Platform',
  description: 'Professional multi-tenant AI calling platform for enterprises',
}

export default function LandingPage() {
  const features = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'AI-Powered Calling',
      description: 'Advanced AI agents that handle complex conversations with natural interactions',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Enterprise-grade performance with sub-millisecond response times',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Multi-Tenant',
      description: 'Isolated environments for multiple organizations with complete data security',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Real-Time Analytics',
      description: 'Comprehensive dashboards and reports for complete campaign visibility',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Phone size={18} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">CallFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 inline-block animate-fade-in">
            <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
              Enterprise-Grade AI Calling Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight text-balance animate-slide-in-up">
            Revolutionize Your <span className="text-primary">Communication</span> with AI
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Deploy intelligent calling agents for your enterprise. Multi-tenant, secure, and built for scale.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-scale-in">
            <Link
              href="/auth/register"
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-semibold flex items-center justify-center gap-2 hover:gap-3"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-lg border border-primary/30 text-foreground hover:bg-primary/10 transition-colors font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Everything you need to launch successful AI calling campaigns
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Calling Strategy?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join enterprise teams already using CallFlow to scale their communication
          </p>
          <Link
            href="/auth/register"
            className="inline-flex px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
          >
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2026 CallFlow AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
