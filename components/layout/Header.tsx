'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('tenantId')
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Side - Empty for now */}
        <div />

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle with Label */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted hover:border-primary/30 transition-all duration-200 text-foreground hover:text-primary group"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
              {mounted && theme === 'dark' ? (
                <Sun size={18} className="animate-spin duration-300 text-yellow-500" />
              ) : (
                <Moon size={18} className="animate-spin duration-300 text-blue-400" />
              )}
            </div>
            <span className="text-xs font-medium hidden sm:inline">
              {mounted && theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-border" />

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {userEmail && (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-foreground">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
