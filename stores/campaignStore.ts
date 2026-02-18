'use client'

import { create } from 'zustand'

export interface Campaign {
  id: string
  tenantId: string
  name: string
  type: 'recovery' | 'reminder' | 'sales'
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused'
  totalContacts: number
  callsMade: number
  contactsPending: number
  successRate: number
  createdAt: string
  updatedAt: string
  description?: string
}

interface CampaignState {
  campaigns: Campaign[]
  selectedCampaign: Campaign | null
  loading: boolean
  error: string | null
  filter: {
    type?: 'recovery' | 'reminder' | 'sales'
    status?: string
    searchTerm?: string
  }
  
  setCampaigns: (campaigns: Campaign[]) => void
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  setSelectedCampaign: (campaign: Campaign | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilter: (filter: Partial<CampaignState['filter']>) => void
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  selectedCampaign: null,
  loading: false,
  error: null,
  filter: {},

  setCampaigns: (campaigns: Campaign[]) => set({ campaigns, error: null }),

  addCampaign: (campaign: Campaign) =>
    set((state) => ({ campaigns: [campaign, ...state.campaigns] })),

  updateCampaign: (id: string, updates: Partial<Campaign>) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      selectedCampaign:
        state.selectedCampaign?.id === id
          ? { ...state.selectedCampaign, ...updates }
          : state.selectedCampaign,
    })),

  deleteCampaign: (id: string) =>
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id),
      selectedCampaign: state.selectedCampaign?.id === id ? null : state.selectedCampaign,
    })),

  setSelectedCampaign: (campaign: Campaign | null) => set({ selectedCampaign: campaign }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  setFilter: (filter: Partial<CampaignState['filter']>) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),
}))
