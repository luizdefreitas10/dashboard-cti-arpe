'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { setor: string; digital: number; analogico: number }[]
}

const DIGITAL_COLOR = '#3b82f6'
const ANALOGICO_COLOR = '#8b5cf6'

export function RamaisPorSetorChart({ data }: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="h-[280px] w-full min-w-0 sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="setor"
              width={120}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
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
            <Bar dataKey="digital" name="Digital" stackId="a" fill={DIGITAL_COLOR} radius={[0, 0, 0, 0]} />
            <Bar dataKey="analogico" name="Analógico" stackId="a" fill={ANALOGICO_COLOR} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]"
        role="list"
        aria-label="Legenda: digital e analógico"
      >
        <span className="flex items-center gap-2" role="listitem">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: DIGITAL_COLOR }} aria-hidden />
          Digital
        </span>
        <span className="flex items-center gap-2" role="listitem">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: ANALOGICO_COLOR }} aria-hidden />
          Analógico
        </span>
      </div>
    </div>
  )
}
