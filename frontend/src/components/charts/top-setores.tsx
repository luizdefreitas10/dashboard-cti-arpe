'use client'

import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PALETTE } from '@/lib/chart-colors'
import type { ChartTooltipProps } from '@/components/charts/chart-tooltip'

interface Props {
  data: { setor: string; total: number }[]
  /** Clique na barra abre a tabela de atividades filtrada por setor */
  enableDrillDown?: boolean
}

const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const setor = item.payload?.setor
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm shadow-xl">
      <p className="text-[var(--color-text)] font-semibold">{typeof setor === 'string' ? setor : item.name}</p>
      <p className="text-[var(--color-text-muted)]">{item.value} atividades</p>
    </div>
  )
}

export function TopSetoresChart({ data, enableDrillDown }: Props) {
  const router = useRouter()
  const top10 = data.slice(0, 10)

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={top10}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
      >
        <XAxis type="number" tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="setor"
          width={100}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border)' }} />
        <Bar
          dataKey="total"
          radius={[0, 4, 4, 0]}
          cursor={enableDrillDown ? 'pointer' : 'default'}
          onClick={(item: unknown) => {
            if (!enableDrillDown) return
            const payload = (item as { payload?: { setor?: string } })?.payload
            const setor = payload?.setor
            if (!setor) return
            router.push(`/tabelas/atividades?setor=${encodeURIComponent(setor)}`)
          }}
        >
          {top10.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
