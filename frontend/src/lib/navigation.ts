import {
  AppWindow,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  Layers,
  LayoutDashboard,
  Monitor,
  PieChart,
  Phone,
  Server,
  Smartphone,
  Upload,
  UserCog,
  type LucideIcon,
} from 'lucide-react'

export interface NavLink {
  label: string
  href: string
  icon: LucideIcon
  title: string
  subtitle: string
  adminOnly?: boolean
}

export interface NavSection {
  id: string
  label: string
  /** Destino da seção na trilha de navegação; ausente quando a seção não tem página própria */
  href?: string
  items: NavLink[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboards',
    label: 'Dashboards',
    href: '/dashboard',
    items: [
      {
        label: 'Visão geral',
        href: '/dashboard',
        icon: LayoutDashboard,
        title: 'Visão geral',
        subtitle: 'Indicadores executivos da CTI',
      },
      {
        label: 'Atividades',
        href: '/dashboard/atividades',
        icon: BarChart3,
        title: 'Dashboard de Atividades',
        subtitle: 'Visão geral das atividades da CTI',
      },
      {
        label: 'Bens patrimoniais',
        href: '/dashboard/bens',
        icon: Server,
        title: 'Dashboard de Bens',
        subtitle: 'Monitoramento do patrimônio de TI',
      },
    ],
  },
  {
    id: 'tabelas',
    label: 'Tabelas',
    href: '/tabelas/atividades',
    items: [
      {
        label: 'Atividades',
        href: '/tabelas/atividades',
        icon: ClipboardList,
        title: 'Tabela de Atividades',
        subtitle: 'Listagem completa com filtros avançados',
      },
      {
        label: 'Bens',
        href: '/tabelas/bens',
        icon: Monitor,
        title: 'Tabela de Bens',
        subtitle: 'Inventário patrimonial de hardware',
      },
      {
        label: 'Softwares',
        href: '/tabelas/softwares',
        icon: AppWindow,
        title: 'Ativos de Software',
        subtitle: 'Softwares inventariados na CTI',
      },
      {
        label: 'Ramais',
        href: '/tabelas/ramais',
        icon: Phone,
        title: 'Ramais Telefônicos',
        subtitle: 'Monitoramento de telefones por setor',
      },
      {
        label: 'Celulares',
        href: '/tabelas/celulares',
        icon: Smartphone,
        title: 'Celulares corporativos',
        subtitle: 'Inventário com IMEI protegido',
      },
    ],
  },
  {
    id: 'gestao',
    label: 'Gestão',
    items: [
      {
        label: 'Contratos',
        href: '/contratos',
        icon: FileText,
        title: 'Contratos de Telemática',
        subtitle: 'Pagamentos por prestador e competência',
      },
      {
        label: 'Agenda',
        href: '/agenda',
        icon: CalendarDays,
        title: 'Agenda',
        subtitle: 'Registro e histórico de reuniões da CTI',
      },
      {
        label: 'Power BI',
        href: '/power-bi',
        icon: PieChart,
        title: 'Power BI',
        subtitle: 'Dashboards externos da CTI',
      },
      {
        label: 'Soluções digitais',
        href: '/solucoes-digitais',
        icon: Layers,
        title: 'Soluções Digitais',
        subtitle: 'Automações e soluções web desenvolvidas pela CTI',
      },
    ],
  },
  {
    id: 'administracao',
    label: 'Administração',
    items: [
      {
        label: 'Importar dados',
        href: '/importar',
        icon: Upload,
        title: 'Importar Dados',
        subtitle: 'Atualizar dados a partir de planilhas',
      },
      {
        label: 'Usuários',
        href: '/usuarios',
        icon: UserCog,
        title: 'Usuários',
        subtitle: 'Gestão dos agentes da Coordenadoria de TI',
        adminOnly: true,
      },
    ],
  },
]

export function isNavLinkActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function findNavContext(pathname: string) {
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((link) => isNavLinkActive(pathname, link.href))
    if (item) return { section, item }
  }
  return null
}

export function visibleSections(isAdmin: boolean) {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.adminOnly || isAdmin),
  })).filter((section) => section.items.length > 0)
}
