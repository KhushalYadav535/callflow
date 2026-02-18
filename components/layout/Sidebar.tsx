'use client'

import { useGetTenantId, formatTenantName } from '@/lib/tenant'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  PhoneForwarded,
  Settings,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

export function Sidebar() {
  const tenantId = useGetTenantId()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  if (!tenantId) return null

  const navItems = [
    { label: 'Dashboard', href: `/app/${tenantId}/dashboard`, icon: LayoutDashboard },
    { label: 'Campaigns', href: `/app/${tenantId}/campaigns`, icon: PhoneForwarded },
    { label: 'Settings', href: `/app/${tenantId}/settings`, icon: Settings },
  ]

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
                <h1 className="font-bold text-sidebar-foreground truncate">CallFlow</h1>
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

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {formatTenantName(tenantId)}
                </p>
                <p className="text-xs text-sidebar-accent-foreground opacity-70">Admin</p>
              </div>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Content Spacer */}
      <div className="hidden lg:block lg:w-64" />
    </>
  )
}
