'use client'

import { useState } from 'react'
import { Save, Users, Globe, Key, Bell } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'api' | 'notifications'>('general')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSaving(false)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and organization settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {[
              { id: 'general' as const, label: 'General', icon: Globe },
              { id: 'team' as const, label: 'Team', icon: Users },
              { id: 'api' as const, label: 'API Keys', icon: Key },
              { id: 'notifications' as const, label: 'Notifications', icon: Bell },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-border last:border-b-0 ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-card rounded-lg border border-border p-6 animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">General Settings</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue="ACME Corporation"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="admin@acme.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Plan
                  </label>
                  <input
                    type="text"
                    defaultValue="Professional"
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Description
                </label>
                <textarea
                  defaultValue="We are a leading enterprise technology company..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-semibold">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors font-semibold flex items-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Team Settings */}
          {activeTab === 'team' && (
            <div className="bg-card rounded-lg border border-border p-6 animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Team Members</h2>
              </div>

              <div className="space-y-4">
                {[
                  { email: 'admin@acme.com', role: 'Admin', joined: '2026-01-15' },
                  { email: 'manager@acme.com', role: 'Manager', joined: '2026-02-01' },
                  { email: 'agent@acme.com', role: 'Agent', joined: '2026-02-10' },
                ].map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-foreground">{member.email}</p>
                      <p className="text-sm text-muted-foreground">Joined {member.joined}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        defaultValue={member.role}
                        className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option>Admin</option>
                        <option>Manager</option>
                        <option>Agent</option>
                      </select>
                      <button className="px-4 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-semibold">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2">
                  <Users size={18} />
                  Invite Team Member
                </button>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <div className="bg-card rounded-lg border border-border p-6 animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">API Keys</h2>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  API keys are used to authenticate requests to the CallFlow API. Keep them secret.
                </p>

                <div className="space-y-4">
                  {[
                    { name: 'Production Key', key: 'pk_live_51234567890', created: '2026-01-15' },
                    { name: 'Development Key', key: 'pk_test_0987654321', created: '2026-02-01' },
                  ].map((apiKey) => (
                    <div key={apiKey.key} className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{apiKey.name}</p>
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Copy
                        </button>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground mb-2">{apiKey.key}</p>
                      <p className="text-xs text-muted-foreground">Created {apiKey.created}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold">
                Generate New Key
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-card rounded-lg border border-border p-6 animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Campaign Started', description: 'Notify when a campaign begins' },
                  { label: 'Campaign Completed', description: 'Notify when a campaign finishes' },
                  { label: 'High Error Rate', description: 'Alert if error rate exceeds 20%' },
                  { label: 'Weekly Summary', description: 'Receive weekly performance summary' },
                ].map((notification) => (
                  <div key={notification.label} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">{notification.label}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-semibold">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors font-semibold flex items-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
