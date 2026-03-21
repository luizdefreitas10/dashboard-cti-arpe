'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { ano: string; total: number }[]
}

export function AtividadesPorAnoChart({ data }: Props) {
  if (!data.length) {
    return <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Sem dados por ano no período.</p>
  }

  return (
    <div className="h-[260px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="ano"
          tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
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
          formatter={(v) => [`${Number(v ?? 0)} atividades`, 'Total']}
          labelFormatter={(l) => `Ano ${l}`}
        />
        <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Atividades" />
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
