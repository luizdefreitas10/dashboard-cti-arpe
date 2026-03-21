import { KpiCardSkeleton } from './kpi-card'

export function DashboardOverviewSkeleton() {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 sm:gap-8 animate-pulse">
      <div className="min-w-0">
        <div className="h-4 w-3/4 bg-[var(--color-bg-hover)] rounded mb-3" />
        <div className="h-3 w-48 bg-[var(--color-bg-hover)] rounded" />
      </div>

      <div className="grid grid-cols-1 min-w-0 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 min-w-0 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 min-w-0 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)]" />
        <div className="h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)]" />
      </div>
    </div>
  )
}
