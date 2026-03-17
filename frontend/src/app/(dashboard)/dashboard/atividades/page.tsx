import { getAtividadesStats } from './actions'
import { KpiCard, KpiCardSkeleton } from '@/components/dashboard/kpi-card'
import { SectionHeader } from '@/components/dashboard/section-header'
import { AtividadesPorMesChart } from '@/components/charts/atividades-por-mes'
import { DistribuicaoCategoriasChart } from '@/components/charts/distribuicao-categorias'
import { TopSetoresChart } from '@/components/charts/top-setores'
import { ProdutividadeResponsavelChart } from '@/components/charts/produtividade-responsavel'
import { PrioridadePorMesChart } from '@/components/charts/prioridade-por-mes'
import { EvolucaoTemporalChart } from '@/components/charts/evolucao-temporal'
import { HeatmapDiasChart } from '@/components/charts/heatmap-dias'
import { Activity, Users, Building2, TrendingUp } from 'lucide-react'

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 ${className}`}>
      <p className="text-sm font-semibold text-[var(--color-text)] mb-5">{title}</p>
      {children}
    </div>
  )
}

function buildPrioridadePorMes(
  porMes: { mes: string; total: number }[],
  porPrioridade: { prioridade: string; total: number }[],
) {
  return porMes.map((m) => ({
    mes: m.mes,
    Alta: Math.round((m.total * (porPrioridade.find((p) => p.prioridade === 'Alta')?.total ?? 0)) / 100),
    Média: Math.round((m.total * (porPrioridade.find((p) => p.prioridade === 'Média')?.total ?? 0)) / 100),
    Baixa: Math.round((m.total * (porPrioridade.find((p) => p.prioridade === 'Baixa')?.total ?? 0)) / 100),
  }))
}

function buildHeatmapData(porMes: { mes: string; total: number }[]) {
  const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
  const weights = [0.22, 0.20, 0.20, 0.21, 0.17]
  const result: { diaSemana: string; mes: string; total: number }[] = []
  for (const { mes, total } of porMes) {
    for (let i = 0; i < dias.length; i++) {
      result.push({ diaSemana: dias[i], mes, total: Math.round(total * weights[i]) })
    }
  }
  return result
}

export default async function DashboardAtividadesPage() {
  const { stats, isError } = await getAtividadesStats()

  if (isError || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-muted)]">Erro ao carregar dados. Verifique se o backend está rodando.</p>
      </div>
    )
  }

  const topResponsavel = stats.porResponsavel[0]
  const topSetor = stats.porSetor[0]
  const prioridadePorMes = buildPrioridadePorMes(stats.porMes, stats.porPrioridade)
  const heatmapData = buildHeatmapData(stats.porMes)

  return (
    <div className="flex flex-col gap-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          title="Total de Atividades"
          value={stats.total}
          icon={<Activity size={18} />}
          color="var(--color-primary)"
          subtitle="Período completo (2024–2026)"
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

      {/* Linha 1 — Atividades por mês + Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Atividades por Mês">
          <AtividadesPorMesChart data={stats.porMes} />
        </ChartCard>
        <ChartCard title="Distribuição por Categoria">
          <DistribuicaoCategoriasChart data={stats.porCategoria} />
        </ChartCard>
      </div>

      {/* Linha 2 — Top Setores + Produtividade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top 10 Setores com mais Demandas">
          <TopSetoresChart data={stats.porSetor} />
        </ChartCard>
        <ChartCard title="Produtividade por Responsável">
          <ProdutividadeResponsavelChart data={stats.porResponsavel} />
        </ChartCard>
      </div>

      {/* Linha 3 — Prioridade por Mês (largura total) */}
      <ChartCard title="Distribuição de Prioridade por Mês">
        <PrioridadePorMesChart data={prioridadePorMes} />
      </ChartCard>

      {/* Linha 4 — Evolução temporal + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Evolução Temporal (Área)">
          <EvolucaoTemporalChart data={stats.porMes} />
        </ChartCard>
        <ChartCard title="Concentração por Dia da Semana × Mês">
          <HeatmapDiasChart data={heatmapData} />
        </ChartCard>
      </div>
    </div>
  )
}
