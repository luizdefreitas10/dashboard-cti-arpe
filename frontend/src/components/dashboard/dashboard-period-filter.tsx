'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  anosDisponiveis: string[]
  className?: string
}

/** Filtro ?ano=YYYY no dashboard de atividades (preserva outros query params). */
export function DashboardPeriodFilter({ anosDisponiveis, className = '' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ano = searchParams.get('ano') ?? ''

  function setAno(v: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (!v) p.delete('ano')
    else p.set('ano', v)
    const q = p.toString()
    router.replace(q ? `${pathname}?${q}` : pathname)
  }

  if (!anosDisponiveis.length) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <label htmlFor="dashboard-filtro-ano" className="text-xs font-medium text-[var(--color-text-muted)]">
        Período
      </label>
      <select
        id="dashboard-filtro-ano"
        value={ano}
        onChange={(e) => setAno(e.target.value)}
        className="text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] px-2.5 py-1.5 min-w-[140px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
      >
        <option value="">Todos os anos</option>
        {anosDisponiveis.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  )
}
