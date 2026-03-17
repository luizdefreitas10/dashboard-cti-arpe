'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PALETTE } from '@/lib/chart-colors'

interface Props {
  data: { responsavel: string; total: number }[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm shadow-xl">
      <p className="text-[var(--color-text)] font-semibold">{payload[0].payload.responsavel}</p>
      <p className="text-[var(--color-text-muted)]">{payload[0].value} atividades</p>
    </div>
  )
}

export function ProdutividadeResponsavelChart({ data }: Props) {
  const top8 = data.slice(0, 8)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={top8} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <XAxis type="number" tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="responsavel"
          width={80}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border)' }} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {top8.map((_, i) => (
            <Cell key={i} fill={PALETTE[(i + 3) % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
