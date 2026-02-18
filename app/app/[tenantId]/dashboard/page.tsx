'use client'

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/dashboard/StatCard'
import { Phone, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface CampaignStats {
  totalCampaigns: number
  callsMade: number
  successRate: number
  pending: number
}

const mockChartData = [
  { day: 'Mon', calls: 240, successful: 180 },
  { day: 'Tue', calls: 290, successful: 220 },
  { day: 'Wed', calls: 200, successful: 150 },
  { day: 'Thu', calls: 380, successful: 310 },
  { day: 'Fri', calls: 490, successful: 420 },
  { day: 'Sat', calls: 390, successful: 330 },
  { day: 'Sun', calls: 290, successful: 240 },
]

const mockPieData = [
  { name: 'Successful', value: 65 },
  { name: 'Pending', value: 20 },
  { name: 'Failed', value: 15 },
]

const COLORS = ['oklch(0.65 0.25 265)', 'oklch(0.75 0.22 200)', 'oklch(0.58 0.25 27)']

export default function DashboardPage() {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setStats({
        totalCampaigns: 12,
        callsMade: 3840,
        successRate: 87.5,
        pending: 520,
      })
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Calls Over Time */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-6">Calls This Week</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockChartData}>
              <CartesianGrid stroke="var(--color-border)" />
              <XAxis stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="successful"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-accent)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Call Outcomes */}
        <div className="bg-card rounded-lg border border-border p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-6">Call Outcomes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {mockPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {mockPieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-muted-foreground">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-card rounded-lg border border-border p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Campaigns</h2>
          <a href="#" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All →
          </a>
        </div>

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
                  Progress
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: 'Q1 Recovery Campaign',
                  type: 'Recovery',
                  status: 'Running',
                  progress: 65,
                  rate: '87%',
                },
                {
                  name: 'Monthly Reminder Drive',
                  type: 'Reminder',
                  status: 'Completed',
                  progress: 100,
                  rate: '92%',
                },
                {
                  name: 'Product Launch Outreach',
                  type: 'Sales',
                  status: 'Running',
                  progress: 45,
                  rate: '78%',
                },
              ].map((campaign, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground font-medium">
                    {campaign.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {campaign.type}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'Running'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-green-500/10 text-green-500'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{campaign.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-foreground">
                    {campaign.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
