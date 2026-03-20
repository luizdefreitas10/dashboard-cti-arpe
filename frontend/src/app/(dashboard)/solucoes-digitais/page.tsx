'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import SolucoesDigitaisService, { SolucaoDigital } from '@/services/models/solucoes-digitais'
import { resolveSolucaoDigitalImageSrc } from '@/lib/solucoes-digitais-image'
import {
  Layers,
  Search,
  X,
  RefreshCw,
  ExternalLink,
  Github,
  Calendar,
  Building2,
  Code2,
  Users,
  ImageOff,
  Globe,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const NA = 'Informação não disponível'

function display(val: string | null | undefined): string {
  const t = val?.trim()
  return t ? t : NA
}

function splitResponsaveis(s: string | null | undefined): string[] {
  if (!s?.trim()) return []
  return s
    .split(/\s+e\s+/i)
    .map((x) => x.trim())
    .filter(Boolean)
}

function splitStack(s: string | null | undefined): string[] {
  if (!s?.trim()) return []
  return s
    .split(/[;,]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

function formatData(iso: string | null | undefined): string {
  if (!iso) return NA
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return NA
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-[var(--color-bg-hover)]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[var(--color-bg-hover)] rounded w-2/3" />
        <div className="h-3 bg-[var(--color-bg-hover)] rounded w-1/2" />
        <div className="h-16 bg-[var(--color-bg-hover)] rounded" />
      </div>
    </div>
  )
}

function SolucaoCard({ item }: { item: SolucaoDigital }) {
  const [imgFailed, setImgFailed] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const imgSrc = resolveSolucaoDigitalImageSrc(item.imagem)
  const showImg = Boolean(imgSrc) && !imgFailed
  const isWeb = item.tipo === 'solucao_web'
  const concluida = item.statusProjeto === 'concluida'
  const emAndamento = item.statusProjeto === 'em_andamento'
  const hasProd = Boolean(item.urlProducao?.trim())
  const hasRepo = Boolean(item.urlRepositorio?.trim())
  const responsaveis = splitResponsaveis(item.responsavel)
  const stacks = splitStack(item.stack)

  const tipoLabel = isWeb ? 'Solução web' : 'Automação'

  const ImageBlock = (
    <div className="relative aspect-[16/10] bg-[var(--color-bg-hover)] overflow-hidden shrink-0">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc!}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-[var(--color-text-muted)]">
          <ImageOff size={40} className="opacity-50" />
          <span className="text-xs font-medium">Imagem indisponível</span>
        </div>
      )}
      <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1.5 justify-end">
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md shadow-sm',
            isWeb ? 'bg-sky-500/90 text-white' : 'bg-violet-500/90 text-white',
          )}
        >
          {tipoLabel}
        </span>
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md shadow-sm',
            concluida ? 'bg-emerald-500/90 text-emerald-950' : 'bg-amber-500/90 text-amber-950',
          )}
        >
          {concluida ? 'Concluída' : 'Em andamento'}
        </span>
      </div>
    </div>
  )

  return (
    <article
      className={cn(
        'flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden',
        'shadow-sm transition-shadow hover:shadow-md',
        hasProd && 'ring-1 ring-[var(--color-primary)]/15',
      )}
    >
      {hasProd ? (
        <a
          href={item.urlProducao!}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          aria-label={`Abrir ${item.nome} em produção`}
        >
          {ImageBlock}
        </a>
      ) : (
        ImageBlock
      )}

      <div className="p-5 flex flex-col gap-5 flex-1 min-w-0">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug">{display(item.nome)}</h3>
          <p
            className={cn(
              'text-xs text-[var(--color-text-muted)] leading-relaxed mt-1.5',
              !descExpanded && 'line-clamp-4',
            )}
          >
            {display(item.descricao)}
          </p>
          {item.descricao && item.descricao.trim().length > 220 && (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="text-[11px] text-[var(--color-primary)] mt-1 hover:underline"
            >
              {descExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>

        <dl className="grid gap-4 text-xs">
          <div className="flex gap-2">
            <dt className="shrink-0 text-[var(--color-text-subtle)] flex items-center gap-1">
              <Building2 size={12} /> Setor
            </dt>
            <dd className="text-[var(--color-text)] min-w-0">{display(item.setor)}</dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-[var(--color-text-subtle)] flex items-center gap-1">
              <Code2 size={12} /> Stack
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {stacks.length ? (
                stacks.map((t, idx) => (
                  <span
                    key={`${t}-${idx}`}
                    className="px-1.5 py-0.5 rounded bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] text-[10px]"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-[var(--color-text-muted)]">{NA}</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-[var(--color-text-subtle)] flex items-center gap-1">
              <Users size={12} /> Responsáveis
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {responsaveis.length ? (
                responsaveis.map((n, idx) => (
                  <span
                    key={`${n}-${idx}`}
                    className="px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text)] text-[10px]"
                  >
                    {n}
                  </span>
                ))
              ) : (
                <span className="text-[var(--color-text-muted)]">{NA}</span>
              )}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-[var(--color-text-subtle)] flex items-center gap-1">
              <Calendar size={12} /> Início
            </dt>
            <dd className="text-[var(--color-text)]">{formatData(item.dataInicio)}</dd>
          </div>
        </dl>

        {item.observacoes?.trim() ? (
          <p className="text-[11px] text-[var(--color-text-subtle)] border-t border-[var(--color-border)] pt-4 mt-1 leading-relaxed">
            <span className="font-semibold text-[var(--color-text-muted)]">Observações: </span>
            {item.observacoes}
          </p>
        ) : null}

        <div className="space-y-5 border-t border-[var(--color-border)] pt-5 mt-auto">
          <div className="flex items-start gap-3">
            <Globe size={14} className="shrink-0 mt-0.5 text-[var(--color-text-subtle)]" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Produção
              </p>
              {hasProd ? (
                <a
                  href={item.urlProducao!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-primary)] hover:underline break-all inline-flex items-center gap-1"
                >
                  {item.urlProducao}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Link de produção não disponível
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Github size={14} className="shrink-0 mt-0.5 text-[var(--color-text-subtle)]" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Repositório
              </p>
              {hasRepo ? (
                <a
                  href={item.urlRepositorio!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-primary)] hover:underline break-all inline-flex items-center gap-1"
                >
                  Abrir repositório
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">Repositório não disponível</p>
              )}
            </div>
          </div>
          {(hasProd || emAndamento) && (
            <div className="pt-6 mt-2">
              {hasProd ? (
                <a
                  href={item.urlProducao!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius-md)] text-sm font-medium bg-[var(--color-primary)] text-white hover:opacity-95 transition-opacity"
                >
                  <ExternalLink size={16} />
                  Abrir em produção
                </a>
              ) : (
                <p className="text-[11px] text-center text-[var(--color-text-muted)] py-3 px-3 rounded-md bg-amber-500/10 border border-amber-500/25">
                  Solução ainda não disponível para uso.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

type FiltroTipo = 'todos' | 'automacao' | 'solucao_web'
type FiltroStatus = 'todos' | 'concluida' | 'em_andamento'

export default function SolucoesDigitaisPage() {
  const [items, setItems] = useState<SolucaoDigital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')

  const fetchList = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const list = await SolucoesDigitaisService().list()
      setItems(list)
    } catch {
      toast.error('Não foi possível carregar as soluções digitais.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList(true)
  }, [fetchList])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') fetchList(false)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [fetchList])

  const stats = useMemo(() => {
    const auto = items.filter((i) => i.tipo === 'automacao').length
    const web = items.filter((i) => i.tipo === 'solucao_web').length
    const conc = items.filter((i) => i.statusProjeto === 'concluida').length
    const and = items.filter((i) => i.statusProjeto === 'em_andamento').length
    return { total: items.length, auto, web, conc, and }
  }, [items])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return items.filter((d) => {
      if (filtroTipo !== 'todos' && d.tipo !== filtroTipo) return false
      if (filtroStatus !== 'todos' && d.statusProjeto !== filtroStatus) return false
      if (!q) return true
      const hay = [
        d.nome,
        d.descricao,
        d.setor,
        d.stack,
        d.responsavel,
        d.observacoes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [items, searchQuery, filtroTipo, filtroStatus])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 min-w-0">
        <p className="text-sm text-[var(--color-text-muted)] max-w-2xl">
          Carregando soluções digitais desenvolvidas pela CTI…
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <p className="text-sm text-[var(--color-text-muted)] max-w-2xl order-2 lg:order-1">
          Automações e soluções web desenvolvidas pela CTI.
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 shrink-0 order-1 lg:order-2 text-sm">
          <span className="font-semibold text-[var(--color-text)]">{stats.total}</span>
          <span className="text-[var(--color-text-muted)]">total</span>
          <span className="w-px h-4 bg-[var(--color-border)] mx-1" />
          <span className="font-semibold text-violet-600 dark:text-violet-400">{stats.auto}</span>
          <span className="text-[var(--color-text-muted)]">automações</span>
          <span className="w-px h-4 bg-[var(--color-border)] mx-1" />
          <span className="font-semibold text-sky-600 dark:text-sky-400">{stats.web}</span>
          <span className="text-[var(--color-text-muted)]">web</span>
          <span className="w-px h-4 bg-[var(--color-border)] mx-1" />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.conc}</span>
          <span className="text-[var(--color-text-muted)]">concl.</span>
          <span className="w-px h-4 bg-[var(--color-border)] mx-1" />
          <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.and}</span>
          <span className="text-[var(--color-text-muted)]">andamento</span>
          <button
            type="button"
            onClick={() => fetchList(true)}
            className="p-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer ml-1"
            aria-label="Atualizar lista"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input
            type="search"
            placeholder="Buscar por nome, descrição, setor, stack, responsáveis…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-subtle)]"
              aria-label="Limpar"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-[var(--color-text-subtle)] self-center mr-1">Tipo:</span>
          {(
            [
              { v: 'todos' as const, l: 'Todos' },
              { v: 'automacao' as const, l: 'Automações' },
              { v: 'solucao_web' as const, l: 'Soluções web' },
            ] as const
          ).map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => setFiltroTipo(v)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                filtroTipo === v
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-[var(--color-text-subtle)] self-center mr-1">Status:</span>
          {(
            [
              { v: 'todos' as const, l: 'Todos' },
              { v: 'concluida' as const, l: 'Concluídas' },
              { v: 'em_andamento' as const, l: 'Em andamento' },
            ] as const
          ).map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => setFiltroStatus(v)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                filtroStatus === v
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-center gap-4 px-4">
          <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Layers size={28} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">Nenhuma solução cadastrada</h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md">
              Importe a planilha <strong>SOLUCOES-DIGITAIS-CTI.xlsx</strong> na seção{' '}
              <strong>Soluções Digitais</strong> em{' '}
              <Link href="/importar" className="text-[var(--color-primary)] hover:underline">
                Importar Dados
              </Link>
              . Coloque as imagens dos cards em{' '}
              <code className="text-xs bg-[var(--color-bg-hover)] px-1 rounded">frontend/public/solucoes-digitais/</code>.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-8">
          Nenhum resultado para os filtros ou busca atuais.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 min-w-0">
          {filtered.map((d) => (
            <SolucaoCard key={d.id} item={d} />
          ))}
        </div>
      )}
    </div>
  )
}
