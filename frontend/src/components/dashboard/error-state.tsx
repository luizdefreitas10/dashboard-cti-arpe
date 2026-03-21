import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  hint?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Não foi possível carregar',
  message,
  hint = 'Verifique se o backend está rodando e tente novamente.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center min-h-[40vh] ${className}`}
      role="alert"
    >
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md [overflow-wrap:anywhere] text-pretty">
        {message}
      </p>
      {hint && (
        <p className="text-[11px] text-[var(--color-text-subtle)] mt-2 max-w-sm [overflow-wrap:anywhere]">
          {hint}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/30 transition-colors cursor-pointer"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
