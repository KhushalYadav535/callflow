'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { StatCard } from '@/components/dashboard/StatCard'
import { Phone, TrendingUp, Clock, CheckCircle } from 'lucide-react'

interface CampaignStats {
  totalCampaigns: number
  callsMade: number
  successRate: number
  pending: number
}

type BackendCampaign = {
  _id: string
  name: string
  type: 'RECOVERY' | 'REMINDER' | 'SALES'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  totalContacts: number
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DashboardPage() {
  const params = useParams<{ tenantId: string }>()
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [recentCampaigns, setRecentCampaigns] = useState<BackendCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!API_URL) {
        setStats({
          totalCampaigns: 0,
          callsMade: 0,
          successRate: 0,
          pending: 0,
        })
        setLoading(false)
        return
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/api/campaigns`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          setLoading(false)
          return
        }
        const data = await res.json()
        const campaigns: BackendCampaign[] = data.campaigns || []

        const totalCampaigns = campaigns.length
        const totalContacts = campaigns.reduce(
          (sum, c) => sum + (c.totalContacts ?? 0),
          0,
        )

        setStats({
          totalCampaigns,
          callsMade: 0,
          successRate: 0,
          pending: totalContacts,
        })

        setRecentCampaigns(campaigns.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your campaign overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Campaigns"
          value={stats?.totalCampaigns ?? 0}
          icon={<Phone size={24} />}
          subtitle="Active and completed"
          loading={loading}
        />
        <StatCard
          title="Calls Made"
          value={stats?.callsMade ?? 0}
          icon={<TrendingUp size={24} />}
          trend={12}
          loading={loading}
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate ?? 0}%`}
          icon={<CheckCircle size={24} />}
          subtitle="Above target"
          loading={loading}
        />
        <StatCard
          title="Pending Calls"
          value={stats?.pending ?? 0}
          icon={<Clock size={24} />}
          subtitle="In queue"
          loading={loading}
        />
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-card rounded-lg border border-border p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Campaigns</h2>
          <a href="#" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All →
          </a>
        </div>

        {recentCampaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No campaigns yet. Create your first campaign to see it here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Campaign Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Contacts
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((campaign) => (
                  <tr
                    key={campaign._id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-foreground font-medium">
                      {campaign.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {campaign.type}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {campaign.status}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {campaign.totalContacts ?? 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
