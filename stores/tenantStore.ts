'use client'

import { create } from 'zustand'
import type { Tenant } from '@/lib/tenant'

interface TenantState {
  currentTenant: Tenant | null
  loading: boolean
  error: string | null
  setCurrentTenant: (tenant: Tenant) => void
  clearTenant: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenant: null,
  loading: false,
  error: null,

  setCurrentTenant: (tenant: Tenant) => set({ currentTenant: tenant, error: null }),

  clearTenant: () => set({ currentTenant: null, error: null }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),
}))
