'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, MoreVertical, Play, Pause, Trash2 } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'recovery' | 'reminder' | 'sales'
  contacts: number
  called: number
  pending: number
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused'
  successRate: number
  created: string
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Recovery Campaign',
    type: 'recovery',
    contacts: 5000,
    called: 3250,
    pending: 1750,
    status: 'running',
    successRate: 87,
    created: '2026-02-10',
  },
  {
    id: '2',
    name: 'Monthly Reminder Drive',
    type: 'reminder',
    contacts: 2500,
    called: 2500,
    pending: 0,
    status: 'completed',
    successRate: 92,
    created: '2026-02-01',
  },
  {
    id: '3',
    name: 'Product Launch Outreach',
    type: 'sales',
    contacts: 3000,
    called: 1350,
    pending: 1650,
    status: 'running',
    successRate: 78,
    created: '2026-02-05',
  },
  {
    id: '4',
    name: 'Customer Retention Wave',
    type: 'recovery',
    contacts: 1800,
    called: 180,
    pending: 1620,
    status: 'scheduled',
    successRate: 0,
    created: '2026-02-18',
  },
  {
    id: '5',
    name: 'Q4 Sales Sprint',
    type: 'sales',
    contacts: 4200,
    called: 4200,
    pending: 0,
    status: 'completed',
    successRate: 84,
    created: '2026-01-15',
  },
]

const typeColors: Record<string, string> = {
  recovery: 'bg-blue-500/10 text-blue-500',
  reminder: 'bg-purple-500/10 text-purple-500',
  sales: 'bg-green-500/10 text-green-500',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-500',
  scheduled: 'bg-yellow-500/10 text-yellow-500',
  running: 'bg-primary/10 text-primary',
  completed: 'bg-green-500/10 text-green-500',
  paused: 'bg-orange-500/10 text-orange-500',
}

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || campaign.type === filterType
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Manage and monitor all your calling campaigns</p>
        </div>
        <Link
          href="/app/acme-corp/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
        >
          <Plus size={18} />
          New Campaign
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
        >
          <option value="all">All Types</option>
          <option value="recovery">Recovery</option>
          <option value="reminder">Reminder</option>
          <option value="sales">Sales</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>

        <button className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors flex items-center gap-2">
          <Filter size={18} />
          More
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                  Campaign Name
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                  Type
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                  Contacts
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                  Called / Pending
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                  Success Rate
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                  Created
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign, index) => (
                  <tr key={campaign.id} className="border-b border-border hover:bg-muted/50 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      <Link href={`/app/acme-corp/campaigns/${campaign.id}`} className="hover:text-primary transition-colors">
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[campaign.type]}`}>
                        {campaign.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      {campaign.contacts.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {campaign.called.toLocaleString()} / {campaign.pending.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-foreground">
                      {campaign.successRate > 0 ? `${campaign.successRate}%` : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {new Date(campaign.created).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-2">
                        {campaign.status === 'running' && (
                          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Pause campaign">
                            <Pause size={16} className="text-foreground" />
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Resume campaign">
                            <Play size={16} className="text-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => console.log('Delete campaign:', campaign.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete campaign"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No campaigns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      {filteredCampaigns.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Showing {filteredCampaigns.length} campaigns</p>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
              Previous
            </button>
            <button className="px-3 py-2 rounded-lg border border-border bg-primary text-primary-foreground">
              1
            </button>
            <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
