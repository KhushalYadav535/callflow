'use client'

import { useGetTenantId, formatTenantName } from '@/lib/tenant'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  PhoneForwarded,
  Settings,
  Users,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function Sidebar() {
  const tenantId = useGetTenantId()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [companies, setCompanies] = useState<{ _id: string; name: string }[]>([])
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'TENANT_ADMIN' : 'TENANT_ADMIN'
  )
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  useEffect(() => {
    if (!API_URL || !tenantId) return
    const token = localStorage.getItem('token')
    if (!token) return
    Promise.all([
      fetch(`${API_URL}/api/auth/companies`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([companiesRes, meRes]) => {
        const companiesData = await companiesRes.json().catch(() => ({}))
        const meData = await meRes.json().catch(() => ({}))
        setCompanies(companiesData.companies || [])
        const role = meData.role ?? meData.user?.role ?? localStorage.getItem('userRole')
        if (role) {
          setUserRole(role)
          localStorage.setItem('userRole', role)
        }
      })
      .catch(() => {})
  }, [tenantId])

  const handleSwitchTenant = (id: string) => {
    if (id !== tenantId) {
      setSwitcherOpen(false)
      router.push(`/app/${id}/dashboard`)
    }
  }

  if (!tenantId) return null

  const allNavItems = [
    { label: 'Dashboard', href: `/app/${tenantId}/dashboard`, icon: LayoutDashboard, roles: ['TENANT_ADMIN', 'CAMPAIGN_MANAGER', 'RECOVERY_AGENT'] },
    { label: 'Campaigns', href: `/app/${tenantId}/campaigns`, icon: PhoneForwarded, roles: ['TENANT_ADMIN', 'CAMPAIGN_MANAGER', 'RECOVERY_AGENT'] },
    { label: 'Settings', href: `/app/${tenantId}/settings`, icon: Settings, roles: ['TENANT_ADMIN', 'CAMPAIGN_MANAGER'] },
    { label: 'Team', href: `/app/${tenantId}/team`, icon: Users, roles: ['TENANT_ADMIN'] },
  ]
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole))

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card text-foreground lg:hidden hover:bg-muted transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 ease-out ${
          sidebarOpen ? 'w-64' : '-translate-x-full'
        } lg:translate-x-0 lg:w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 border-b border-sidebar-border">
            <Link href={`/app/${tenantId}/dashboard`} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <PhoneForwarded size={20} className="text-sidebar-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-sidebar-foreground truncate">Rembo</h1>
                <p className="text-xs text-sidebar-accent-foreground opacity-70">AI Calling</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer - Tenant Switcher */}
          <div className="p-4 border-t border-sidebar-border relative">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold">
                {(companies.find((c) => c._id === tenantId)?.name || tenantId).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {companies.find((c) => c._id === tenantId)?.name || formatTenantName(tenantId)}
                </p>
                <p className="text-xs text-sidebar-accent-foreground opacity-70">Current Tenant</p>
              </div>
              <ChevronDown size={16} className={switcherOpen ? 'rotate-180' : ''} />
            </button>
            {switcherOpen && companies.length > 0 && (
              <div className="absolute bottom-full left-4 right-4 mb-2 rounded-lg border border-sidebar-border bg-sidebar overflow-hidden shadow-lg z-50">
                {companies.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleSwitchTenant(c._id)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-sidebar-accent ${
                      c._id === tenantId ? 'bg-sidebar-accent font-medium' : ''
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Content Spacer */}
      <div className="hidden lg:block lg:w-64" />
    </>
  )
}
