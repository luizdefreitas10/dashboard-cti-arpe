'use client'

import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PALETTE } from '@/lib/chart-colors'

interface Props {
  data: { nome: string; total: number }[]
  /** Abre a tabela de atividades com busca pelo nome ao clicar na barra */
  enableDrillDown?: boolean
}

export function TopNomesAtividadesChart({ data, enableDrillDown }: Props) {
  const router = useRouter()
  const top = data.slice(0, 12)

  return (
    <div className="h-[320px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={top}
        layout="vertical"
        margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
      >
        <XAxis type="number" tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="nome"
          width={140}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (String(v).length > 22 ? `${String(v).slice(0, 22)}…` : String(v))}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text)',
            fontSize: 12,
          }}
          formatter={(v) => [`${Number(v ?? 0)} ocorrências`, '']}
        />
        <Bar
          dataKey="total"
          radius={[0, 4, 4, 0]}
          cursor={enableDrillDown ? 'pointer' : 'default'}
          onClick={(item: unknown) => {
            if (!enableDrillDown) return
            const payload = (item as { payload?: { nome?: string } })?.payload
            const nome = payload?.nome
            if (!nome) return
            router.push(`/tabelas/atividades?busca=${encodeURIComponent(String(nome))}`)
          }}
        >
          {top.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
