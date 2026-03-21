'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PRIORITY_COLORS } from '@/lib/chart-colors'
import { formatMonth } from '@/lib/utils'

interface Props {
  data: { mes: string; Alta: number; Média: number; Baixa: number; Outras?: number }[]
}

export function PrioridadePorMesChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
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
        <YAxis tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text)',
            fontSize: 12,
          }}
          labelFormatter={(l) => formatMonth(String(l))}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{v}</span>}
        />
        <Bar dataKey="Alta" fill={PRIORITY_COLORS.Alta} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Média" fill={PRIORITY_COLORS.Média} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Baixa" fill={PRIORITY_COLORS.Baixa} radius={[2, 2, 0, 0]} />
        {data.some((d) => (d.Outras ?? 0) > 0) ? (
          <Bar dataKey="Outras" fill="#64748b" radius={[2, 2, 0, 0]} />
        ) : null}
      </BarChart>
    </ResponsiveContainer>
  )
}
