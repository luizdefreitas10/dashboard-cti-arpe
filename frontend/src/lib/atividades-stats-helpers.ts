/**
 * Converte agregação real (mês × prioridade) para o formato do gráfico de barras agrupadas.
 */
export function pivotPrioridadePorMes(
  rows: { mes: string; prioridade: string; total: number }[],
): { mes: string; Alta: number; Média: number; Baixa: number; Outras: number }[] {
  const meses = [...new Set(rows.map((r) => r.mes))].sort()
  return meses.map((mes) => {
    let Alta = 0
    let Média = 0
    let Baixa = 0
    let Outras = 0
    for (const r of rows) {
      if (r.mes !== mes) continue
      if (r.prioridade === 'Alta') Alta += r.total
      else if (r.prioridade === 'Média') Média += r.total
      else if (r.prioridade === 'Baixa') Baixa += r.total
      else Outras += r.total
    }
    return { mes, Alta, Média, Baixa, Outras }
  })
}

const DIAS_UTEIS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'] as const

/** Normaliza rótulos da planilha para os cinco dias úteis (ignora fim de semana / ruído). */
export function normalizeDiaSemanaLabel(raw: string): (typeof DIAS_UTEIS)[number] | null {
  const t = raw.trim()
  if (/segunda/i.test(t)) return 'Segunda'
  if (/ter[cç]a/i.test(t)) return 'Terça'
  if (/quarta/i.test(t)) return 'Quarta'
  if (/quinta/i.test(t)) return 'Quinta'
  if (/sexta/i.test(t)) return 'Sexta'
  return null
}

/** Agrega totais por dia útil × mês a partir dos dados reais do backend. */
export function aggregateHeatmapDiaSemanaMes(
  rows: { mes: string; diaSemana: string; total: number }[],
): { diaSemana: string; mes: string; total: number }[] {
  const map = new Map<string, number>()
  for (const r of rows) {
    const d = normalizeDiaSemanaLabel(r.diaSemana)
    if (!d) continue
    const k = `${d}\t${r.mes}`
    map.set(k, (map.get(k) ?? 0) + r.total)
  }
  const out: { diaSemana: string; mes: string; total: number }[] = []
  for (const [k, total] of map) {
    const [diaSemana, mes] = k.split('\t')
    out.push({ diaSemana, mes, total })
  }
  return out
}

export const HEATMAP_DIAS_ORDEM = [...DIAS_UTEIS]
