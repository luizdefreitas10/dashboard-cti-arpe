import { Suspense } from 'react'
import { getAtividadesStats } from './actions'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { DashboardPeriodFilter } from '@/components/dashboard/dashboard-period-filter'
import { DataFreshnessBanner } from '@/components/dashboard/data-freshness-banner'
import {
  AtividadesPorMesChart,
  DistribuicaoCategoriasChart,
  TopSetoresChart,
  ProdutividadeResponsavelChart,
  PrioridadePorMesChart,
  EvolucaoTemporalChart,
  AtividadesPorAnoChart,
  TopNomesAtividadesChart,
} from '@/components/charts/charts-dynamic'
import { HeatmapDiasChart } from '@/components/charts/heatmap-dias'
import { pivotPrioridadePorMes, aggregateHeatmapDiaSemanaMes } from '@/lib/atividades-stats-helpers'
import { Activity, Users, Building2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

function ChartCard({ title, hint, children, className = '' }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 ${className}`}>
      <div className="mb-4">
        <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
        {hint ? <p className="text-[11px] text-[var(--color-text-subtle)] mt-1">{hint}</p> : null}
      </div>
      {children}
    </div>
  )
}

async function DashboardAtividadesContent({ ano }: { ano?: string }) {
  const { stats, isError } = await getAtividadesStats(ano ? { ano } : undefined)

  if (isError || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-muted)]">Erro ao carregar dados. Verifique se o backend está rodando.</p>
      </div>
    )
  }

  const topResponsavel = stats.porResponsavel[0]
  const topSetor = stats.porSetor[0]
  const prioridadePorMes = pivotPrioridadePorMes(stats.porMesPrioridade ?? [])
  const heatmapData = aggregateHeatmapDiaSemanaMes(stats.porDiaSemanaMes ?? [])
  const anosComDados = stats.anosComDados ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <DataFreshnessBanner
          dataMinima={stats.dataMinimaAtividade}
          dataMaxima={stats.dataMaximaAtividade}
          filtroAno={ano ?? null}
        />
        <Suspense fallback={null}>
          <DashboardPeriodFilter anosDisponiveis={anosComDados} />
        </Suspense>
      </div>
      <p className="text-xs text-[var(--color-text-subtle)]">
        Dica: nos gráficos de <strong className="text-[var(--color-text-muted)]">setores</strong>,{' '}
        <strong className="text-[var(--color-text-muted)]">categorias</strong> e{' '}
        <strong className="text-[var(--color-text-muted)]">tipos de atividade</strong>, clique para abrir a tabela já
        filtrada.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          title="Total de Atividades"
          value={stats.total}
          icon={<Activity size={18} />}
          color="var(--color-primary)"
          subtitle={ano ? `Ano ${ano}` : 'Período completo nos filtros atuais'}
        />
        <KpiCard
          title="Categorias"
          value={stats.porCategoria.length}
          icon={<TrendingUp size={18} />}
          color="#8b5cf6"
          subtitle="Tipos distintos de atividade"
        />
        <KpiCard
          title="Responsável mais ativo"
          value={topResponsavel?.responsavel ?? '—'}
          icon={<Users size={18} />}
          color="#10b981"
          subtitle={topResponsavel ? `${topResponsavel.total} atividades` : ''}
        />
        <KpiCard
          title="Setor com mais demandas"
          value={topSetor?.setor ?? '—'}
          icon={<Building2 size={18} />}
          color="#f97316"
          subtitle={topSetor ? `${topSetor.total} chamados` : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Atividades por Mês" className="flex flex-col justify-center items-center">
          <AtividadesPorMesChart data={stats.porMes} />
        </ChartCard>
        <ChartCard
          title="Distribuição por Categoria"
          hint="Clique em uma fatia para ver a tabela filtrada por categoria."
        >
          <DistribuicaoCategoriasChart data={stats.porCategoria} enableDrillDown />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Top 10 Setores com mais Demandas"
          hint="Clique em uma barra para filtrar por setor na tabela."
        >
          <TopSetoresChart data={stats.porSetor} enableDrillDown />
        </ChartCard>
        <ChartCard title="Produtividade por Responsável">
          <ProdutividadeResponsavelChart data={stats.porResponsavel} />
        </ChartCard>
      </div>

      <ChartCard
        title="Top tipos de atividade (nome padronizado)"
        hint="Clique em uma barra para buscar esse nome na tabela de atividades."
      >
        <TopNomesAtividadesChart data={stats.porNomeAtividade ?? []} enableDrillDown />
      </ChartCard>

      <ChartCard
        title="Distribuição de Prioridade por Mês"
        hint="Contagens reais por mês e prioridade (planilha importada)."
      >
        <PrioridadePorMesChart data={prioridadePorMes} />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Volume por Ano (comparativo)">
          <AtividadesPorAnoChart data={stats.porAno ?? []} />
        </ChartCard>
        <ChartCard title="Evolução Temporal (Área)">
          <EvolucaoTemporalChart data={stats.porMes} />
        </ChartCard>
      </div>

      <ChartCard
        title="Concentração por Dia da Semana × Mês"
        hint="Agregação a partir do campo dia da semana nos registros (dias úteis)."
      >
        <HeatmapDiasChart data={heatmapData} />
      </ChartCard>

      <div className="text-center">
        <Link
          href="/tabelas/atividades"
          className="text-sm text-[var(--color-primary)] hover:underline font-medium"
        >
          Ver tabela completa de atividades →
        </Link>
      </div>
    </div>
  )
}

export default async function DashboardAtividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string }>
}) {
  const { ano } = await searchParams
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)] text-sm">
          Carregando dashboard…
        </div>
      }
    >
      <DashboardAtividadesContent ano={ano} />
    </Suspense>
  )
}
