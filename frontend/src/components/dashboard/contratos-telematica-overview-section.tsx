import Link from 'next/link'
import type { ContratosResumo } from '@/services/models/contratos'
import { formatNumber } from '@/lib/utils'
import { FileText, CheckCircle2, Clock3, AlertTriangle, ArrowUpRight } from 'lucide-react'

const SECTION_HEADING_ID = 'contratos-telematica-visao-geral'

export function ContratosTelematicaOverviewSection({ resumo }: { resumo: ContratosResumo | null }) {
  return (
    <section
      className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5"
      aria-labelledby={SECTION_HEADING_ID}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400"
              aria-hidden
            >
              <FileText className="size-[18px]" strokeWidth={1.75} />
            </span>
            <h2
              id={SECTION_HEADING_ID}
              className="text-sm font-semibold text-[var(--color-text)] [overflow-wrap:anywhere]"
            >
              Contratos de telemática
            </h2>
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)] leading-relaxed [overflow-wrap:anywhere] text-pretty">
            Pagamentos por competência (OI, Claro, Simpress). Indicadores consolidados de todas as vigências
            importadas.
          </p>
        </div>
        <Link
          href="/contratos"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-3 py-2 text-xs font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-card)]"
          aria-label="Abrir página de contratos de telemática"
        >
          Ver contratos
          <ArrowUpRight className="size-3.5 opacity-80" aria-hidden />
        </Link>
      </div>

      {!resumo ? (
        <p className="mt-4 text-xs text-[var(--color-text-muted)] leading-relaxed [overflow-wrap:anywhere]">
          Indicadores de contratos indisponíveis no momento. Tente novamente quando o backend estiver acessível ou
          após importar a planilha de telemática em{' '}
          <Link href="/importar" className="text-[var(--color-primary)] hover:underline">
            Importar Dados
          </Link>
          .
        </p>
      ) : resumo.totalServicos === 0 ? (
        <p className="mt-4 text-xs text-[var(--color-text-muted)] leading-relaxed [overflow-wrap:anywhere] text-pretty">
          Nenhum contrato na base ainda. Envie a planilha de telemática em{' '}
          <Link href="/importar" className="text-[var(--color-primary)] hover:underline">
            Importar Dados
          </Link>{' '}
          para habilitar os indicadores.
        </p>
      ) : (
        <>
          <div
            className="mt-4 grid grid-cols-2 min-w-0 gap-3 sm:grid-cols-4 sm:gap-4"
            role="group"
            aria-label="Resumo numérico de contratos"
          >
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]/30 p-3 sm:p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                Serviços
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-[var(--color-text)] sm:text-2xl">
                {formatNumber(resumo.totalServicos)}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-emerald-400/90">
                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                Pago
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-[var(--color-text)] sm:text-2xl">
                {formatNumber(resumo.byStatus.PAGO)}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-amber-400/90">
                <Clock3 className="size-3.5 shrink-0" aria-hidden />
                A vencer
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-[var(--color-text)] sm:text-2xl">
                {formatNumber(resumo.byStatus.A_VENCER)}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-rose-500/20 bg-rose-500/5 p-3 sm:p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-rose-400/90">
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                Vencido
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-[var(--color-text)] sm:text-2xl">
                {formatNumber(resumo.byStatus.VENCIDO)}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
