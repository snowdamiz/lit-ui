import { useRef, useState, useEffect } from 'react'
import '@lit-ui/button'
import '@lit-ui/dialog'
import '@lit-ui/tabs'
import '@lit-ui/input'
import '@lit-ui/select'
import '@lit-ui/switch'
import '@lit-ui/checkbox'
import '@lit-ui/accordion'
import '@lit-ui/tooltip'
import type { Dialog } from '@lit-ui/dialog'
import { useReveal } from '../hooks/useReveal'

const teamMembers = [
  { name: 'Sarah Chen', role: 'Engineering', email: 'sarah@acme.io', active: true },
  { name: 'Marcus Johnson', role: 'Design', email: 'marcus@acme.io', active: true },
  { name: 'Priya Patel', role: 'Product', email: 'priya@acme.io', active: false },
  { name: 'Alex Rivera', role: 'Engineering', email: 'alex@acme.io', active: true },
]

const stats = [
  {
    label: 'Total Revenue', value: '$48,250', change: '+12.5%', up: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Active Users', value: '2,420', change: '+8.1%', up: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: 'Conversion', value: '3.24%', change: '-0.4%', up: false,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    label: 'Avg. Order', value: '$68.50', change: '+2.3%', up: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
]

function ComponentPreview() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const dialogRef = useRef<Dialog>(null)
  const { ref: sectionRef, isVisible } = useReveal({ threshold: 0.1 })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (dialogOpen) {
      dialog.show()
    } else {
      dialog.close()
    }
  }, [dialogOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => setDialogOpen(false)
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  const handleDelete = (name: string) => {
    setDeleteTarget(name)
    setDialogOpen(true)
  }

  return (
    <section id="components" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent" />

      <div ref={sectionRef} className="relative mx-auto max-w-6xl px-6">
        <div className={`mb-12 text-center reveal ${isVisible ? 'revealed' : ''}`}>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
            Interactive Preview
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-gray-900 md:text-4xl lg:text-5xl">
            Built for Real Apps
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed">
            See how components work together in a real dashboard.
            Everything you see below is built with Lit UI.
          </p>
        </div>

        <div
          className={`mx-auto max-w-5xl reveal ${isVisible ? 'revealed' : ''}`}
          style={{ transitionDelay: '0.1s' }}
        >
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white card-elevated" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 8px -1px rgba(0,0,0,0.06), 0 12px 24px -4px rgba(0,0,0,0.05)' }}>
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-gray-200/80 bg-gray-50/80 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ background: '#FF5F57', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }} />
                <div className="h-3 w-3 rounded-full" style={{ background: '#FDBC40', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }} />
                <div className="h-3 w-3 rounded-full" style={{ background: '#33C748', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }} />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-gray-400 border border-gray-200" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                app.acme.io/dashboard
              </div>
            </div>

            {/* Dashboard header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Dashboard</h3>
                <p className="text-xs text-gray-400">Jan 1 – Jan 31, 2025</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  <span className="absolute right-1 top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                </button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                  AC
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-0">
              <lui-tabs default-value="overview" label="Dashboard navigation">
                <lui-tab-panel value="overview" label="Overview">
                  <div className="p-6 space-y-8">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.map((stat) => (
                        <div key={stat.label} className="stat-card rounded-xl border border-gray-200/60 bg-white p-4">
                          <div className="flex items-start justify-between mb-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{stat.label}</p>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                              {stat.icon}
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <svg className={`h-3.5 w-3.5 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={stat.up ? 'M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25' : 'M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25'} />
                            </svg>
                            <p className={`text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                              {stat.change}
                            </p>
                            <p className="text-xs text-gray-400 ml-0.5">vs last month</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recent orders table */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Recent Orders</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Showing 4 of 128 orders</p>
                        </div>
                        <lui-button variant="outline" size="sm">
                          <svg slot="icon-start" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export
                        </lui-button>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Order</th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Customer</th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">Status</th>
                              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-gray-500">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {[
                              { id: '#4021', customer: 'Sarah Chen', status: 'Completed', amount: '$250.00' },
                              { id: '#4020', customer: 'Marcus Johnson', status: 'Processing', amount: '$128.50' },
                              { id: '#4019', customer: 'Priya Patel', status: 'Completed', amount: '$89.00' },
                              { id: '#4018', customer: 'Alex Rivera', status: 'Pending', amount: '$340.00' },
                            ].map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{order.id}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600">
                                      {order.customer.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="text-gray-700">{order.customer}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                    order.status === 'Completed'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : order.status === 'Processing'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-amber-50 text-amber-700'
                                  }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                      order.status === 'Completed'
                                        ? 'bg-emerald-500'
                                        : order.status === 'Processing'
                                          ? 'bg-blue-500'
                                          : 'bg-amber-500'
                                    }`} />
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900">{order.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </lui-tab-panel>

                <lui-tab-panel value="team" label="Team">
                  <div className="p-6 space-y-5">
                    {/* Filters row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <lui-input
                          type="search"
                          placeholder="Search team members..."
                          clearable
                        >
                          <svg slot="prefix" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </lui-input>
                      </div>
                      <lui-select placeholder="All roles" clearable>
                        <lui-option value="engineering" label="Engineering" />
                        <lui-option value="design" label="Design" />
                        <lui-option value="product" label="Product" />
                      </lui-select>
                      <lui-tooltip content="Add a new team member">
                        <lui-button variant="primary" size="md">
                          <svg slot="icon-start" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Add
                        </lui-button>
                      </lui-tooltip>
                    </div>

                    {/* Team list */}
                    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                      {teamMembers.map((member) => (
                        <div key={member.email} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                              <p className="text-xs text-gray-500 truncate">{member.role} &middot; {member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <lui-switch
                              checked={member.active || undefined}
                              size="sm"
                            />
                            <lui-tooltip content="Remove member">
                              <lui-button variant="ghost" size="sm" onClick={() => handleDelete(member.name)}>
                                <svg slot="icon-start" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </lui-button>
                            </lui-tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </lui-tab-panel>

                <lui-tab-panel value="settings" label="Settings">
                  <div className="p-6">
                    <lui-accordion default-value="profile" collapsible>
                      <lui-accordion-item value="profile">
                        <span slot="header">Profile Settings</span>
                        <div className="space-y-4 py-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <lui-input label="Display Name" value="Acme Inc" placeholder="Your name" />
                            <lui-input label="Email" type="email" value="team@acme.io" placeholder="you@example.com" />
                          </div>
                          <lui-select label="Timezone" value="utc-8" placeholder="Select timezone">
                            <lui-option value="utc-8" label="Pacific Time (UTC-8)" />
                            <lui-option value="utc-5" label="Eastern Time (UTC-5)" />
                            <lui-option value="utc+0" label="UTC" />
                            <lui-option value="utc+1" label="Central European (UTC+1)" />
                          </lui-select>
                        </div>
                      </lui-accordion-item>

                      <lui-accordion-item value="notifications">
                        <span slot="header">Notifications</span>
                        <div className="space-y-4 py-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Email notifications</p>
                              <p className="text-xs text-gray-500">Receive order updates via email</p>
                            </div>
                            <lui-switch checked size="sm" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Push notifications</p>
                              <p className="text-xs text-gray-500">Browser push for real-time alerts</p>
                            </div>
                            <lui-switch size="sm" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Weekly digest</p>
                              <p className="text-xs text-gray-500">Summary of activity every Monday</p>
                            </div>
                            <lui-switch checked size="sm" />
                          </div>
                        </div>
                      </lui-accordion-item>

                      <lui-accordion-item value="security">
                        <span slot="header">Security</span>
                        <div className="space-y-4 py-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Two-factor authentication</p>
                              <p className="text-xs text-gray-500">Add an extra layer of security</p>
                            </div>
                            <lui-switch checked size="sm" />
                          </div>
                          <lui-checkbox label="Require 2FA for all team members" />
                          <lui-select label="Session timeout" value="30" placeholder="Select duration">
                            <lui-option value="15" label="15 minutes" />
                            <lui-option value="30" label="30 minutes" />
                            <lui-option value="60" label="1 hour" />
                            <lui-option value="never" label="Never" />
                          </lui-select>
                          <div className="pt-2">
                            <lui-button variant="primary" size="sm">Save Changes</lui-button>
                          </div>
                        </div>
                      </lui-accordion-item>
                    </lui-accordion>
                  </div>
                </lui-tab-panel>
              </lui-tabs>
            </div>
          </div>

          {/* Component count badge */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
            <span className="mr-1 text-gray-400 font-medium">Built with</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-tabs</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-input</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-select</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-switch</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-button</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-dialog</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-accordion</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-checkbox</span>
            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-500" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>lui-tooltip</span>
          </div>
        </div>

        {/* Confirm delete dialog */}
        <lui-dialog ref={dialogRef} show-close-button>
          <span slot="title">Remove Team Member</span>
          <p className="text-sm text-gray-500 leading-relaxed">
            Are you sure you want to remove <strong className="text-gray-900">{deleteTarget}</strong> from the team?
            This action cannot be undone.
          </p>
          <div slot="footer">
            <lui-button variant="ghost" onClick={() => dialogRef.current?.close()}>
              Cancel
            </lui-button>
            <lui-button variant="destructive" onClick={() => dialogRef.current?.close()}>
              Remove
            </lui-button>
          </div>
        </lui-dialog>
      </div>
    </section>
  )
}

export default ComponentPreview
