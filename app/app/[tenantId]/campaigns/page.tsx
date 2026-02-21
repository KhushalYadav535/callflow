'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const getUserRole = () =>
  typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'TENANT_ADMIN' : 'TENANT_ADMIN'
import { Plus, Search, Filter, MoreVertical, Play, Pause, Trash2 } from 'lucide-react'

type BackendCampaign = {
  _id: string
  name: string
  type: 'RECOVERY' | 'REMINDER' | 'SALES'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  totalContacts: number
  createdAt: string
  stats?: { called: number; pending: number; connected: number; successRate: number }
}

type UICampaign = {
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

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function CampaignsPage() {
  const params = useParams<{ tenantId: string }>()
  const [userRole] = useState(getUserRole)
  const canManageCampaigns = userRole === 'TENANT_ADMIN' || userRole === 'CAMPAIGN_MANAGER'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [campaigns, setCampaigns] = useState<UICampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number } | null>(null)
  const ITEMS_PER_PAGE = 10

  const loadCampaigns = async () => {
    if (!API_URL) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) })
      if (searchTerm) params.set('search', searchTerm)
      if (filterType !== 'all') params.set('type', filterType)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res = await fetch(`${API_URL}/api/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      const backendCampaigns: BackendCampaign[] = data.campaigns || []
      const mapped: UICampaign[] = backendCampaigns.map((c) => ({
        id: c._id,
        name: c.name,
        type: c.type === 'RECOVERY' ? 'recovery' : c.type === 'REMINDER' ? 'reminder' : 'sales',
        contacts: c.totalContacts ?? 0,
        called: c.stats?.called ?? 0,
        pending: c.stats?.pending ?? c.totalContacts ?? 0,
        status:
          c.status === 'ACTIVE' ? 'running' : c.status === 'PAUSED' ? 'paused' : c.status === 'COMPLETED' ? 'completed' : 'draft',
        successRate: c.stats?.successRate ?? 0,
        created: c.createdAt,
      }))
      setCampaigns(mapped)
      setPagination(data.pagination || null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [page, searchTerm, filterType, filterStatus])

  const handlePause = async (campaignId: string) => {
    if (!API_URL || actioning) return
    const token = localStorage.getItem('token')
    if (!token) return
    setActioning(campaignId)
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/pause`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to pause')
      await loadCampaigns()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      alert(e instanceof Error ? e.message : 'Failed to pause campaign')
    } finally {
      setActioning(null)
    }
  }

  const handleResume = async (campaignId: string) => {
    if (!API_URL || actioning) return
    const token = localStorage.getItem('token')
    if (!token) return
    setActioning(campaignId)
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/launch`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to resume')
      await loadCampaigns()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      alert(e instanceof Error ? e.message : 'Failed to resume campaign')
    } finally {
      setActioning(null)
    }
  }

  const handleDelete = async (campaignId: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign and all its contacts?')) return
    if (!API_URL || actioning) return
    const token = localStorage.getItem('token')
    if (!token) return
    setActioning(campaignId)
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to delete')
      await loadCampaigns()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      alert(e instanceof Error ? e.message : 'Failed to delete campaign')
    } finally {
      setActioning(null)
    }
  }

  const totalFromApi = pagination?.total ?? campaigns.length
  const totalPages = Math.max(1, Math.ceil(totalFromApi / ITEMS_PER_PAGE))
  const paginatedCampaigns = campaigns
  const startItem = (page - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(page * ITEMS_PER_PAGE, totalFromApi)

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Manage and monitor all your calling campaigns</p>
        </div>
        {canManageCampaigns && (
          <Link
            href={`/app/${params.tenantId}/campaigns/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
          >
            <Plus size={18} />
            New Campaign
          </Link>
        )}
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
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value)
            setPage(1)
          }}
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
          onChange={(e) => {
            setFilterStatus(e.target.value)
            setPage(1)
          }}
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Loading campaigns...
                  </td>
                </tr>
              ) : paginatedCampaigns.length > 0 ? (
                paginatedCampaigns.map((campaign, index) => (
                  <tr key={campaign.id} className="border-b border-border hover:bg-muted/50 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      <Link
                        href={`/app/${params.tenantId}/campaigns/${campaign.id}`}
                        className="hover:text-primary transition-colors"
                      >
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
                        {canManageCampaigns && campaign.status === 'running' && (
                          <button
                            onClick={() => handlePause(campaign.id)}
                            disabled={actioning === campaign.id}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                            title="Pause campaign"
                          >
                            <Pause size={16} className="text-foreground" />
                          </button>
                        )}
                        {canManageCampaigns && campaign.status === 'paused' && (
                          <button
                            onClick={() => handleResume(campaign.id)}
                            disabled={actioning === campaign.id}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                            title="Resume campaign"
                          >
                            <Play size={16} className="text-foreground" />
                          </button>
                        )}
                        {canManageCampaigns && (
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          disabled={actioning === campaign.id}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete campaign"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                        )}
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

      {/* Pagination */}
      {campaigns.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {startItem}–{endItem} of {totalFromApi} campaigns
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 rounded-lg border border-border bg-muted/50">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
