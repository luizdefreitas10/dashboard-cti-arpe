import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-card)]/50 ${className}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[var(--color-text-subtle)]" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      {description && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm [overflow-wrap:anywhere] text-pretty">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
