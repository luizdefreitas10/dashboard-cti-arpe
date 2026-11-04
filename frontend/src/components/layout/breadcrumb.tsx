'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { findNavContext } from '@/lib/navigation'

type Crumb = { label: string; href?: string }

function trailForPath(pathname: string): Crumb[] {
  const context = findNavContext(pathname)
  if (!context || context.item.href === '/dashboard') return []

  const { section, item } = context
  const sectionHref = section.href && section.href !== item.href ? section.href : undefined
  return [{ label: section.label, href: sectionHref }, { label: item.label }]
}

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname()
  const trail = trailForPath(pathname)

  if (trail.length === 0) return null

  return (
    <nav aria-label="Trilha de navegação" className={cn('min-w-0 text-[11px] leading-tight text-[var(--color-text-subtle)]', className)}>
      <ol className="m-0 flex min-w-0 list-none items-center gap-1 p-0">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1
          return (
            <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 ? <ChevronRight size={11} className="shrink-0 opacity-60" aria-hidden /> : null}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="whitespace-nowrap transition-colors hover:text-[var(--color-primary)]">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn('truncate whitespace-nowrap', isLast && 'font-medium text-[var(--color-text-muted)]')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
