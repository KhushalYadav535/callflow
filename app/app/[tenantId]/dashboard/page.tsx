'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/StatCard'
import { Phone, TrendingUp, Clock, CheckCircle, Database } from 'lucide-react'

interface CampaignStats {
  totalCampaigns: number
  callsMade: number
  callsConnected: number
  promiseToPayCount: number
  paidCount: number
  connectRate: number
  pending: number
  accountCount?: number
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
          callsConnected: 0,
          promiseToPayCount: 0,
          paidCount: 0,
          connectRate: 0,
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
        const [campaignsRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/api/campaigns?page=1&limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        const campaignsData = await campaignsRes.json().catch(() => ({}))
        const statsData = await statsRes.json().catch(() => ({}))
        const campaigns: BackendCampaign[] = campaignsData.campaigns || []

        setStats({
          totalCampaigns: campaigns.length,
          callsMade: statsData.totalCallsMade ?? 0,
          callsConnected: statsData.callsConnected ?? 0,
          promiseToPayCount: statsData.promiseToPayCount ?? 0,
          paidCount: statsData.paidCount ?? 0,
          connectRate: statsData.connectRate ?? 0,
          pending: campaigns.reduce((sum, c) => sum + (c.totalContacts ?? 0), 0),
          accountCount: statsData.accountCount ?? 0,
        })

        setRecentCampaigns(campaigns)
      } finally {
        setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your campaign overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <StatCard
          title="Accounts"
          value={stats?.accountCount ?? 0}
          icon={<Database size={24} />}
          loading={loading}
        />
        <StatCard
          title="Total Calls Made"
          value={stats?.callsMade ?? 0}
          icon={<Phone size={24} />}
          loading={loading}
        />
        <StatCard
          title="Calls Connected"
          value={stats?.callsConnected ?? 0}
          icon={<CheckCircle size={24} />}
          loading={loading}
        />
        <StatCard
          title="Promise to Pay"
          value={stats?.promiseToPayCount ?? 0}
          icon={<Clock size={24} />}
          loading={loading}
        />
        <StatCard
          title="Paid"
          value={stats?.paidCount ?? 0}
          icon={<CheckCircle size={24} />}
          loading={loading}
        />
        <StatCard
          title="Connect Rate"
          value={`${stats?.connectRate ?? 0}%`}
          icon={<TrendingUp size={24} />}
          loading={loading}
        />
      </div>

      {/* Quick Links */}
      <div className="flex gap-4">
        <Link
          href={`/app/${params.tenantId}/accounts`}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          View Accounts
        </Link>
        <Link
          href={`/app/${params.tenantId}/analytics`}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Analytics
        </Link>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-card rounded-lg border border-border p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Campaigns</h2>
          <Link href={`/app/${params.tenantId}/campaigns`} className="text-primary hover:text-primary/80 text-sm font-medium">
            View All →
          </Link>
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
                      <Link
                        href={`/app/${params.tenantId}/campaigns/${campaign._id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {campaign.name}
                      </Link>
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
