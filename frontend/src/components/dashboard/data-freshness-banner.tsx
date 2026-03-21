import { formatDate } from '@/lib/utils'

interface Props {
  dataMinima?: string | null
  dataMaxima?: string | null
  filtroAno?: string | null
  className?: string
}

/** Contexto temporal dos dados (intervalo no banco + filtro ativo). */
export function DataFreshnessBanner({ dataMinima, dataMaxima, filtroAno, className = '' }: Props) {
  const hasRange = Boolean(dataMinima && dataMaxima)

  return (
    <div
      role="status"
      className={`text-xs text-[var(--color-text-subtle)] border border-[var(--color-border)]/80 rounded-[var(--radius-md)] px-3 py-2 bg-[var(--color-bg-card)]/60 [overflow-wrap:anywhere] text-pretty leading-relaxed ${className}`}
    >
      {filtroAno ? (
        <span>
          Exibindo apenas <strong className="text-[var(--color-text-muted)]">{filtroAno}</strong>.{' '}
        </span>
      ) : null}
      {hasRange ? (
        <span>
          Registros com data entre <time dateTime={dataMinima!}>{formatDate(dataMinima!)}</time> e{' '}
          <time dateTime={dataMaxima!}>{formatDate(dataMaxima!)}</time> (base completa).
        </span>
      ) : (
        <span>Não há intervalo de datas disponível nos dados importados.</span>
      )}
    </div>
  )
}
