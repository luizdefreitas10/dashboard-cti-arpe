'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { CalendarClock, CheckCircle2, Search, AlertTriangle, Clock3, FileText } from 'lucide-react'
import ContratosService, { ContratoServico, ContratoStatus, ContratosResumo } from '@/services/models/contratos'
import { cn } from '@/lib/utils'

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const STATUS_META: Record<ContratoStatus, { label: string; className: string }> = {
  PAGO: { label: 'Pago', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  A_VENCER: { label: 'A vencer', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  VENCIDO: { label: 'Vencido', className: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  SEM_STATUS: { label: 'Sem status', className: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
}

const PROVIDER_ICON: Record<'OI' | 'CLARO' | 'SIMPRESS', string> = {
  OI: '/contratos/providers/oi.png',
  CLARO: '/contratos/providers/simpress.png',
  SIMPRESS: '/contratos/providers/claro.png',
}

function formatDateBr(value: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

function KpiCard({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string
  value: number
  icon: React.ReactNode
  colorClass: string
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-subtle)] uppercase tracking-wide">{label}</p>
        <span className={cn('rounded-md p-1.5 border', colorClass)}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  )
}

function MesBadge({ status }: { status: ContratoStatus }) {
  return (
    <span
      className={cn(
        'text-[11px] font-semibold px-2 py-1 rounded-md border',
        STATUS_META[status].className,
      )}
    >
      {STATUS_META[status].label}
    </span>
  )
}

export default function ContratosPage() {
  const [loading, setLoading] = useState(true)
  const [servicos, setServicos] = useState<ContratoServico[]>([])
  const [resumo, setResumo] = useState<ContratosResumo | null>(null)
  const [prestador, setPrestador] = useState<'TODOS' | 'OI' | 'CLARO' | 'SIMPRESS'>('TODOS')
  const [status, setStatus] = useState<'TODOS' | ContratoStatus>('TODOS')
  const [search, setSearch] = useState('')
  const [ano, setAno] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const service = ContratosService()
      const [list, summary] = await Promise.all([
        service.list({ prestador, status, ano: ano ?? undefined, servico: search || undefined }),
        service.resumo({ prestador, ano: ano ?? undefined }),
      ])
      setServicos(list)
      setResumo(summary)
    } catch {
      toast.error('Não foi possível carregar os contratos.')
    } finally {
      setLoading(false)
    }
  }, [prestador, status, ano, search])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const years = useMemo(() => {
    const set = new Set<number>()
    for (const s of servicos) for (const p of s.pagamentos) set.add(p.ano)
    return [...set].sort((a, b) => b - a)
  }, [servicos])

  const visibleServicos = useMemo(() => {
    const hasCompetenciaFilter = status !== 'TODOS' || ano !== null
    if (!hasCompetenciaFilter) return servicos
    // Quando houver filtro de competência (ano/status), não renderiza cards sem dados compatíveis.
    return servicos.filter((s) => s.pagamentos.length > 0)
  }, [servicos, status, ano])

  const hasActiveFilters = useMemo(
    () => prestador !== 'TODOS' || status !== 'TODOS' || ano !== null || search.trim().length > 0,
    [prestador, status, ano, search],
  )

  const hasImportedContracts = (resumo?.totalServicos ?? 0) > 0

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <p className="text-sm text-[var(--color-text-muted)]">
        Gestão dos contratos de telemática da CTI por prestador, com acompanhamento mensal de pagamentos e vigência.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Serviços" value={resumo?.totalServicos ?? 0} icon={<FileText size={15} />} colorClass="border-[var(--color-border)] text-[var(--color-text-subtle)]" />
        <KpiCard label="Pago" value={resumo?.byStatus.PAGO ?? 0} icon={<CheckCircle2 size={15} />} colorClass="border-emerald-500/30 text-emerald-400" />
        <KpiCard label="A vencer" value={resumo?.byStatus.A_VENCER ?? 0} icon={<Clock3 size={15} />} colorClass="border-amber-500/30 text-amber-400" />
        <KpiCard label="Vencido" value={resumo?.byStatus.VENCIDO ?? 0} icon={<AlertTriangle size={15} />} colorClass="border-rose-500/30 text-rose-400" />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text)]"
          >
            <option value="TODOS">Status: todos</option>
            <option value="PAGO">Pago</option>
            <option value="A_VENCER">A vencer</option>
            <option value="VENCIDO">Vencido</option>
            <option value="SEM_STATUS">Sem status</option>
          </select>
          <select
            value={ano ?? ''}
            onChange={(e) => setAno(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text)]"
          >
            <option value="">Ano: todos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar serviço/contrato..."
              className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text)]"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['TODOS', 'OI', 'CLARO', 'SIMPRESS'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrestador(p)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border text-xs transition-colors',
                prestador === p
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              )}
            >
              {p !== 'TODOS' ? (
                <span className="relative w-4 h-4 shrink-0">
                  <Image src={PROVIDER_ICON[p]} alt={`${p} logo`} fill className="object-contain" />
                </span>
              ) : null}
              {p === 'TODOS' ? 'Todos os prestadores' : p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Carregando contratos…</p>
      ) : visibleServicos.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          {!hasImportedContracts ? (
            <>
              <p className="text-sm font-medium text-[var(--color-text)]">Nenhum contrato carregado ainda.</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
                Para começar, importe a planilha de telemática na seção{' '}
                <Link href="/importar" className="text-[var(--color-primary)] hover:underline">
                  Importar Dados
                </Link>
                .
              </p>
            </>
          ) : hasActiveFilters ? (
            <>
              <p className="text-sm font-medium text-[var(--color-text)]">Nenhum resultado para os filtros aplicados.</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
                Ajuste os filtros de prestador, status, ano ou busca para visualizar contratos.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--color-text)]">Nenhum contrato disponível para exibição.</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
                Reimporte a planilha para atualizar a base de contratos.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visibleServicos.map((s) => (
            <section key={s.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)] inline-flex items-center gap-1.5">
                    {s.prestador in PROVIDER_ICON ? (
                      <span className="relative w-4 h-4 shrink-0">
                        <Image
                          src={PROVIDER_ICON[s.prestador as 'OI' | 'CLARO' | 'SIMPRESS']}
                          alt={`${s.prestador} logo`}
                          fill
                          className="object-contain"
                        />
                      </span>
                    ) : null}
                    {s.prestador}
                  </p>
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mt-1">{s.nomeServico}</h3>
                </div>
                <div className="text-right text-xs text-[var(--color-text-muted)]">
                  <p>Nº referência</p>
                  <p className="text-[var(--color-text)] font-medium">{s.numeroReferencia ?? '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-2">
                  <p className="text-[var(--color-text-subtle)]">Início</p>
                  <p className="text-[var(--color-text)] mt-1">{formatDateBr(s.dataInicio)}</p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-2">
                  <p className="text-[var(--color-text-subtle)]">Final</p>
                  <p className="text-[var(--color-text)] mt-1">{formatDateBr(s.dataFinal)}</p>
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-x-auto">
                <table className="w-full text-xs min-w-[560px]">
                  <thead>
                    <tr className="text-left border-b border-[var(--color-border)]">
                      <th className="px-3 py-2 text-[var(--color-text-subtle)]">Ano</th>
                      <th className="px-3 py-2 text-[var(--color-text-subtle)]">Mês</th>
                      <th className="px-3 py-2 text-[var(--color-text-subtle)]">Pagamento</th>
                      <th className="px-3 py-2 text-[var(--color-text-subtle)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.pagamentos.map((p) => (
                      <tr key={`${p.id}-${p.ano}-${p.mes}`} className="border-b border-[var(--color-border)]/60">
                        <td className="px-3 py-2 text-[var(--color-text)]">{p.ano}</td>
                        <td className="px-3 py-2 text-[var(--color-text)]">{MONTH_LABELS[p.mes - 1] ?? p.mes}</td>
                        <td className="px-3 py-2 text-[var(--color-text-muted)]">{p.pagamento ?? '—'}</td>
                        <td className="px-3 py-2">
                          <MesBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {s.observacoes ? (
                <p className="text-xs text-[var(--color-text-muted)] rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <span className="font-medium text-[var(--color-text)] inline-flex items-center gap-1">
                    <CalendarClock size={13} />
                    Observações:
                  </span>{' '}
                  {s.observacoes}
                </p>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
