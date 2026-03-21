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
        'min-w-0 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <p className="text-sm text-[var(--color-text-muted)] font-medium min-w-0 flex-1 [overflow-wrap:anywhere] text-pretty">
          {title}
        </p>
        <div
          className="w-9 h-9 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums [overflow-wrap:anywhere] break-words">
          {numericValue}
        </p>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-subtle)] mt-1 [overflow-wrap:anywhere] text-pretty leading-snug">
            {subtitle}
          </p>
        )}
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
