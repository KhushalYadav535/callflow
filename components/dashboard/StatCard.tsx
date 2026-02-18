'use client'

import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: number
  loading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading = false,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-card rounded-lg border border-border p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 animate-fade-in ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {(subtitle || trend) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {subtitle}
                  {trend && (
                    <span className={trend > 0 ? 'text-green-500' : 'text-red-500'}>
                      {' '}
                      {trend > 0 ? '+' : ''}{trend}%
                    </span>
                  )}
                </p>
              )}
            </>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 rounded-lg bg-primary/10">
            <div className="text-primary">{icon}</div>
          </div>
        )}
      </div>
    </div>
  )
}
