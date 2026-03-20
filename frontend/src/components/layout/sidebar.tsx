'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  TableProperties,
  Upload,
  ExternalLink,
  Activity,
  Server,
  ChevronDown,
  X,
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
    ],
  },
  {
    label: 'Power BI',
    href: '/power-bi',
    icon: <ExternalLink size={16} />,
  },
  {
    label: 'Importar Dados',
    href: '/importar',
    icon: <Upload size={16} />,
  },
]

function NavGroup({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false,
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
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-(--color-text-muted) hover:bg-(--color-bg-hover) hover:text-(--color-text) transition-colors cursor-pointer"
      >
        {item.icon}
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          size={14}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="ml-5 mt-0.5 border-l border-(--color-border) pl-3 flex flex-col gap-0.5">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => onNavigate()}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors cursor-pointer',
                pathname === child.href
                  ? 'text-(--color-primary)'
                  : 'text-(--color-text-muted) hover:text-(--color-text)',
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
      {/* Logo */}
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
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary)]/20 flex items-center justify-center">
            <Server size={16} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">Dashboard CTI</p>
            <p className="text-[11px] text-[var(--color-text-subtle)] leading-tight">Coord. de TI</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavGroup key={item.label} item={item} onNavigate={onClose} />
        ))}
      </nav>

      {/* Rodapé */}
      <div className="px-5 py-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-text-subtle)]">
          <Activity size={12} />
          <span className="text-[11px]">v1.0.0</span>
        </div>
      </div>
    </>
  )
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {/* Overlay mobile (modal) */}
      <div
        className={cn(
          'lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-black/40 z-40 transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Drawer mobile: modal abaixo do header */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] w-[78vw] max-w-[320px] bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] flex flex-col z-50 transition-transform',
          'transform',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent onClose={onClose} showCloseButton />
      </aside>

      {/* Drawer desktop/tablet: abaixo do header, empurra conteúdo */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] flex-col z-30 transition-transform',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent onClose={onClose} showCloseButton={false} />
      </aside>
    </>
  )
}
