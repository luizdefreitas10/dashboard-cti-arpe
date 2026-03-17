'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CATEGORY_COLORS, getColor } from '@/lib/chart-colors'
import { formatNumber } from '@/lib/utils'

interface Props {
  data: { categoria: string; total: number }[]
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

export function DistribuicaoCategoriasChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.total, 0)
  const enriched = data.map((d) => ({
    ...d,
    percent: ((d.total / total) * 100).toFixed(1),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={enriched}
          dataKey="total"
          nameKey="categoria"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {enriched.map((entry) => (
            <Cell key={entry.categoria} fill={getColor(entry.categoria, CATEGORY_COLORS)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
