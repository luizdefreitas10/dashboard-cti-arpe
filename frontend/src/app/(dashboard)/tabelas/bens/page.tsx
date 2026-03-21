'use client'

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getPaginationRowModel } from '@tanstack/react-table'
import BensService, { Bem, BemFilters } from '@/services/models/bens'
import { cn, formatNumber } from '@/lib/utils'
import { exportToCSV } from '@/lib/export-csv'
import { Search, Download, ChevronLeft, ChevronRight, X, Filter, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { HistoricoDialog } from '@/components/bens/historico-dialog'

function makeColumns(onHistorico: (tombamento: string) => void): ColumnDef<Bem>[] {
  return [
    { accessorKey: 'tombamento', header: 'Tombamento', cell: ({ getValue }) => <span className="font-mono text-xs text-[var(--color-text-muted)]">{String(getValue())}</span> },
    { accessorKey: 'tipoHardware', header: 'Tipo', cell: ({ getValue }) => <span className="font-medium">{String(getValue() ?? '—')}</span> },
    { accessorKey: 'modelo', header: 'Modelo', cell: ({ getValue }) => String(getValue() ?? '—') },
    { accessorKey: 'usuario', header: 'Usuário', cell: ({ getValue }) => String(getValue() ?? '—') },
    { accessorKey: 'setor', header: 'Setor', cell: ({ getValue }) => String(getValue() ?? '—') },
    { accessorKey: 'finalidadePrincipal', header: 'Finalidade', cell: ({ getValue }) => <span className="text-[var(--color-text-muted)]">{String(getValue() ?? '—')}</span> },
    {
      accessorKey: 'sistemaOperacional',
      header: 'Sistema Operacional',
      cell: ({ getValue }) => {
        const v = String(getValue() ?? '—')
        const color = v.includes('11') ? 'bg-emerald-500/15 text-emerald-400' : v.includes('10') ? 'bg-amber-500/15 text-amber-400' : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
        return <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', color)}>{v}</span>
      },
    },
    {
      accessorKey: 'criticidade',
      header: 'Criticidade',
      cell: ({ getValue }) => {
        const v = String(getValue() ?? '—')
        return <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', v === 'QUEIMOU' ? 'bg-red-500/15 text-red-400' : 'bg-[var(--color-border)] text-[var(--color-text-subtle)]')}>{v}</span>
      },
    },
    {
      id: 'acoes',
      header: '',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onHistorico(row.original.tombamento)}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
          title="Ver histórico de alterações"
        >
          <History size={14} /> Histórico
        </button>
      ),
    },
  ]
}

function TabelaBensContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const service = useMemo(() => BensService(), [])

  const [data, setData] = useState<Bem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [historicoTombamento, setHistoricoTombamento] = useState<string | null>(null)
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openHistorico = useCallback((tombamento: string) => {
    setHistoricoTombamento(tombamento)
    setHistoricoOpen(true)
  }, [])

  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 25)
  const busca = searchParams.get('busca') ?? ''
  const tipoHardware = searchParams.get('tipoHardware') ?? ''
  const setor = searchParams.get('setor') ?? ''
  const modelo = searchParams.get('modelo') ?? ''
  const sistemaOperacional = searchParams.get('sistemaOperacional') ?? ''
  const criticidade = searchParams.get('criticidade') ?? ''
  const comCriticidade = searchParams.get('comCriticidade') === 'true' || searchParams.get('comCriticidade') === '1'

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key !== 'page') params.set('page', '1')
    router.replace(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  const setParamDebounced = useCallback((key: string, value: string, delay = 350) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setParam(key, value)
    }, delay)
  }, [setParam])

  const hasFilters = busca || tipoHardware || setor || modelo || sistemaOperacional || criticidade || comCriticidade

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const filters: BemFilters = { page, size }
      if (busca) filters.busca = busca
      if (tipoHardware) filters.tipoHardware = tipoHardware
      if (setor) filters.setor = setor
      if (modelo) filters.modelo = modelo
      if (sistemaOperacional) filters.sistemaOperacional = sistemaOperacional
      if (criticidade) filters.criticidade = criticidade
      if (comCriticidade) filters.comCriticidade = true

      const result = await service.findMany(filters)
      setData(result.bens)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      toast.error('Erro ao carregar bens')
    } finally {
      setLoading(false)
      if (isInitialLoading) setIsInitialLoading(false)
    }
  }, [page, size, busca, tipoHardware, setor, modelo, sistemaOperacional, criticidade, comCriticidade, service, isInitialLoading])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setSearchInput(busca) }, [busca])
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const columns = useMemo(() => makeColumns(openHistorico), [openHistorico])
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), manualPagination: true, pageCount: totalPages })

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    toast.loading('Exportando...', { id: 'export' })
    try {
      const exportPageSize = 100
      const baseFilters: BemFilters = {}
      if (busca) baseFilters.busca = busca
      if (tipoHardware) baseFilters.tipoHardware = tipoHardware
      if (setor) baseFilters.setor = setor
      if (modelo) baseFilters.modelo = modelo
      if (sistemaOperacional) baseFilters.sistemaOperacional = sistemaOperacional
      if (criticidade) baseFilters.criticidade = criticidade
      if (comCriticidade) baseFilters.comCriticidade = true

      const firstPage = await service.findMany({ ...baseFilters, page: 1, size: exportPageSize })
      const totalToExport = firstPage.total
      const pages = Math.max(1, Math.ceil(totalToExport / exportPageSize))

      let allBens = [...firstPage.bens]
      if (pages > 1) {
        const pageRequests = Array.from({ length: pages - 1 }, (_, idx) =>
          service.findMany({ ...baseFilters, page: idx + 2, size: exportPageSize }),
        )
        const responses = await Promise.all(pageRequests)
        allBens = allBens.concat(...responses.flatMap((r) => r.bens))
      }

      const rows = allBens.map((b) => ({
        Tombamento: b.tombamento, Tipo: b.tipoHardware ?? '', Modelo: b.modelo ?? '',
        Usuário: b.usuario ?? '', Setor: b.setor ?? '', Finalidade: b.finalidadePrincipal ?? '',
        'Sistema Operacional': b.sistemaOperacional ?? '', Criticidade: b.criticidade ?? '',
      }))
      if (!rows.length) {
        toast('Nenhum registro para exportar', { id: 'export' })
        return
      }
      exportToCSV('bens-cti', rows)
      toast.success('Exportado!', { id: 'export' })
    } catch {
      toast.error('Erro ao exportar', { id: 'export' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      {historicoTombamento && (
        <HistoricoDialog
          tombamento={historicoTombamento}
          open={historicoOpen}
          onOpenChange={setHistoricoOpen}
        />
      )}
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input type="text" placeholder="Buscar tombamento, usuário..." value={searchInput} onChange={(e) => { setSearchInput(e.target.value); setParamDebounced('busca', e.target.value) }} className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]" />
        </div>
        <button onClick={() => setShowFilters((v) => !v)} className={cn('flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border transition-colors cursor-pointer', showFilters ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}>
          <Filter size={14} /> Filtros {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />}
        </button>
        {hasFilters && <button onClick={() => router.push(pathname)} className="flex items-center gap-1 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer transition-colors"><X size={14} /> Limpar</button>}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">{formatNumber(total)} registros</span>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"><Download size={14} /> {exporting ? 'Exportando...' : 'CSV'}</button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[
            { label: 'Tipo de Hardware', key: 'tipoHardware', val: tipoHardware, options: ['Monitor', 'Computador Desktop', 'Microcomputador', 'Notebook', 'Notebook Novo', 'Notebook Antigo', 'Switch', 'Tablet', 'Câmera'] },
            { label: 'Sistema Operacional', key: 'sistemaOperacional', val: sistemaOperacional, options: ['Windows 10 Pro', 'Windows 11'] },
          ].map(({ label, key, val, options }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-subtle)]">{label}</label>
              <select value={val} onChange={(e) => setParam(key, e.target.value)} className="px-2 py-1.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer">
                <option value="">Todos</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {[{ label: 'Setor', key: 'setor', val: setor }, { label: 'Modelo', key: 'modelo', val: modelo }].map(({ label, key, val }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-subtle)]">{label}</label>
              <input type="text" placeholder={`Filtrar ${label.toLowerCase()}...`} value={val} onChange={(e) => setParam(key, e.target.value)} className="px-2 py-1.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]" />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-subtle)]">Criticidade</label>
            <select
              value={comCriticidade ? 'com' : ''}
              onChange={(e) => {
                const v = e.target.value
                const params = new URLSearchParams(searchParams.toString())
                if (v === 'com') params.set('comCriticidade', 'true')
                else params.delete('comCriticidade')
                params.set('page', '1')
                router.replace(`${pathname}?${params.toString()}`)
              }}
              className="px-2 py-1.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="com">Com criticidade registrada</option>
            </select>
            <p className="text-[10px] text-[var(--color-text-subtle)] leading-snug">
              Igual ao alerta da visão geral (exclui vazio e &quot;-&quot;).
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-subtle)]">Texto em criticidade</label>
            <input
              type="text"
              placeholder="Ex.: QUEIMOU, contém…"
              value={criticidade}
              onChange={(e) => setParam('criticidade', e.target.value)}
              className="px-2 py-1.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-[var(--color-border)]">
                  {hg.headers.map((h) => <th key={h.id} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider whitespace-nowrap">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}
                </tr>
              ))}
            </thead>
            <tbody>
              {isInitialLoading && loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] animate-pulse">
                  {columns.map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[var(--color-bg-hover)] rounded w-20" /></td>)}
                </tr>
              )) : data.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-[var(--color-text-muted)]">Nenhum bem encontrado</td></tr>
              ) : table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors">
                  {row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3 text-[var(--color-text)] whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isInitialLoading && loading && (
          <div className="px-4 py-2 text-xs text-[var(--color-text-subtle)] border-t border-[var(--color-border)]">
            Atualizando resultados...
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span>Por página:</span>
            <select value={size} onChange={(e) => setParam('size', e.target.value)} className="px-2 py-1 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--color-text)] focus:outline-none cursor-pointer">
              {[10, 25, 50].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <span>Página {page} de {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setParam('page', String(page - 1))} disabled={page <= 1} className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"><ChevronLeft size={14} /></button>
              <button onClick={() => setParam('page', String(page + 1))} disabled={page >= totalPages} className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

function TabelaBensFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-12 bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] animate-pulse" />
      <div className="h-96 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] animate-pulse" />
    </div>
  )
}

export default function TabelaBensPage() {
  return (
    <Suspense fallback={<TabelaBensFallback />}>
      <TabelaBensContent />
    </Suspense>
  )
}
