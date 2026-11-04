import Link from 'next/link'
import { cn, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color?: string
  subtitle?: string
  tooltip?: string
  href?: string
  /** Variação percentual vs período anterior (ex: 12.5 = +12,5%) */
  variationDelta?: number | null
  variationLabel?: string
  className?: string
}

export function KpiCard({
  title,
  value,
  icon,
  color = 'var(--color-primary)',
  subtitle,
  tooltip,
  href,
  variationDelta,
  variationLabel,
  className,
}: KpiCardProps) {
  const numericValue = typeof value === 'number' ? formatNumber(value) : value
  const hasVariation = variationDelta != null && variationDelta !== 0
  const variationPositive = variationDelta != null && variationDelta > 0

  const content = (
    <>
      <div className="flex items-start justify-between gap-2 min-w-0">
        <p
          className="text-sm text-[var(--color-text-muted)] font-medium min-w-0 flex-1 [overflow-wrap:anywhere] text-pretty"
          title={tooltip}
        >
          {title}
        </p>
        <div
          className="w-9 h-9 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="font-display text-2xl sm:text-[1.75rem] font-extrabold leading-tight text-[var(--color-kpi-value)] tabular-nums [overflow-wrap:anywhere] break-words">
            {numericValue}
          </p>
          {hasVariation && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                variationPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
              )}
            >
              {variationPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {variationPositive ? '+' : ''}
              {variationDelta!.toFixed(1)}%
            </span>
          )}
        </div>
        {variationLabel && hasVariation && (
          <p className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">{variationLabel}</p>
        )}
        {subtitle && (
          <p className="text-xs text-[var(--color-text-subtle)] mt-1 [overflow-wrap:anywhere] text-pretty leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </>
  )

  const cardClass = cn(
    'arpe-surface arpe-accent-top min-w-0 p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4 transition-[border-color,box-shadow,transform] duration-200',
    href && 'hover:border-[var(--color-primary)]/35 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer',
    className,
  )

  if (href) {
    return (
      <Link href={href} className={cardClass} title={tooltip}>
        {content}
      </Link>
    )
  }

  return (
    <div className={cardClass} title={tooltip}>
      {content}
    </div>
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="arpe-surface p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-[var(--color-bg-hover)] rounded" />
        <div className="w-9 h-9 bg-[var(--color-bg-hover)] rounded-[var(--radius-md)]" />
      </div>
      <div className="h-8 w-24 bg-[var(--color-bg-hover)] rounded" />
    </div>
  )
}
