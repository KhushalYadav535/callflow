import type { ReactNode } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function TenantLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode
  params: Promise<{ tenantId: string }>
}>) {
  return <DashboardLayout>{children}</DashboardLayout>
}
