'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, LayoutDashboard, Users, Package, FileStack, LogOut } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === '/admin/login') return
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    if (!token) {
      router.replace('/admin/login')
      return
    }
    if (!API_URL) return
    fetch(`${API_URL}/api/admin/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) {
          localStorage.removeItem('adminToken')
          router.replace('/admin/login')
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken')
        router.replace('/admin/login')
      })
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    document.cookie = 'rembo_admin_token=; path=/; max-age=0'
    router.replace('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Shield size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Platform Admin</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/admin/dashboard' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href="/admin/tenants"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith('/admin/tenants') ? 'bg-amber-500/20 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users size={18} />
            Tenants
          </Link>
          <Link
            href="/admin/offerings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/admin/offerings' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package size={18} />
            Offerings
          </Link>
          <Link
            href="/admin/templates"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/admin/templates' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileStack size={18} />
            Templates
          </Link>
        </nav>
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
