'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, UserCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { isNavLinkActive, visibleSections } from '@/lib/navigation'

function SidebarBrand() {
  return (
    <div className="px-5 pt-5 pb-4">
      <Link href="/dashboard" className="flex items-center gap-3 rounded-[var(--radius-md)]" aria-label="Ir para a visão geral">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-border)]">
          <Image src="/arpe-drawer-logo.svg" alt="" width={30} height={18} className="h-auto w-[30px]" priority />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-[15px] font-bold leading-tight tracking-[0.01em] text-[var(--color-text)]">
            Dashboard CTI
          </span>
          <span className="block text-[11px] leading-tight text-[var(--color-text-subtle)]">
            Coordenadoria de TI · ARPE
          </span>
        </span>
      </Link>
      <div className="arpe-tricolor mt-4" aria-hidden />
    </div>
  )
}

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const sections = visibleSections(user?.role === 'admin')

  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Navegação principal">
      {sections.map((section) => (
        <div key={section.id} className="mt-3 first:mt-1">
          <p
            id={`nav-section-${section.id}`}
            className="px-3 pb-1.5 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--color-text-subtle)]"
          >
            {section.label}
          </p>
          <ul className="flex flex-col gap-0.5" aria-labelledby={`nav-section-${section.id}`}>
            {section.items.map((item) => {
              const active = isNavLinkActive(pathname, item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex min-h-10 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[13.5px] transition-colors',
                      active
                        ? 'bg-[var(--color-nav-active-bg)] font-semibold text-[var(--color-nav-active-text)]'
                        : 'font-medium text-[var(--color-nav-text)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--color-primary)] transition-opacity',
                        active ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <Icon
                      size={17}
                      strokeWidth={active ? 2.2 : 1.8}
                      aria-hidden
                      className={cn(
                        'shrink-0 transition-colors',
                        active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-subtle)] group-hover:text-[var(--color-text-muted)]',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function SidebarFooter() {
  const { user } = useAuth()
  if (!user) return null
  const isAdmin = user.role === 'admin'

  return (
    <div className="border-t border-[var(--color-border)] px-4 py-3">
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] px-1 py-1">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
          {isAdmin ? <ShieldCheck size={17} aria-hidden /> : <UserCircle2 size={17} aria-hidden />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-[var(--color-text)]">{user.name}</span>
          <span className="block text-[10.5px] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
            {isAdmin ? 'Administrador' : 'Agente'}
          </span>
        </span>
      </div>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <SidebarBrand />
      <SidebarNav onNavigate={onNavigate} />
      <SidebarFooter />
    </>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 top-(--dashboard-header-offset) z-40 bg-[var(--arpe-night)]/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        role="presentation"
        aria-hidden={!open}
      />

      <aside
        id="mobile-navigation"
        className={cn(
          'fixed left-0 top-(--dashboard-header-offset) z-50 flex h-[calc(100dvh-var(--dashboard-header-offset))] w-[min(84vw,var(--sidebar-width))] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] shadow-[var(--shadow-lg)] transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        )}
        aria-hidden={!open}
        inert={!open}
        aria-label="Menu principal"
      >
        <SidebarContent onNavigate={onClose} />
      </aside>

      <aside
        className="hidden lg:flex fixed left-0 top-0 z-30 h-screen w-(--sidebar-width) flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)]"
        aria-label="Menu principal"
      >
        <SidebarContent onNavigate={() => {}} />
      </aside>
    </>
  )
}
