'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PALETTE } from '@/lib/chart-colors'
import { formatNumber } from '@/lib/utils'

export function ModeloChart({ data }: { data: { modelo: string; total: number }[] }) {
  const total = data.reduce((s, d) => s + d.total, 0)
  const enriched = data.map((d, i) => ({
    ...d,
    color: PALETTE[i % PALETTE.length],
    percent: total > 0 ? ((d.total / total) * 100).toFixed(1) : '0',
  }))

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="h-[200px] w-full min-w-0 sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <Pie
              data={enriched}
              dataKey="total"
              nameKey="modelo"
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="75%"
              paddingAngle={2}
            >
              {enriched.map((entry, i) => (
                <Cell key={`${i}-${entry.modelo}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0].payload
                return (
                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm shadow-xl">
                    <p className="text-[var(--color-text)] font-semibold">{p.modelo}</p>
                    <p className="text-[var(--color-text-muted)]">{formatNumber(p.total)} equipamentos</p>
                    <p className="text-[var(--color-text-subtle)]">{p.percent}%</p>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul
        className="grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-2.5 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2"
        aria-label="Legenda por fabricante/modelo"
      >
        {enriched.map((entry, i) => (
          <li key={`${i}-${entry.modelo}`} className="flex min-w-0 items-start gap-2 text-xs leading-snug">
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="min-w-0 break-words text-[var(--color-text-muted)]">
              <span className="font-medium text-[var(--color-text)]">{entry.modelo}</span>
              <span className="mt-0.5 block tabular-nums text-[var(--color-text-subtle)]">
                {formatNumber(entry.total)} ({entry.percent}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
