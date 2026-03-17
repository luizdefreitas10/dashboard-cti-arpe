'use client'

import { formatNumber } from '@/lib/utils'

interface Props {
  data: { diaSemana: string; mes: string; total: number }[]
}

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

export function HeatmapDiasChart({ data }: Props) {
  const meses = [...new Set(data.map((d) => d.mes))].sort().slice(-12)
  const max = Math.max(...data.map((d) => d.total), 1)

  function getValue(dia: string, mes: string) {
    return data.find((d) => d.diaSemana === dia && d.mes === mes)?.total ?? 0
  }

  function getColor(val: number) {
    if (val === 0) return 'bg-[var(--color-border)]'
    const pct = val / max
    if (pct < 0.25) return 'bg-blue-900/40'
    if (pct < 0.5) return 'bg-blue-700/50'
    if (pct < 0.75) return 'bg-blue-500/60'
    return 'bg-blue-400'
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex gap-1 mb-1 ml-[72px]">
          {meses.map((mes) => {
            const [y, m] = mes.split('-')
            const label = new Date(Number(y), Number(m) - 1).toLocaleDateString('pt-BR', { month: 'short' })
            return (
              <div key={mes} className="w-8 text-center text-[10px] text-[var(--color-text-subtle)]">
                {label}
              </div>
            )
          })}
        </div>
        {DIAS.map((dia) => (
          <div key={dia} className="flex items-center gap-1 mb-1">
            <div className="w-16 text-right text-[11px] text-[var(--color-text-muted)] pr-2">{dia}</div>
            {meses.map((mes) => {
              const val = getValue(dia, mes)
              return (
                <div
                  key={mes}
                  title={`${dia} ${mes}: ${formatNumber(val)}`}
                  className={`w-8 h-8 rounded-[var(--radius-sm)] cursor-default transition-opacity hover:opacity-80 ${getColor(val)}`}
                />
              )
            })}
          </div>
        ))}
        <div className="flex items-center gap-2 ml-[72px] mt-3">
          <span className="text-[10px] text-[var(--color-text-subtle)]">Menos</span>
          {['bg-[var(--color-border)]', 'bg-blue-900/40', 'bg-blue-700/50', 'bg-blue-500/60', 'bg-blue-400'].map(
            (c, i) => <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />,
          )}
          <span className="text-[10px] text-[var(--color-text-subtle)]">Mais</span>
        </div>
      </div>
    </div>
  )
}
