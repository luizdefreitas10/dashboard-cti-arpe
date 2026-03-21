'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

type Crumb = { label: string; href: string }

function trailForPath(pathname: string): Crumb[] {
  const base: Crumb[] = [{ label: 'Início', href: '/dashboard' }]
  if (pathname === '/dashboard') return base

  const map: Record<string, Crumb[]> = {
    '/dashboard/atividades': [...base, { label: 'Atividades', href: '/dashboard/atividades' }],
    '/dashboard/bens': [...base, { label: 'Bens', href: '/dashboard/bens' }],
    '/tabelas/atividades': [...base, { label: 'Tabelas', href: '/tabelas/atividades' }, { label: 'Atividades', href: '/tabelas/atividades' }],
    '/tabelas/bens': [...base, { label: 'Tabelas', href: '/tabelas/bens' }, { label: 'Bens', href: '/tabelas/bens' }],
    '/tabelas/softwares': [...base, { label: 'Tabelas', href: '/tabelas/softwares' }, { label: 'Softwares', href: '/tabelas/softwares' }],
    '/tabelas/ramais': [...base, { label: 'Tabelas', href: '/tabelas/ramais' }, { label: 'Ramais', href: '/tabelas/ramais' }],
    '/tabelas/celulares': [...base, { label: 'Tabelas', href: '/tabelas/celulares' }, { label: 'Celulares', href: '/tabelas/celulares' }],
    '/importar': [...base, { label: 'Importar', href: '/importar' }],
    '/power-bi': [...base, { label: 'Power BI', href: '/power-bi' }],
    '/solucoes-digitais': [...base, { label: 'Soluções digitais', href: '/solucoes-digitais' }],
  }

  return map[pathname] ?? base
}

export function Breadcrumb() {
  const pathname = usePathname()
  const trail = trailForPath(pathname)

  if (trail.length <= 1) return null

  return (
    <nav aria-label="Trilha de navegação" className="flex flex-wrap items-center gap-1 text-[11px] text-[var(--color-text-subtle)] mb-1">
      {trail.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight size={12} className="opacity-50 shrink-0" aria-hidden /> : null}
          {i === trail.length - 1 ? (
            <span className="text-[var(--color-text-muted)] font-medium">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-[var(--color-primary)] transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
