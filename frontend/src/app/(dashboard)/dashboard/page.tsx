import { Suspense } from 'react'
import Link from 'next/link'
import { getExecutiveOverview } from './actions'
import { KpiCard, KpiCardSkeleton } from '@/components/dashboard/kpi-card'
import { AtividadesPorAnoChart } from '@/components/charts/charts-dynamic'
import { DataFreshnessBanner } from '@/components/dashboard/data-freshness-banner'
import { ErrorState } from '@/components/dashboard/error-state'
import { DashboardOverviewSkeleton } from '@/components/dashboard/dashboard-overview-skeleton'
import { ContratosTelematicaOverviewSection } from '@/components/dashboard/contratos-telematica-overview-section'
import {
  Activity,
  Server,
  Layers,
  ExternalLink,
  AlertTriangle,
  Smartphone,
  Phone,
  ArrowUpRight,
  BarChart3,
  TableProperties,
  Upload,
  FileText,
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function tipoImportLabel(tipo: string) {
  const m: Record<string, string> = {
    atividades: 'Atividades',
    bens: 'Bens / inventário',
    power_bi: 'Power BI',
    solucoes_digitais: 'Soluções digitais',
    contratos: 'Contratos (telemática)',
  }
  return m[tipo] ?? tipo
}

function calcVariacaoAnoAno(porAno: { ano: string; total: number }[]) {
  if (!porAno || porAno.length < 2) return null
  const sorted = [...porAno].sort((a, b) => Number(b.ano) - Number(a.ano))
  const atual = sorted[0]?.total ?? 0
  const anterior = sorted[1]?.total ?? 0
  if (anterior === 0) return null
  return ((atual - anterior) / anterior) * 100
}

async function DashboardContent() {
  const data = await getExecutiveOverview()

  if (data.isError || !data.statsAtividades || !data.statsBens) {
    const message = data.isError && 'error' in data ? data.error : 'Dados indisponíveis.'
    return (
      <ErrorState
        message={message ?? 'Erro ao carregar dados.'}
        hint="Verifique se o backend está rodando e se a conexão está ok."
      />
    )
  }

  const { statsAtividades: a, statsBens: b } = data
  const topSetor = a.porSetor[0]
  const topCat = a.porCategoria[0]
  const criticidade = b.bensComCriticidadeRegistrada ?? 0
  const variacaoAtividades = calcVariacaoAnoAno(a.porAno ?? [])

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 sm:gap-8">
      <div className="min-w-0">
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed [overflow-wrap:anywhere] text-pretty">
          Visão executiva da <strong className="text-[var(--color-text)]">Coordenadoria de TI</strong>: indicadores
          cruzados de atividades, patrimônio, soluções, contratos de telemática e importações recentes. Use os atalhos
          para aprofundar em cada módulo.
        </p>
        <div className="mt-4">
          <DataFreshnessBanner dataMinima={a.dataMinimaAtividade} dataMaxima={a.dataMaximaAtividade} />
        </div>
      </div>

      {/* KPIs principais — hierarquia: 1 destaque + 3 secundários */}
      <div className="grid grid-cols-1 min-w-0 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Atividades (total)"
          value={formatNumber(a.total)}
          icon={<Activity size={18} />}
          color="var(--color-primary)"
          subtitle="Base importada"
          tooltip="Total de atividades registradas na base da CTI"
          href="/dashboard/atividades"
          variationDelta={variacaoAtividades}
          variationLabel="vs ano anterior"
        />
        <KpiCard
          title="Bens patrimoniais"
          value={formatNumber(b.totalBens)}
          icon={<Server size={18} />}
          color="#1e5a8e"
          subtitle={`${formatNumber(b.totalSoftwares)} softwares`}
          tooltip="Equipamentos e softwares inventariados"
          href="/dashboard/bens"
        />
        <KpiCard
          title="Soluções digitais"
          value={formatNumber(data.solucoesTotal)}
          icon={<Layers size={18} />}
          color="#10b981"
          subtitle={`${data.solucoesConcluidas} concluídas · ${data.solucoesEmAndamento} em andamento`}
          tooltip="Automações e projetos web desenvolvidos pela CTI"
          href="/solucoes-digitais"
        />
        <KpiCard
          title="Dashboards Power BI"
          value={formatNumber(data.powerBiTotal)}
          icon={<ExternalLink size={18} />}
          color="#f97316"
          subtitle={`${data.powerBiConcluidos} em produção`}
          tooltip="Relatórios e dashboards externos"
          href="/power-bi"
        />
      </div>

      {/* KPIs secundários */}
      <div className="grid grid-cols-1 min-w-0 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Maior demanda (setor)"
          value={topSetor?.setor ?? '—'}
          icon={<Activity size={18} />}
          color="#06b6d4"
          subtitle={topSetor ? `${formatNumber(topSetor.total)} atividades` : ''}
          tooltip="Setor com mais atividades registradas"
        />
        <KpiCard
          title="Categoria predominante"
          value={
            topCat?.categoria
              ? topCat.categoria.length > 46
                ? `${topCat.categoria.slice(0, 46)}…`
                : topCat.categoria
              : '—'
          }
          icon={<Activity size={18} />}
          color="#eab308"
          subtitle={topCat ? `${formatNumber(topCat.total)} registros` : ''}
          tooltip="Tipo de atividade mais frequente"
        />
        <KpiCard
          title="Ramais (total)"
          value={formatNumber(b.totalRamais)}
          icon={<Phone size={18} />}
          color="#a855f7"
          subtitle="Telefonia por setor"
          tooltip="Ramais digitais e analógicos"
          href="/tabelas/ramais"
        />
        <KpiCard
          title="Celulares"
          value={formatNumber(b.totalCelulares)}
          icon={<Smartphone size={18} />}
          color="#14b8a6"
          subtitle="Inventário móvel"
          tooltip="Celulares corporativos"
          href="/tabelas/celulares"
        />
      </div>

      <ContratosTelematicaOverviewSection resumo={data.contratosResumo} />

      {data.pctWin11 != null ? (
        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-3 sm:px-4 text-sm text-[var(--color-text-muted)] [overflow-wrap:anywhere] text-pretty leading-relaxed">
          <span className="font-medium text-[var(--color-text)]">Windows 11</span> representa aproximadamente{' '}
          <strong>{data.pctWin11}%</strong> dos bens com Windows 10 ou 11 informados no inventário (exclui registros
          vazios ou &quot;-&quot;).
        </div>
      ) : null}

      {criticidade > 0 ? (
        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3 rounded-[var(--radius-lg)] border border-amber-500/25 bg-amber-500/5 px-3 py-3 sm:px-4">
          <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <p className="min-w-0 text-sm text-[var(--color-text-muted)] [overflow-wrap:anywhere] text-pretty leading-relaxed">
            <strong className="text-[var(--color-text)]">{criticidade}</strong> bens com campo{' '}
            <em>criticidade</em> preenchido — revise na{' '}
            <Link href="/tabelas/bens?comCriticidade=true" className="text-[var(--color-primary)] hover:underline">
              tabela de bens
            </Link>
            .
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 min-w-0 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="min-w-0 overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-6">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3 sm:mb-4 [overflow-wrap:anywhere]">
            Volume de atividades por ano
          </p>
          <div className="min-w-0 w-full">
            <AtividadesPorAnoChart data={a.porAno ?? []} />
          </div>
        </div>
        <div className="min-w-0 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Atalhos</p>
            <p className="text-xs text-[var(--color-text-subtle)] mt-1 leading-relaxed">
              Acesso rápido aos módulos do painel
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {(
              [
                {
                  href: '/dashboard/atividades',
                  title: 'Dashboard de atividades',
                  hint: 'Gráficos e indicadores detalhados',
                  icon: BarChart3,
                  accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
                },
                {
                  href: '/dashboard/bens',
                  title: 'Dashboard de bens',
                  hint: 'Patrimônio e telefonia',
                  icon: Server,
                  accent: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
                },
                {
                  href: '/tabelas/atividades',
                  title: 'Tabela de atividades',
                  hint: 'Listagem com filtros',
                  icon: TableProperties,
                  accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                },
                {
                  href: '/tabelas/celulares',
                  title: 'Tabela de celulares',
                  hint: 'Inventário corporativo',
                  icon: Smartphone,
                  accent: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                },
                {
                  href: '/importar',
                  title: 'Importar planilhas',
                  hint: 'Atualizar dados da CTI',
                  icon: Upload,
                  accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                },
                {
                  href: '/power-bi',
                  title: 'Catálogo Power BI',
                  hint: 'Relatórios e dashboards externos',
                  icon: ExternalLink,
                  accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                },
                {
                  href: '/contratos',
                  title: 'Contratos de telemática',
                  hint: 'Pagamentos por prestador e competência',
                  icon: FileText,
                  accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
                },
                {
                  href: '/solucoes-digitais',
                  title: 'Soluções digitais CTI',
                  hint: 'Automações e projetos web',
                  icon: Layers,
                  accent: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex min-h-[44px] items-center gap-2 sm:gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/40 px-2.5 py-2.5 sm:px-3 sm:py-2.5 transition-all duration-200 hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-bg-hover)]/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-card)] touch-manipulation active:bg-[var(--color-bg-hover)]/60"
                  >
                    <span
                      className={`flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border ${item.accent}`}
                      aria-hidden
                    >
                      <Icon className="size-[17px] sm:size-[18px]" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors [overflow-wrap:anywhere] leading-snug">
                        {item.title}
                      </span>
                      <span className="block text-[11px] text-[var(--color-text-subtle)] mt-0.5 leading-snug [overflow-wrap:anywhere]">
                        {item.hint}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="size-[18px] shrink-0 text-[var(--color-text-subtle)] opacity-70 transition-all duration-200 group-hover:text-[var(--color-primary)] group-hover:opacity-100 group-hover:translate-x-px group-hover:-translate-y-px"
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {data.importLogs.length > 0 ? (
        <section className="min-w-0 border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-card)]">
          <div className="px-3 py-3 sm:px-4 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Últimas importações</h2>
            <p className="text-xs text-[var(--color-text-subtle)] mt-0.5 [overflow-wrap:anywhere] leading-relaxed">
              Auditoria automática após cada upload bem-sucedido.
            </p>
          </div>
          <ul className="sm:hidden divide-y divide-[var(--color-border)]">
            {data.importLogs.map((log) => (
              <li key={log.id} className="px-3 py-3 space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <time
                    className="text-xs text-[var(--color-text-muted)] tabular-nums"
                    dateTime={log.createdAt}
                  >
                    {formatDate(log.createdAt)}
                  </time>
                  <span className="text-xs font-medium tabular-nums text-[var(--color-text-subtle)]">
                    {log.rowsCount ?? '—'} linhas
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--color-text)]">{tipoImportLabel(log.tipo)}</p>
                <p
                  className="text-xs text-[var(--color-text-muted)] break-all [overflow-wrap:anywhere]"
                  title={log.filename ?? ''}
                >
                  {log.filename ?? '—'}
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-subtle)] uppercase">
                  <th className="px-4 py-2 font-medium">Quando</th>
                  <th className="px-4 py-2 font-medium">Tipo</th>
                  <th className="px-4 py-2 font-medium">Arquivo</th>
                  <th className="px-4 py-2 font-medium text-right">Linhas</th>
                </tr>
              </thead>
              <tbody>
                {data.importLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--color-border)]/80 hover:bg-[var(--color-bg-hover)]/50">
                    <td className="px-4 py-2.5 text-[var(--color-text-muted)] tabular-nums whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--color-text)]">{tipoImportLabel(log.tipo)}</td>
                    <td className="px-4 py-2.5 text-[var(--color-text-muted)] text-xs max-w-[200px] truncate" title={log.filename ?? ''}>
                      {log.filename ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-text-muted)]">
                      {log.rowsCount ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="min-w-0">
          <p className="text-xs text-[var(--color-text-subtle)]">
            Nenhuma importação registrada. Use a página <Link href="/importar" className="text-[var(--color-primary)] hover:underline">Importar Dados</Link> para enviar planilhas.
          </p>
        </section>
      )}
    </div>
  )
}

export default function VisaoGeralDashboardPage() {
  return (
    <Suspense fallback={<DashboardOverviewSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
