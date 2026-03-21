'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { History, X } from 'lucide-react'
import BensService, { BemHistoricoItem } from '@/services/models/bens'
import { formatDate } from '@/lib/utils'

const OPERACAO_LABEL: Record<string, string> = {
  criado: 'Criado',
  alterado: 'Alterado',
  removido: 'Removido',
}

const CAMPO_LABEL: Record<string, string> = {
  tipoHardware: 'Tipo',
  modelo: 'Modelo',
  usuario: 'Usuário',
  setor: 'Setor',
  finalidadePrincipal: 'Finalidade',
  sistemaOperacional: 'Sistema Operacional',
  criticidade: 'Criticidade',
}

interface HistoricoDialogProps {
  tombamento: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoricoDialog({ tombamento, open, onOpenChange }: HistoricoDialogProps) {
  const [historico, setHistorico] = useState<BemHistoricoItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !tombamento) return
    setLoading(true)
    BensService()
      .getHistorico(tombamento)
      .then((r) => setHistorico(r.historico ?? []))
      .catch(() => setHistorico([]))
      .finally(() => setLoading(false))
  }, [open, tombamento])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(90vw,480px)] max-h-[85vh] flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-lg focus:outline-none"
          aria-describedby="historico-description"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <History size={18} className="text-[var(--color-primary)]" />
              <Dialog.Title className="text-sm font-semibold text-[var(--color-text)]">
                Histórico — {tombamento}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          <div id="historico-description" className="flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <p className="text-sm text-[var(--color-text-muted)]">Carregando…</p>
            ) : historico.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                Nenhum registro de histórico para este bem. O histórico é preenchido automaticamente a cada importação da planilha de bens.
              </p>
            ) : (
              <ul className="space-y-3">
                {historico.map((h) => (
                  <li
                    key={h.id}
                    className="text-sm border-l-2 border-[var(--color-border)] pl-3 py-1"
                  >
                    <span
                      className={`
                        inline-block px-1.5 py-0.5 rounded text-xs font-medium mb-1
                        ${h.operacao === 'criado' ? 'bg-emerald-500/15 text-emerald-400' : ''}
                        ${h.operacao === 'alterado' ? 'bg-amber-500/15 text-amber-400' : ''}
                        ${h.operacao === 'removido' ? 'bg-red-500/15 text-red-400' : ''}
                      `}
                    >
                      {OPERACAO_LABEL[h.operacao] ?? h.operacao}
                    </span>
                    {h.campo && (
                      <p className="text-[var(--color-text-muted)]">
                        {CAMPO_LABEL[h.campo] ?? h.campo}:{' '}
                        <span className="text-red-400/90 line-through">{h.valorAnterior ?? '—'}</span>
                        {' → '}
                        <span className="text-emerald-400/90">{h.valorNovo ?? '—'}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">
                      {formatDate(h.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
