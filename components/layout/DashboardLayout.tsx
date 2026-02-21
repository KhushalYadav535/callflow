'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token || !API_URL) return
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        const role = d.role ?? d.user?.role
        if (role && typeof window !== 'undefined') localStorage.setItem('userRole', role)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
