'use client'

import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeSwitch } from '@/components/layout/theme-switch'
import { Breadcrumb } from '@/components/layout/breadcrumb'

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Visão geral',
    subtitle: 'Indicadores executivos da CTI',
  },
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
  '/tabelas/celulares': {
    title: 'Celulares corporativos',
    subtitle: 'Inventário com IMEI protegido',
  },
  '/importar': {
    title: 'Importar Dados',
    subtitle: 'Atualizar dados a partir de planilhas',
  },
  '/power-bi': {
    title: 'Power BI',
    subtitle: 'Dashboards externos da CTI',
  },
  '/solucoes-digitais': {
    title: 'Soluções Digitais',
    subtitle: 'Automações e soluções web desenvolvidas pela CTI',
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
    <header className="h-16 shrink-0 border-b border-(--color-border) flex items-center px-2.5 sm:px-4 md:px-6 bg-(--color-bg-sidebar)/60 backdrop-blur-sm sticky top-0 z-50 overflow-hidden">
      <div className="grid w-full h-full min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="flex items-center justify-center min-h-11 min-w-11 sm:min-h-10 sm:min-w-10 shrink-0 rounded-md border border-(--color-border) bg-(--color-bg-card) hover:bg-(--color-bg-hover) cursor-pointer touch-manipulation"
          onClick={onMenuToggle}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="min-w-0 min-h-0 flex flex-col items-center justify-center text-center gap-0 px-1 py-0.5 leading-tight">
          <Breadcrumb />
          <h1 className="text-sm sm:text-base font-semibold text-(--color-text) leading-tight max-w-[min(100%,20rem)] sm:max-w-md md:max-w-xl truncate">
            {info.title}
          </h1>
          <p className="text-[10px] sm:text-xs text-(--color-text-subtle) leading-tight max-w-[min(100%,22rem)] sm:max-w-lg md:max-w-2xl truncate">
            {info.subtitle}
          </p>
        </div>

        <div className="shrink-0 justify-self-end">
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}
