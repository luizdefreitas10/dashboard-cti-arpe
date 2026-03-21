'use client'

import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS, getColor } from '@/lib/chart-colors'
import { formatNumber } from '@/lib/utils'

interface Props {
  data: { categoria: string; total: number }[]
  enableDrillDown?: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm shadow-xl">
      <p className="text-[var(--color-text)] font-semibold">{payload[0].name}</p>
      <p className="text-[var(--color-text-muted)]">{formatNumber(payload[0].value)} atividades</p>
      <p className="text-[var(--color-text-subtle)]">{payload[0].payload.percent}%</p>
    </div>
  )
}

export function DistribuicaoCategoriasChart({ data, enableDrillDown }: Props) {
  const router = useRouter()
  const total = data.reduce((s, d) => s + d.total, 0)
  const enriched = data.map((d) => ({
    ...d,
    percent: ((d.total / total) * 100).toFixed(1),
  }))

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {/* Gráfico isolado: sem Legend do Recharts (no mobile ela sobrepõe o donut) */}
      <div className="h-[200px] w-full min-w-0 sm:h-[240px] md:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <Pie
              data={enriched}
              dataKey="total"
              nameKey="categoria"
              cx="50%"
              cy="50%"
              innerRadius="32%"
              outerRadius="78%"
              paddingAngle={2}
              cursor={enableDrillDown ? 'pointer' : 'default'}
              onClick={(_, index) => {
                if (!enableDrillDown) return
                const cat = enriched[index]?.categoria
                if (cat) router.push(`/tabelas/atividades?categoria=${encodeURIComponent(cat)}`)
              }}
            >
              {enriched.map((entry) => (
                <Cell key={entry.categoria} fill={getColor(entry.categoria, CATEGORY_COLORS)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda fora do SVG: fluxo vertical no mobile, grade em telas maiores */}
      <ul
        className="grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-2.5 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2"
        aria-label="Legenda por categoria"
      >
        {enriched.map((entry) => {
          const color = getColor(entry.categoria, CATEGORY_COLORS)
          return (
            <li key={entry.categoria} className="flex min-w-0 items-start gap-2 text-xs leading-snug">
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="min-w-0 break-words text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-text)]">{entry.categoria}</span>
                <span className="mt-0.5 block tabular-nums text-[var(--color-text-subtle)]">
                  {formatNumber(entry.total)} ({entry.percent}%)
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
