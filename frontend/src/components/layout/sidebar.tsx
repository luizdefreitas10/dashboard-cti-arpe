'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  TableProperties,
  Upload,
  ExternalLink,
  Layers,
  Activity,
  ChevronDown,
  X,
  FileText,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  children?: { label: string; href: string }[]
  disabled?: boolean
}

const navItems: NavItem[] = [
  {
    label: 'Dashboards',
    icon: <BarChart3 size={16} />,
    children: [
      { label: 'Visão geral', href: '/dashboard' },
      { label: 'Atividades', href: '/dashboard/atividades' },
      { label: 'Bens Patrimoniais', href: '/dashboard/bens' },
    ],
  },
  {
    label: 'Tabelas',
    icon: <TableProperties size={16} />,
    children: [
      { label: 'Atividades', href: '/tabelas/atividades' },
      { label: 'Bens', href: '/tabelas/bens' },
      { label: 'Softwares', href: '/tabelas/softwares' },
      { label: 'Ramais', href: '/tabelas/ramais' },
      { label: 'Celulares', href: '/tabelas/celulares' },
    ],
  },
  {
    label: 'Contratos',
    href: '/contratos',
    icon: <FileText size={16} />,
  },
  {
    label: 'Power BI',
    href: '/power-bi',
    icon: <ExternalLink size={16} />,
  },
  {
    label: 'Soluções Digitais',
    href: '/solucoes-digitais',
    icon: <Layers size={16} />,
  },
  {
    label: 'Importar Dados',
    href: '/importar',
    icon: <Upload size={16} />,
  },
]

function childMatchesPath(pathname: string, childHref: string) {
  if (pathname === childHref) return true
  if (childHref === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(`${childHref}/`)
}

function NavGroup({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(
    item.children?.some((c) => childMatchesPath(pathname, c.href)) ?? false,
  )

  if (item.href) {
    return (
      <Link
        href={item.disabled ? '#' : item.href}
        onClick={() => {
          if (!item.disabled) onNavigate()
        }}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors cursor-pointer',
          pathname === item.href
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]',
          item.disabled && 'opacity-40 pointer-events-none',
        )}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.disabled && (
          <span className="ml-auto text-[10px] bg-[var(--color-border)] text-[var(--color-text-subtle)] px-1.5 py-0.5 rounded">
            Em breve
          </span>
        )}
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
      >
        {item.icon}
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          size={14}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="ml-5 mt-0.5 border-l border-[var(--color-border)] pl-3 flex flex-col gap-0.5">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => onNavigate()}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors cursor-pointer',
                childMatchesPath(pathname, child.href)
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarContent({ onClose, showCloseButton }: { onClose: () => void; showCloseButton: boolean }) {
  return (
    <>
      <div className="px-5 py-4 border-b border-[var(--color-border)] relative">
        {showCloseButton && (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
            className="absolute right-3 top-3 w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)] cursor-pointer flex items-center justify-center"
          >
            <X size={18} />
          </button>
        )}
        <div className="flex items-center gap-3 pr-10">
          <div className="relative w-8 h-8 shrink-0 rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)] flex items-center justify-center">
            <Image
              src="/arpe-drawer-logo.svg"
              alt="ARPE"
              width={32}
              height={32}
              className="object-contain object-center p-0.5"
              priority
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">Dashboard CTI</p>
            <p className="text-[11px] text-[var(--color-text-subtle)] leading-tight">Coord. de TI · ARPE</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavGroup key={item.label} item={item} onNavigate={onClose} />
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-text-subtle)]">
          <Activity size={12} />
          <span className="text-[11px]">v1.0.0</span>
        </div>
      </div>
    </>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay mobile/tablet */}
      <div
        className={cn(
          'fixed top-16 left-0 right-0 bottom-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        role="presentation"
        aria-hidden={!open}
      />

      {/* Drawer mobile/tablet - slide over content */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-[min(78vw,320px)] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        )}
        aria-hidden={!open}
        aria-label="Menu principal (mobile)"
      >
        <SidebarContent onClose={onClose} showCloseButton />
      </aside>

      {/* Sidebar fixa em desktop (lg+) - sempre visível */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 z-30 h-screen w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)]"
        aria-label="Menu principal"
      >
        <SidebarContent onClose={() => {}} showCloseButton={false} />
      </aside>
    </>
  )
}
