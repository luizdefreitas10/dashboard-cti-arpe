interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h2 className="font-display text-base font-bold text-[var(--color-text)]">{title}</h2>
        {description && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}
