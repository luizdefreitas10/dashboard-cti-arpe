'use client'

import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeSwitch } from '@/components/layout/theme-switch'

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard/atividades': {
    title: 'Dashboard de Atividades',
    subtitle: 'Visão geral das atividades da CTI',
  },
  '/dashboard/bens': {
    title: 'Dashboard de Bens',
    subtitle: 'Monitoramento do patrimônio de TI',
  },
  '/tabelas/atividades': {
    title: 'Tabela de Atividades',
    subtitle: 'Listagem completa com filtros avançados',
  },
  '/tabelas/bens': {
    title: 'Tabela de Bens',
    subtitle: 'Inventário patrimonial de hardware',
  },
  '/tabelas/softwares': {
    title: 'Ativos de Software',
    subtitle: 'Softwares inventariados na CTI',
  },
  '/tabelas/ramais': {
    title: 'Ramais Telefônicos',
    subtitle: 'Monitoramento de telefones por setor',
  },
  '/importar': {
    title: 'Importar Dados',
    subtitle: 'Atualizar dados a partir de planilhas',
  },
  '/power-bi': {
    title: 'Power BI',
    subtitle: 'Dashboards externos da CTI',
  },
}

export function Header({
  onMenuToggle,
  isMenuOpen,
}: {
  onMenuToggle: () => void
  isMenuOpen: boolean
}) {
  const pathname = usePathname()
  const info = TITLES[pathname] ?? { title: 'Dashboard CTI', subtitle: 'Coordenadoria de TI' }

  return (
    <header className="h-16 border-b border-(--color-border) flex items-center px-4 sm:px-6 bg-(--color-bg-sidebar)/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3 w-full justify-between">
        <button
          type="button"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="flex items-center justify-center w-10 h-10 rounded-md border border-(--color-border) bg-(--color-bg-card) hover:bg-(--color-bg-hover) cursor-pointer"
          onClick={onMenuToggle}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div>
          <h1 className="text-base font-semibold text-(--color-text)">{info.title}</h1>
          <p className="text-xs text-(--color-text-subtle)">{info.subtitle}</p>
        </div>

        <div className="ml-auto">
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}
