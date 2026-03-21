import Link from 'next/link'
import { getExecutiveOverview } from './actions'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { AtividadesPorAnoChart } from '@/components/charts/atividades-por-ano'
import { DataFreshnessBanner } from '@/components/dashboard/data-freshness-banner'
import {
  Activity,
  Server,
  Layers,
  ExternalLink,
  AlertTriangle,
  Smartphone,
  Phone,
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'

function tipoImportLabel(tipo: string) {
  const m: Record<string, string> = {
    atividades: 'Atividades',
    bens: 'Bens / inventário',
    power_bi: 'Power BI',
    solucoes_digitais: 'Soluções digitais',
  }
  return m[tipo] ?? tipo
}

export default async function VisaoGeralDashboardPage() {
  const data = await getExecutiveOverview()

  if (data.isError || !data.statsAtividades || !data.statsBens) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[var(--color-text-muted)] text-sm">
          Não foi possível carregar a visão geral. Verifique o backend e tente novamente.
        </p>
      </div>
    )
  }

  const { statsAtividades: a, statsBens: b } = data
  const topSetor = a.porSetor[0]
  const topCat = a.porCategoria[0]
  const criticidade = b.bensComCriticidadeRegistrada ?? 0

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          Visão executiva da <strong className="text-[var(--color-text)]">Coordenadoria de TI</strong>: indicadores
          cruzados de atividades, patrimônio, soluções e importações recentes. Use os atalhos para aprofundar em cada
          módulo.
        </p>
        <div className="mt-4">
          <DataFreshnessBanner dataMinima={a.dataMinimaAtividade} dataMaxima={a.dataMaximaAtividade} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Atividades (total)"
          value={formatNumber(a.total)}
          icon={<Activity size={18} />}
          color="var(--color-primary)"
          subtitle="Base importada"
        />
        <KpiCard
          title="Bens patrimoniais"
          value={formatNumber(b.totalBens)}
          icon={<Server size={18} />}
          color="#8b5cf6"
          subtitle={`${formatNumber(b.totalSoftwares)} softwares`}
        />
        <KpiCard
          title="Soluções digitais"
          value={formatNumber(data.solucoesTotal)}
          icon={<Layers size={18} />}
          color="#10b981"
          subtitle={`${data.solucoesConcluidas} concluídas · ${data.solucoesEmAndamento} em andamento`}
        />
        <KpiCard
          title="Dashboards Power BI"
          value={formatNumber(data.powerBiTotal)}
          icon={<ExternalLink size={18} />}
          color="#f97316"
          subtitle={`${data.powerBiConcluidos} em produção`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Maior demanda (setor)"
          value={topSetor?.setor ?? '—'}
          icon={<Activity size={18} />}
          color="#06b6d4"
          subtitle={topSetor ? `${formatNumber(topSetor.total)} atividades` : ''}
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
        />
        <KpiCard
          title="Ramais (total)"
          value={formatNumber(b.totalRamais)}
          icon={<Phone size={18} />}
          color="#a855f7"
          subtitle="Telefonia por setor"
        />
        <KpiCard
          title="Celulares"
          value={formatNumber(b.totalCelulares)}
          icon={<Smartphone size={18} />}
          color="#14b8a6"
          subtitle="Inventário móvel"
        />
      </div>

      {data.pctWin11 != null ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
          <span className="font-medium text-[var(--color-text)]">Windows 11</span> representa aproximadamente{' '}
          <strong>{data.pctWin11}%</strong> dos bens com Windows 10 ou 11 informados no inventário (exclui registros
          vazios ou &quot;-&quot;).
        </div>
      ) : null}

      {criticidade > 0 ? (
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-500/25 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-[var(--color-text-muted)]">
            <strong className="text-[var(--color-text)]">{criticidade}</strong> bens com campo{' '}
            <em>criticidade</em> preenchido — revise na{' '}
            <Link href="/tabelas/bens" className="text-[var(--color-primary)] hover:underline">
              tabela de bens
            </Link>
            .
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-4">Volume de atividades por ano</p>
          <AtividadesPorAnoChart data={a.porAno ?? []} />
        </div>
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3">
          <p className="text-sm font-semibold text-[var(--color-text)]">Atalhos</p>
          <ul className="flex flex-col gap-2 text-sm">
            {[
              { href: '/dashboard/atividades', label: 'Dashboard de atividades (gráficos detalhados)' },
              { href: '/dashboard/bens', label: 'Dashboard de bens e telefonia' },
              { href: '/tabelas/atividades', label: 'Tabela de atividades' },
              { href: '/tabelas/celulares', label: 'Tabela de celulares' },
              { href: '/importar', label: 'Importar planilhas' },
              { href: '/power-bi', label: 'Catálogo Power BI' },
              { href: '/solucoes-digitais', label: 'Soluções digitais CTI' },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[var(--color-primary)] hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {data.importLogs.length > 0 ? (
        <section className="border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-card)]">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Últimas importações</h2>
            <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">
              Auditoria automática após cada upload bem-sucedido.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
      ) : null}
    </div>
  )
}
