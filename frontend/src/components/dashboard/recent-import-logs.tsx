'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DataImportLog } from '@/services/models/import-logs'
import { formatDate, formatNumber } from '@/lib/utils'

const PAGE_SIZE = 5

function tipoImportLabel(tipo: string) {
  const labels: Record<string, string> = {
    atividades: 'Atividades',
    bens: 'Bens / inventário',
    power_bi: 'Power BI',
    solucoes_digitais: 'Soluções digitais',
    contratos: 'Contratos (telemática)',
  }
  return labels[tipo] ?? tipo
}

function PaginationButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-(--color-border) bg-(--color-bg-card) text-(--color-text-muted) transition-colors hover:bg-(--color-bg-hover) hover:text-(--color-text) disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
    >
      {children}
    </button>
  )
}

interface RecentImportLogsProps {
  logs: DataImportLog[]
  title?: string
  description?: string
  pageSize?: number
  emptyState?: React.ReactNode
}

export function RecentImportLogs({
  logs,
  title = 'Últimas importações',
  description = 'Auditoria automática após cada upload bem-sucedido.',
  pageSize = PAGE_SIZE,
  emptyState,
}: RecentImportLogsProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, logs.length)

  const visibleLogs = useMemo(
    () => logs.slice(startIndex, endIndex),
    [endIndex, logs, startIndex],
  )

  const goToPreviousPage = () => setPage((current) => Math.max(1, current - 1))
  const goToNextPage = () => setPage((current) => Math.min(totalPages, current + 1))

  if (logs.length === 0) {
    if (emptyState) return <>{emptyState}</>

    return (
      <section className="min-w-0">
        <p className="text-xs text-(--color-text-subtle)">
          Nenhuma importação registrada. Use a página{' '}
          <Link href="/importar" className="text-(--color-primary) hover:underline">
            Importar Dados
          </Link>{' '}
          para enviar planilhas.
        </p>
      </section>
    )
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-card)">
      <div className="flex flex-col gap-2 border-b border-(--color-border) px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4">
        <div>
          <h2 className="text-sm font-semibold text-(--color-text)">{title}</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-(--color-text-subtle) wrap-anywhere">
            {description}
          </p>
        </div>
        <p className="shrink-0 text-xs text-(--color-text-subtle) tabular-nums">
          {formatNumber(logs.length)} registros
        </p>
      </div>

      <div aria-live="polite">
        <ul className="divide-y divide-(--color-border) sm:hidden">
          {visibleLogs.map((log) => (
            <li key={log.id} className="space-y-1.5 px-3 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <time
                  className="text-xs text-(--color-text-muted) tabular-nums"
                  dateTime={log.createdAt}
                >
                  {formatDate(log.createdAt)}
                </time>
                <span className="text-xs font-medium tabular-nums text-(--color-text-subtle)">
                  {log.rowsCount != null ? formatNumber(log.rowsCount) : '—'} linhas
                </span>
              </div>
              <p className="text-sm font-medium text-(--color-text)">{tipoImportLabel(log.tipo)}</p>
              <p
                className="break-all text-xs text-(--color-text-muted) wrap-anywhere"
                title={log.filename ?? ''}
              >
                {log.filename ?? '—'}
              </p>
              <p className="text-xs text-(--color-text-subtle)">
                Responsável: {log.actorName ?? '—'}
              </p>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-left text-xs uppercase text-(--color-text-subtle)">
                <th className="px-4 py-2 font-medium">Quando</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Arquivo</th>
                <th className="px-4 py-2 font-medium">Responsável</th>
                <th className="px-4 py-2 text-right font-medium">Linhas</th>
              </tr>
            </thead>
            <tbody>
              {visibleLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-(--color-border)/80 hover:bg-(--color-bg-hover)/50"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-(--color-text-muted) tabular-nums">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 text-(--color-text)">{tipoImportLabel(log.tipo)}</td>
                  <td
                    className="max-w-[200px] truncate px-4 py-2.5 text-xs text-(--color-text-muted)"
                    title={log.filename ?? ''}
                  >
                    {log.filename ?? '—'}
                  </td>
                  <td
                    className="max-w-[160px] truncate px-4 py-2.5 text-xs text-(--color-text-muted)"
                    title={log.actorEmail ?? ''}
                  >
                    {log.actorName ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-(--color-text-muted) tabular-nums">
                    {log.rowsCount != null ? formatNumber(log.rowsCount) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-(--color-border) px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-xs text-(--color-text-subtle) tabular-nums">
          Mostrando {formatNumber(startIndex + 1)}-{formatNumber(endIndex)} de{' '}
          {formatNumber(logs.length)}
        </p>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <PaginationButton
            label="Ver importações anteriores"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            <ChevronLeft size={16} aria-hidden />
          </PaginationButton>
          <span className="text-xs font-medium text-(--color-text-muted) tabular-nums">
            Página {formatNumber(currentPage)} de {formatNumber(totalPages)}
          </span>
          <PaginationButton
            label="Ver importações mais antigas"
            disabled={currentPage === totalPages}
            onClick={goToNextPage}
          >
            <ChevronRight size={16} aria-hidden />
          </PaginationButton>
        </div>
      </div>
    </section>
  )
}
