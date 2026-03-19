'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import PowerBiService, { PowerBiDashboard } from '@/services/models/power-bi'
import { resolvePowerBiImageSrc } from '@/lib/power-bi-image'
import { BarChart3, ExternalLink, Users, Search, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-[var(--color-bg-hover)]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[var(--color-bg-hover)] rounded w-3/4" />
        <div className="h-3 bg-[var(--color-bg-hover)] rounded w-1/2" />
        <div className="h-12 bg-[var(--color-bg-hover)] rounded" />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const emAndamento = status === 'em_andamento'
  return (
    <span
      className={cn(
        'absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md shadow-sm',
        emAndamento
          ? 'bg-amber-500/90 text-amber-950'
          : 'bg-emerald-500/90 text-emerald-950',
      )}
    >
      {emAndamento ? 'Em andamento' : 'Concluído'}
    </span>
  )
}

const PLACEHOLDER_LINK_PREFIX = 'https://em-andamento.local'

function DashboardCard({ d }: { d: PowerBiDashboard }) {
  const [imgFailed, setImgFailed] = useState(false)
  const img = resolvePowerBiImageSrc(d.imagem)
  const emAndamento = d.status === 'em_andamento'
  const isPlaceholder = d.link?.startsWith(PLACEHOLDER_LINK_PREFIX) ?? false
  const showImg = Boolean(img) && !imgFailed && !emAndamento
  const onImgError = useCallback(() => setImgFailed(true), [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPlaceholder) {
        e.preventDefault()
        toast('Dashboard em desenvolvimento', { icon: '🚧' })
      }
    },
    [isPlaceholder],
  )

  const cardClassName = cn(
    'group flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden',
    'transition-all duration-200 hover:border-[var(--color-primary)]/40 hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
    'cursor-pointer',
  )

  const cardContent = (
    <>
      <div className="relative aspect-[16/10] bg-[var(--color-bg-hover)] overflow-hidden">
        <StatusBadge status={d.status} />
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img!}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={onImgError}
          />
        ) : emAndamento ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-500/15 border-b-2 border-amber-500/40">
            <BarChart3 size={52} className="text-amber-500/70 mb-3" />
            <span className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Dashboard em produção
            </span>
            <span className="text-xs text-[var(--color-text-subtle)] mt-1.5 text-center px-4">
              Este dashboard está em desenvolvimento pela CTI
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-text-subtle)]">
            <BarChart3 size={40} className="opacity-40" />
            <span className="text-xs">Miniatura em breve</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
          {isPlaceholder ? (
            <>🚧 Dashboard em desenvolvimento</>
          ) : (
            <>
              <ExternalLink size={14} />
              Abrir no Power BI
            </>
          )}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
          {d.nome}
        </h3>
        {d.autores ? (
          <p className="flex items-start gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Users size={12} className="shrink-0 mt-0.5 opacity-70" />
            <span className="line-clamp-2">{d.autores}</span>
          </p>
        ) : null}
        {d.descricao ? (
          <p className="text-xs text-[var(--color-text-subtle)] leading-relaxed line-clamp-3 flex-1">
            {d.descricao}
          </p>
        ) : (
          <p className="text-xs text-[var(--color-text-subtle)] italic">Sem descrição cadastrada.</p>
        )}
      </div>
    </>
  )

  if (isPlaceholder) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick(e as unknown as React.MouseEvent)
          }
        }}
        className={cardClassName}
      >
        {cardContent}
      </div>
    )
  }

  return (
    <a
      href={d.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
    >
      {cardContent}
    </a>
  )
}

type StatusFilter = 'todos' | 'concluidos' | 'em_andamento'

export default function PowerBiPage() {
  const [items, setItems] = useState<PowerBiDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')

  const fetchDashboards = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const list = await PowerBiService().list()
      setItems(list)
    } catch {
      toast.error('Não foi possível carregar os dashboards Power BI.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboards(true)
  }, [fetchDashboards])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchDashboards(false)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [fetchDashboards])

  const concluidos = items.filter((d) => d.status !== 'em_andamento').length
  const andamento = items.length - concluidos
  const total = items.length

  // Hooks precisam ser chamados de forma incondicional (antes de qualquer return condicional)
  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = items
    if (q) {
      list = items.filter(
        (d) =>
          d.nome.toLowerCase().includes(q) ||
          (d.autores?.toLowerCase().includes(q) ?? false) ||
          (d.descricao?.toLowerCase().includes(q) ?? false),
      )
    }
    if (statusFilter === 'concluidos') {
      list = list.filter((d) => d.status !== 'em_andamento')
    } else if (statusFilter === 'em_andamento') {
      list = list.filter((d) => d.status === 'em_andamento')
    }
    const concluidosList = list
      .filter((d) => d.status !== 'em_andamento')
      .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
    const emAndamentoList = list
      .filter((d) => d.status === 'em_andamento')
      .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
    return [...concluidosList, ...emAndamentoList]
  }, [items, searchQuery, statusFilter])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-[var(--color-text-muted)] max-w-2xl">
          Carregando catálogo de relatórios publicados pela CTI…
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {/* Topo: texto à esquerda, contadores à direita */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <p className="text-sm text-[var(--color-text-muted)] max-w-2xl order-2 sm:order-1">
          Relatórios publicados pela CTI. Clique em um card para abrir o dashboard no Power BI em uma nova aba.
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 shrink-0 order-1 sm:order-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-text)]">{total}</span>
            <span className="text-sm text-[var(--color-text-muted)]">total</span>
          </div>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{concluidos}</span>
            <span className="text-sm text-[var(--color-text-muted)]">concluído(s)</span>
          </div>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{andamento}</span>
            <span className="text-sm text-[var(--color-text-muted)]">em andamento</span>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboards(true)}
            className="p-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
            aria-label="Atualizar lista"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input
            type="text"
            placeholder="Buscar por nome, autores ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-subtle)] transition-colors"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {(
            [
              { value: 'todos' as const, label: 'Todos' },
              { value: 'concluidos' as const, label: 'Concluídos' },
              { value: 'em_andamento' as const, label: 'Em andamento' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                statusFilter === value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 px-4">
          <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-primary)]/10 flex items-center justify-center">
            <BarChart3 size={28} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">Nenhum dashboard cadastrado</h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md">
              Importe a planilha <strong>Links Dashboards.xlsx</strong> em{' '}
              <Link href="/importar" className="text-[var(--color-primary)] hover:underline">
                Importar Dados
              </Link>{' '}
              para publicar a lista de relatórios Power BI da CTI nesta tela.
            </p>
          </div>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-8">
          {searchQuery
            ? `Nenhum dashboard encontrado para "${searchQuery}". Tente outro termo.`
            : statusFilter === 'concluidos'
              ? 'Nenhum dashboard concluído.'
              : statusFilter === 'em_andamento'
                ? 'Nenhum dashboard em andamento.'
                : 'Nenhum dashboard encontrado.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 min-w-0">
          {filteredAndSorted.map((d) => (
            <DashboardCard key={d.id} d={d} />
          ))}
        </div>
      )}
    </div>
  )
}
