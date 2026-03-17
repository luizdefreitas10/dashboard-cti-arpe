'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getPaginationRowModel } from '@tanstack/react-table'
import AtividadesService, { Atividade, AtividadeFilters } from '@/services/models/atividades'
import { formatDate, cn, formatNumber } from '@/lib/utils'
import { exportToCSV } from '@/lib/export-csv'
import { Search, Download, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const PRIORITY_COLORS: Record<string, string> = {
  Alta: 'bg-red-500/15 text-red-400',
  Média: 'bg-amber-500/15 text-amber-400',
  Baixa: 'bg-emerald-500/15 text-emerald-400',
}

const columns: ColumnDef<Atividade>[] = [
  { accessorKey: 'categoria', header: 'Categoria', cell: ({ getValue }) => <span className="text-xs text-[var(--color-text-muted)]">{String(getValue() ?? '—')}</span> },
  { accessorKey: 'nome', header: 'Atividade', cell: ({ getValue }) => <span className="font-medium">{String(getValue() ?? '—')}</span> },
  { accessorKey: 'data', header: 'Data', cell: ({ getValue }) => <span className="tabular-nums">{formatDate(getValue() as string)}</span> },
  { accessorKey: 'diaSemana', header: 'Dia', cell: ({ getValue }) => String(getValue() ?? '—') },
  { accessorKey: 'responsavel', header: 'Responsável', cell: ({ getValue }) => String(getValue() ?? '—') },
  { accessorKey: 'setor', header: 'Setor', cell: ({ getValue }) => String(getValue() ?? '—') },
  {
    accessorKey: 'prioridade',
    header: 'Prioridade',
    cell: ({ getValue }) => {
      const v = String(getValue() ?? '')
      return <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PRIORITY_COLORS[v] ?? 'bg-[var(--color-border)] text-[var(--color-text-muted)]')}>{v || '—'}</span>
    },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ getValue }) => {
      const v = String(getValue() ?? '—')
      return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">{v}</span>
    },
  },
  { accessorKey: 'observacao', header: 'Observação', cell: ({ getValue }) => <span className="text-[var(--color-text-subtle)] text-xs truncate max-w-[140px] inline-block" title={String(getValue() ?? '')}>{String(getValue() ?? '—')}</span> },
]

function TabelaAtividadesContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [data, setData] = useState<Atividade[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 25)
  const busca = searchParams.get('busca') ?? ''
  const categoria = searchParams.get('categoria') ?? ''
  const responsavel = searchParams.get('responsavel') ?? ''
  const setor = searchParams.get('setor') ?? ''
  const prioridade = searchParams.get('prioridade') ?? ''
  const dataInicio = searchParams.get('dataInicio') ?? ''
  const dataFim = searchParams.get('dataFim') ?? ''

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  const clearFilters = () => {
    router.push(pathname)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const filters: AtividadeFilters = { page, size }
      if (busca) filters.busca = busca
      if (categoria) filters.categoria = categoria
      if (responsavel) filters.responsavel = responsavel
      if (setor) filters.setor = setor
      if (prioridade) filters.prioridade = prioridade
      if (dataInicio) filters.dataInicio = dataInicio
      if (dataFim) filters.dataFim = dataFim

      const { findMany } = AtividadesService()
      const result = await findMany(filters)
      setData(result.atividades)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      toast.error('Erro ao carregar atividades')
    } finally {
      setLoading(false)
    }
  }, [page, size, busca, categoria, responsavel, setor, prioridade, dataInicio, dataFim])

  useEffect(() => { fetchData() }, [fetchData])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), manualPagination: true, pageCount: totalPages })

  const hasFilters = busca || categoria || responsavel || setor || prioridade || dataInicio || dataFim

  const handleExport = async () => {
    toast.loading('Exportando...', { id: 'export' })
    try {
      const { findMany } = AtividadesService()
      const all = await findMany({ page: 1, size: 9999, busca, categoria, responsavel, setor, prioridade })
      const rows = all.atividades.map((a) => ({
        Categoria: a.categoria,
        Atividade: a.nome,
        Data: formatDate(a.data),
        'Dia da Semana': a.diaSemana ?? '',
        Responsável: a.responsavel ?? '',
        Setor: a.setor ?? '',
        Prioridade: a.prioridade ?? '',
        Estado: a.estado ?? '',
        Observação: a.observacao ?? '',
      }))
      exportToCSV('atividades-cti', rows)
      toast.success('Exportado com sucesso!', { id: 'export' })
    } catch {
      toast.error('Erro ao exportar', { id: 'export' })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de ações */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input
            type="text"
            placeholder="Buscar atividade, solicitante..."
            value={busca}
            onChange={(e) => setParam('busca', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border transition-colors cursor-pointer',
            showFilters
              ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          )}
        >
          <Filter size={14} />
          Filtros
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-alta)] cursor-pointer transition-colors">
            <X size={14} /> Limpar
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">{formatNumber(total)} registros</span>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Categoria', key: 'categoria', val: categoria, options: ['Suporte Técnico e Helpdesk', 'Instalação e Configuração de Software/Hardware', 'Suporte Administrativo', 'Administração de Rede e Servidor', 'Administração de Usuários e Acessos', 'Suporte de Telemática (Telefonia)', 'Suporte de Telemática', 'Desenvolvimento de Software'] },
            { label: 'Prioridade', key: 'prioridade', val: prioridade, options: ['Alta', 'Média', 'Baixa'] },
          ].map(({ label, key, val, options }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-subtle)]">{label}</label>
              <select
                value={val}
                onChange={(e) => setParam(key, e.target.value)}
                className="px-2 py-1.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="">Todos</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {[
            { label: 'Responsável', key: 'responsavel', val: responsavel },
            { label: 'Setor', key: 'setor', val: setor },
          ].map(({ label, key, val }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-subtle)]">{label}</label>
              <input
                type="text"
                placeholder={`Filtrar ${label.toLowerCase()}...`}
                value={val}
                onChange={(e) => setParam(key, e.target.value)}
                className="px-2 py-1.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-subtle)]">Data início</label>
            <input type="date" value={dataInicio} onChange={(e) => setParam('dataInicio', e.target.value)} className="px-2 py-1.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-subtle)]">Data fim</label>
            <input type="date" value={dataFim} onChange={(e) => setParam('dataFim', e.target.value)} className="px-2 py-1.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer" />
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-[var(--color-border)]">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] animate-pulse">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[var(--color-bg-hover)] rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-[var(--color-text-muted)]">
                    Nenhuma atividade encontrada
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-[var(--color-text)] whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span>Registros por página:</span>
            <select
              value={size}
              onChange={(e) => setParam('size', e.target.value)}
              className="px-2 py-1 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--color-text)] focus:outline-none cursor-pointer"
            >
              {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <span>Página {page} de {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setParam('page', String(page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setParam('page', String(page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabelaAtividadesFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-12 bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] animate-pulse" />
      <div className="h-96 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] animate-pulse" />
    </div>
  )
}

export default function TabelaAtividadesPage() {
  return (
    <Suspense fallback={<TabelaAtividadesFallback />}>
      <TabelaAtividadesContent />
    </Suspense>
  )
}
