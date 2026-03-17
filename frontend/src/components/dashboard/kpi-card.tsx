import { cn, formatNumber } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color?: string
  subtitle?: string
  className?: string
}

export function KpiCard({ title, value, icon, color = 'var(--color-primary)', subtitle, className }: KpiCardProps) {
  const numericValue = typeof value === 'number' ? formatNumber(value) : value

  return (
    <div
      className={cn(
        'bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)] font-medium">{title}</p>
        <div
          className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-[var(--color-text)] tabular-nums">{numericValue}</p>
        {subtitle && <p className="text-xs text-[var(--color-text-subtle)] mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-[var(--color-bg-hover)] rounded" />
        <div className="w-9 h-9 bg-[var(--color-bg-hover)] rounded-[var(--radius-md)]" />
      </div>
      <div className="h-8 w-24 bg-[var(--color-bg-hover)] rounded" />
    </div>
  )
}
