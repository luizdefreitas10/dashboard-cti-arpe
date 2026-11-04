/** Cores dos gráficos apontam para tokens CSS, então acompanham o tema claro/escuro. */
const chart = (n: number) => `var(--chart-${n})`

export const CATEGORY_COLORS: Record<string, string> = {
  'Suporte Técnico e Helpdesk': chart(1),
  'Instalação e Configuração de Software/Hardware': chart(5),
  'Suporte Administrativo': chart(4),
  'Administração de Rede e Servidor': chart(3),
  'Administração de Usuários e Acessos': chart(2),
  'Administração de Usuários e Acessórios': chart(2),
  'Suporte de Telemática (Telefonia)': chart(8),
  'Suporte de Telemática': chart(8),
  'Desenvolvimento de Software': chart(7),
  default: chart(6),
}

export const PRIORITY_COLORS: Record<string, string> = {
  Alta: 'var(--color-alta)',
  Média: 'var(--color-media)',
  Baixa: 'var(--color-baixa)',
}

export const HARDWARE_COLORS: Record<string, string> = {
  Monitor: chart(1),
  'Computador Desktop': chart(5),
  Microcomputador: chart(8),
  Notebook: chart(4),
  'Notebook Novo': chart(4),
  'Notebook Antigo': chart(10),
  Switch: chart(3),
  Tablet: chart(9),
  Câmera: chart(2),
  default: chart(6),
}

export const PALETTE = Array.from({ length: 12 }, (_, i) => chart(i + 1))

export const CHART_NEUTRAL = chart(6)
export const CHART_MUTED = 'var(--chart-muted)'

export function getColor(key: string, map: Record<string, string>): string {
  return map[key] ?? map.default ?? CHART_NEUTRAL
}
