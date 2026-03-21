'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { formatMonth } from '@/lib/utils'

interface Props {
  data: { mes: string; total: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm shadow-xl">
      <p className="text-[var(--color-text-muted)] mb-1">{formatMonth(label)}</p>
      <p className="text-[var(--color-text)] font-semibold">{payload[0].value} atividades</p>
    </div>
  )
}

export function AtividadesPorMesChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.total))

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="mes"
          tickFormatter={formatMonth}
          tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border)' }} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.mes}
              fill={entry.total === max ? 'var(--color-primary)' : '#3b82f630'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
