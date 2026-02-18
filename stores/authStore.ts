'use client'

import { create } from 'zustand'
import type { TenantUser } from '@/lib/tenant'

interface AuthState {
  user: TenantUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  
  setUser: (user: TenantUser) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  setUser: (user: TenantUser) => set({ user, isAuthenticated: true, error: null }),

  setToken: (token: string) => set({ token }),

  logout: () => set({ user: null, token: null, isAuthenticated: false, error: null }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),
}))
