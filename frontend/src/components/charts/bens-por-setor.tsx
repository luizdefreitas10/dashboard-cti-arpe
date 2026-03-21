'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PALETTE } from '@/lib/chart-colors'

interface Props {
  data: { setor: string; total: number }[]
}

export function BensPorSetorChart({ data }: Props) {
  const top12 = data.slice(0, 12)
  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={top12} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <XAxis type="number" tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="setor"
          width={130}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text)',
            fontSize: 12,
          }}
          cursor={{ fill: 'var(--color-border)' }}
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {top12.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
