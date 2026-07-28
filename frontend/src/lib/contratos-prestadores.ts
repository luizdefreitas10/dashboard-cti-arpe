export const CONTRATO_PRESTADORES = [
  'OI',
  'CLARO',
  'SIMPRESS',
  'MÉTODO',
  'VECTRA',
  '1TELECOM',
] as const

export type ContratoPrestador = (typeof CONTRATO_PRESTADORES)[number]

export type ContratoPrestadorFilter = 'TODOS' | ContratoPrestador

/** Logos em /public/contratos/providers/ (1TELECOM usa marca Um Telecom — mesma razão social). */
export const CONTRATO_PRESTADOR_ICONS: Partial<Record<ContratoPrestador, string>> = {
  OI: '/contratos/providers/oi.png',
  CLARO: '/contratos/providers/claro.png',
  SIMPRESS: '/contratos/providers/simpress.png',
  MÉTODO: '/contratos/providers/metodo.png',
  VECTRA: '/contratos/providers/vectra.png',
  '1TELECOM': '/contratos/providers/1telecom.png',
}

export function getContratoPrestadorIcon(prestador: string): string | null {
  return CONTRATO_PRESTADOR_ICONS[prestador as ContratoPrestador] ?? null
}

export const CONTRATO_PRESTADOR_FILTER_OPTIONS: ContratoPrestadorFilter[] = [
  'TODOS',
  ...CONTRATO_PRESTADORES,
]
