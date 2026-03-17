import { getBensStats } from './actions'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { BensPorTipoChart } from '@/components/charts/bens-por-tipo'
import { BensPorSetorChart } from '@/components/charts/bens-por-setor'
import { SoDistribuicaoChart } from '@/components/charts/so-distribuicao'
import { RamaisPorSetorChart } from '@/components/charts/ramais-por-setor'
import { ModeloChart } from '@/components/charts/modelo-chart'
import { Monitor, Cpu, Phone, Smartphone } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 ${className}`}>
      <p className="text-sm font-semibold text-[var(--color-text)] mb-5">{title}</p>
      {children}
    </div>
  )
}

export default async function DashboardBensPage() {
  const { stats, ramais, isError } = await getBensStats()

  if (isError || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-muted)]">Erro ao carregar dados. Verifique se o backend está rodando.</p>
      </div>
    )
  }

  const totalRamaisDigital = ramais.reduce((s, r) => s + r.digital, 0)
  const totalRamaisAnalogico = ramais.reduce((s, r) => s + r.analogico, 0)

  return (
    <div className="flex flex-col gap-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          title="Bens Patrimoniais"
          value={stats.totalBens}
          icon={<Monitor size={18} />}
          color="var(--color-primary)"
          subtitle="Equipamentos inventariados"
        />
        <KpiCard
          title="Softwares"
          value={stats.totalSoftwares}
          icon={<Cpu size={18} />}
          color="#8b5cf6"
          subtitle="Ativos de software"
        />
        <KpiCard
          title="Ramais"
          value={stats.totalRamais}
          icon={<Phone size={18} />}
          color="#10b981"
          subtitle={`${totalRamaisDigital} digitais · ${totalRamaisAnalogico} analógicos`}
        />
        <KpiCard
          title="Celulares"
          value={stats.totalCelulares}
          icon={<Smartphone size={18} />}
          color="#f97316"
          subtitle="Celulares corporativos"
        />
      </div>

      {/* Linha 1 — Tipo de hardware + Bens por setor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição por Tipo de Hardware">
          <BensPorTipoChart data={stats.porTipo} />
        </ChartCard>
        <ChartCard title="Bens por Setor (Top 12)">
          <BensPorSetorChart data={stats.porSetor} />
        </ChartCard>
      </div>

      {/* Linha 2 — Fabricante + Sistema Operacional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição por Fabricante">
          <ModeloChart data={stats.porModelo} />
        </ChartCard>
        <ChartCard title="Sistema Operacional">
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
