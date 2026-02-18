'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import type { PropsWithChildren } from 'react'

export interface Tenant {
  id: string
  name: string
  logo?: string
  primaryColor?: string
  accentColor?: string
  plan: 'starter' | 'professional' | 'enterprise'
  createdAt: string
}

export interface TenantUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'agent'
  tenantId: string
  createdAt: string
}

/**
 * Extract tenantId from URL parameters
 * Usage: const tenantId = useGetTenantId()
 */
export function useGetTenantId(): string | null {
  const params = useParams()
  const tenantId = params?.tenantId

  if (!tenantId || typeof tenantId !== 'string') {
    return null
  }

  return tenantId
}

/**
 * Get the tenant-scoped API path
 * Usage: const path = getTenantApiPath(tenantId, '/campaigns')
 */
export function getTenantApiPath(tenantId: string, endpoint: string): string {
  return `/api/tenants/${tenantId}${endpoint}`
}

/**
 * Create a tenant-scoped fetch request
 * Usage: const response = await tenantFetch(tenantId, '/campaigns')
 */
export async function tenantFetch(
  tenantId: string,
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const path = getTenantApiPath(tenantId, endpoint)
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      ...options?.headers,
    },
  })
}

/**
 * Higher-order component to ensure tenant context
 */
export function withTenantProtection<P extends PropsWithChildren>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const tenantId = useGetTenantId()

    if (!tenantId) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Validate tenant access (mock implementation)
 * In production, verify JWT claims contain tenantId
 */
export function validateTenantAccess(userTenantId: string, requestTenantId: string): boolean {
  return userTenantId === requestTenantId
}

/**
 * Format tenant name for display
 */
export function formatTenantName(name: string): string {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}
