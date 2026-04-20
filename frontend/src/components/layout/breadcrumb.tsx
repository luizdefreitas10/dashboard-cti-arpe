'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

/** Último item = página atual (sem href); demais com link quando aplicável */
type Crumb = { label: string; href?: string }

function trailForPath(pathname: string): Crumb[] {
  const home: Crumb = { label: 'Início', href: '/dashboard' }

  const map: Record<string, Crumb[]> = {
    '/dashboard/atividades': [home, { label: 'Atividades' }],
    '/dashboard/bens': [home, { label: 'Bens' }],
    '/tabelas/atividades': [home, { label: 'Atividades' }],
    '/tabelas/bens': [home, { label: 'Tabelas', href: '/tabelas/atividades' }, { label: 'Bens' }],
    '/tabelas/softwares': [home, { label: 'Tabelas', href: '/tabelas/atividades' }, { label: 'Softwares' }],
    '/tabelas/ramais': [home, { label: 'Tabelas', href: '/tabelas/atividades' }, { label: 'Ramais' }],
    '/tabelas/celulares': [home, { label: 'Tabelas', href: '/tabelas/atividades' }, { label: 'Celulares' }],
    '/importar': [home, { label: 'Importar' }],
    '/contratos': [home, { label: 'Contratos' }],
    '/power-bi': [home, { label: 'Power BI' }],
    '/solucoes-digitais': [home, { label: 'Soluções digitais' }],
  }

  return map[pathname] ?? []
}

export function Breadcrumb({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const trail = trailForPath(pathname)

  if (trail.length <= 1) return null

  return (
    <nav
      aria-label="Trilha de navegação"
      className={`flex flex-wrap items-center justify-center gap-1 text-[11px] text-[var(--color-text-subtle)] mb-0.5 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1 list-none m-0 p-0" style={{ listStyle: 'none' }}>
        {trail.map((c, i) => {
          const isLast = i === trail.length - 1
          const showLink = Boolean(c.href) && !isLast

          return (
            <li key={`${pathname}-crumb-${i}`} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight size={12} className="opacity-50 shrink-0" aria-hidden /> : null}
              {showLink ? (
                <Link href={c.href!} className="hover:text-[var(--color-primary)] transition-colors whitespace-nowrap">
                  {c.label}
                </Link>
              ) : (
                <span className="text-[var(--color-text-muted)] font-medium whitespace-nowrap" aria-current="page">
                  {c.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
