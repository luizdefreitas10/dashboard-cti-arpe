'use client'

import dynamic from 'next/dynamic'

/** Placeholder enquanto o bundle do Recharts carrega no cliente (evita SSR com dimensões -1). */
function ChartSkeleton({ className }: { className: string }) {
  return (
    <div className={`w-full min-w-0 rounded-md bg-[var(--color-bg-hover)] animate-pulse ${className}`} aria-hidden />
  )
}

export const AtividadesPorAnoChart = dynamic(
  () => import('./atividades-por-ano').then((m) => ({ default: m.AtividadesPorAnoChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[260px]" /> },
)

export const AtividadesPorMesChart = dynamic(
  () => import('./atividades-por-mes').then((m) => ({ default: m.AtividadesPorMesChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[280px]" /> },
)

export const DistribuicaoCategoriasChart = dynamic(
  () => import('./distribuicao-categorias').then((m) => ({ default: m.DistribuicaoCategoriasChart })),
  { ssr: false, loading: () => <ChartSkeleton className="min-h-[200px] sm:min-h-[240px]" /> },
)

export const TopSetoresChart = dynamic(
  () => import('./top-setores').then((m) => ({ default: m.TopSetoresChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[300px]" /> },
)

export const ProdutividadeResponsavelChart = dynamic(
  () => import('./produtividade-responsavel').then((m) => ({ default: m.ProdutividadeResponsavelChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[260px]" /> },
)

export const PrioridadePorMesChart = dynamic(
  () => import('./prioridade-por-mes').then((m) => ({ default: m.PrioridadePorMesChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[280px]" /> },
)

export const EvolucaoTemporalChart = dynamic(
  () => import('./evolucao-temporal').then((m) => ({ default: m.EvolucaoTemporalChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[200px]" /> },
)

export const TopNomesAtividadesChart = dynamic(
  () => import('./top-nomes-atividades').then((m) => ({ default: m.TopNomesAtividadesChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[320px]" /> },
)

export const BensPorTipoChart = dynamic(
  () => import('./bens-por-tipo').then((m) => ({ default: m.BensPorTipoChart })),
  { ssr: false, loading: () => <ChartSkeleton className="min-h-[200px] sm:min-h-[240px]" /> },
)

export const BensPorSetorChart = dynamic(
  () => import('./bens-por-setor').then((m) => ({ default: m.BensPorSetorChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[300px]" /> },
)

export const SoDistribuicaoChart = dynamic(
  () => import('./so-distribuicao').then((m) => ({ default: m.SoDistribuicaoChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[200px]" /> },
)

export const RamaisPorSetorChart = dynamic(
  () => import('./ramais-por-setor').then((m) => ({ default: m.RamaisPorSetorChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[280px] sm:h-[300px]" /> },
)

export const ModeloChart = dynamic(
  () => import('./modelo-chart').then((m) => ({ default: m.ModeloChart })),
  { ssr: false, loading: () => <ChartSkeleton className="min-h-[200px] sm:min-h-[220px]" /> },
)
