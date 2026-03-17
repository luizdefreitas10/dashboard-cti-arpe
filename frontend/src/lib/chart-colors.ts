export const CATEGORY_COLORS: Record<string, string> = {
  'Suporte Técnico e Helpdesk': '#3b82f6',
  'Instalação e Configuração de Software/Hardware': '#8b5cf6',
  'Suporte Administrativo': '#10b981',
  'Administração de Rede e Servidor': '#f97316',
  'Administração de Usuários e Acessos': '#f43f5e',
  'Administração de Usuários e Acessórios': '#f43f5e',
  'Suporte de Telemática (Telefonia)': '#06b6d4',
  'Suporte de Telemática': '#06b6d4',
  'Desenvolvimento de Software': '#eab308',
  default: '#64748b',
}

export const PRIORITY_COLORS: Record<string, string> = {
  Alta: '#f87171',
  Média: '#fbbf24',
  Baixa: '#34d399',
}

export const HARDWARE_COLORS: Record<string, string> = {
  Monitor: '#3b82f6',
  'Computador Desktop': '#8b5cf6',
  Microcomputador: '#06b6d4',
  Notebook: '#10b981',
  'Notebook Novo': '#10b981',
  'Notebook Antigo': '#059669',
  Switch: '#f97316',
  Tablet: '#eab308',
  Câmera: '#f43f5e',
  default: '#64748b',
}

export const PALETTE = [
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f97316',
  '#f43f5e',
  '#06b6d4',
  '#eab308',
  '#ec4899',
  '#14b8a6',
  '#a855f7',
  '#f59e0b',
  '#22c55e',
]

export function getColor(key: string, map: Record<string, string>): string {
  return map[key] ?? map.default ?? '#64748b'
}
