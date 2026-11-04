'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, UserCircle, X } from 'lucide-react'
import { ThemeSwitch } from '@/components/layout/theme-switch'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { CtiSymbol } from '@/components/brand/cti-brand'
import { useAuth } from '@/context/auth-context'
import { findNavContext } from '@/lib/navigation'

const iconButtonClass =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] cursor-pointer touch-manipulation'

export function Header({
  onMenuToggle,
  isMenuOpen,
}: {
  onMenuToggle: () => void
  isMenuOpen: boolean
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const context = findNavContext(pathname)
  const title = context?.item.title ?? 'Dashboard CTI'
  const subtitle = context?.item.subtitle ?? 'Coordenadoria de TI'

  async function handleLogout() {
    await logout()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg-sidebar)]/85 pt-(--safe-area-inset-top) backdrop-blur-md">
      <div className="flex h-(--dashboard-header-height) items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-8">
        <button
          type="button"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className={`${iconButtonClass} lg:hidden`}
          onClick={onMenuToggle}
        >
          {isMenuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link href="/dashboard" aria-label="CTI — ir para a visão geral" className="shrink-0 rounded-[var(--radius-sm)] lg:hidden">
            <CtiSymbol size={30} decorative />
          </Link>
          <span className="arpe-tricolor hidden w-10 shrink-0 lg:block" aria-hidden />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Breadcrumb className="hidden sm:block" />
            <h1 className="truncate font-display text-[15px] font-bold leading-tight text-[var(--color-text)] sm:text-[17px]">
              {title}
            </h1>
            <p className="hidden truncate text-[11.5px] leading-tight text-[var(--color-text-subtle)] sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user && (
            <div className="hidden min-w-0 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] py-1 pl-1.5 pr-3 md:flex lg:hidden">
              <UserCircle size={18} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
              <span className="max-w-32 truncate text-xs font-semibold text-[var(--color-text)]">{user.name}</span>
            </div>
          )}
          <ThemeSwitch />
          <button type="button" onClick={handleLogout} className={iconButtonClass} aria-label="Sair do sistema" title="Sair do sistema">
            <LogOut size={16} aria-hidden />
          </button>
        </div>
      </div>
    </header>
  )
}
