import { Suspense } from 'react'
import { getBensStats } from './actions'
import { KpiCard, KpiCardSkeleton } from '@/components/dashboard/kpi-card'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  BensPorTipoChart,
  BensPorSetorChart,
  SoDistribuicaoChart,
  RamaisPorSetorChart,
  ModeloChart,
} from '@/components/charts/charts-dynamic'
import { Monitor, Cpu, Phone, Smartphone, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 ${className}`}>
      <p className="text-sm font-semibold text-[var(--color-text)] mb-5">{title}</p>
      {children}
    </div>
  )
}

async function DashboardBensContent() {
  const { stats, ramais, isError, error } = await getBensStats()

  if (isError || !stats) {
    return (
      <ErrorState
        message={error ?? 'Erro ao carregar dados.'}
        hint="Verifique se o backend está rodando e tente novamente."
      />
    )
  }

  const totalRamaisDigital = ramais.reduce((s, r) => s + r.digital, 0)
  const totalRamaisAnalogico = ramais.reduce((s, r) => s + r.analogico, 0)
  const criticidade = stats.bensComCriticidadeRegistrada ?? 0

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          title="Bens Patrimoniais"
          value={stats.totalBens}
          icon={<Monitor size={18} />}
          color="var(--color-primary)"
          subtitle="Equipamentos inventariados"
          tooltip="Total de equipamentos no inventário"
          href="/tabelas/bens"
        />
        <KpiCard
          title="Softwares"
          value={stats.totalSoftwares}
          icon={<Cpu size={18} />}
          color="#1e5a8e"
          subtitle="Ativos de software"
          tooltip="Softwares licenciados e inventariados"
          href="/tabelas/softwares"
        />
        <KpiCard
          title="Ramais"
          value={stats.totalRamais}
          icon={<Phone size={18} />}
          color="#10b981"
          subtitle={`${totalRamaisDigital} digitais · ${totalRamaisAnalogico} analógicos`}
          tooltip="Ramais telefônicos por setor"
          href="/tabelas/ramais"
        />
        <KpiCard
          title="Celulares"
          value={stats.totalCelulares}
          icon={<Smartphone size={18} />}
          color="#f97316"
          subtitle="Celulares corporativos"
          tooltip="Inventário de dispositivos móveis"
          href="/tabelas/celulares"
        />
      </div>

      {criticidade > 0 ? (
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-500/25 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-[var(--color-text-muted)]">
            <strong className="text-[var(--color-text)]">{criticidade}</strong> bens com criticidade registrada no
            inventário —{' '}
            <Link href="/tabelas/bens?comCriticidade=true" className="text-[var(--color-primary)] hover:underline font-medium">
              revisar na tabela
            </Link>
            .
          </p>
        </div>
      ) : null}

      {/* Linha 1 — Tipo de hardware + Bens por setor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição por Tipo de Hardware">
          <BensPorTipoChart data={stats.porTipo} />
        </ChartCard>
        <ChartCard title="Bens por Setor (Top 12)" className='flex flex-col justify-center items-center'>
          <BensPorSetorChart data={stats.porSetor} />
        </ChartCard>
      </div>

      {/* Linha 2 — Fabricante + Sistema Operacional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição por Fabricante">
          <ModeloChart data={stats.porModelo} />
        </ChartCard>
        <ChartCard title="Sistema Operacional" className='flex flex-col justify-center items-center'>
          <SoDistribuicaoChart data={stats.porSO} />
        </ChartCard>
      </div>

      {/* Linha 3 — Ramais por setor (largura total) */}
      {ramais.length > 0 && (
        <ChartCard title="Ramais Telefônicos por Setor (Digital vs Analógico)">
          <RamaisPorSetorChart data={ramais} />
        </ChartCard>
      )}
    </div>
  )
}

function BensSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] animate-pulse" />
        <div className="h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] animate-pulse" />
      </div>
    </div>
  )
}

export default function DashboardBensPage() {
  return (
    <Suspense fallback={<BensSkeleton />}>
      <DashboardBensContent />
    </Suspense>
  )
}
