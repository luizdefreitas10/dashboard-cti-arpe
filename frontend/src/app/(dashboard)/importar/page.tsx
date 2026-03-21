'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'

type ImportLogRow = {
  id: string
  tipo: string
  filename: string | null
  rowsCount: number | null
  message: string | null
  createdAt: string
}

function tipoLabel(tipo: string) {
  const m: Record<string, string> = {
    atividades: 'Atividades',
    bens: 'Bens',
    power_bi: 'Power BI',
    solucoes_digitais: 'Soluções digitais',
  }
  return m[tipo] ?? tipo
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UploadState {
  status: UploadStatus
  message?: string
}

export default function ImportarPage() {
  const [atividades, setAtividades] = useState<UploadState>({ status: 'idle' })
  const [bens, setBens] = useState<UploadState>({ status: 'idle' })
  const [powerBi, setPowerBi] = useState<UploadState>({ status: 'idle' })
  const [solucoesDigitais, setSolucoesDigitais] = useState<UploadState>({ status: 'idle' })
  const atividadesRef = useRef<HTMLInputElement>(null)
  const bensRef = useRef<HTMLInputElement>(null)
  const powerBiRef = useRef<HTMLInputElement>(null)
  const solucoesDigitaisRef = useRef<HTMLInputElement>(null)

  const [importLogs, setImportLogs] = useState<ImportLogRow[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${base}/import-logs`, { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch')
      const data = await res.json()
      setImportLogs(data.logs ?? [])
    } catch {
      setImportLogs([])
    } finally {
      setLogsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleUpload = async (
    file: File,
    endpoint: string,
    setState: (s: UploadState) => void,
    onSuccess?: () => void,
  ) => {
    setState({ status: 'uploading' })
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message ?? 'Erro no upload')
      }

      const data = await res.json()
      setState({ status: 'success', message: data.message ?? 'Importado com sucesso!' })
      toast.success('Importação concluída!')
      void fetchLogs()
      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setState({ status: 'error', message })
      toast.error(message)
    }
  }

  return (
    <div className="max-w-3xl flex flex-col gap-8">
      <p className="text-sm text-[var(--color-text-muted)]">
        Faça upload das planilhas para atualizar os dados do dashboard. Os dados anteriores daquela importação serão substituídos.
      </p>

      {[
        {
          label: 'Planilha de Atividades',
          description: 'Arquivo: atividades_padronizadas.xlsx',
          endpoint: '/upload/atividades',
          state: atividades,
          setState: setAtividades,
          ref: atividadesRef,
          accept: '.xlsx,.csv',
        },
        {
          label: 'Planilha de Bens',
          description: 'Arquivo: Monitoramento de Bens - CTI.xlsx',
          endpoint: '/upload/bens',
          state: bens,
          setState: setBens,
          ref: bensRef,
          accept: '.xlsx,.csv',
        },
        {
          label: 'Catálogo Power BI (links)',
          description:
            'Arquivo: Links Dashboards.xlsx — colunas NOME, LINK, DESCRIÇÃO, AUTORES. Opcionais: STATUS (Concluído / Em andamento), IMAGEM (arquivo em /public/power-bi/ ou URL). Substitui toda a lista.',
          endpoint: '/upload/power-bi',
          state: powerBi,
          setState: setPowerBi,
          ref: powerBiRef,
          accept: '.xlsx,.csv',
          onSuccess: () => {
            window.location.href = '/power-bi'
          },
        },
        {
          label: 'Soluções Digitais',
          description:
            'Arquivo: SOLUCOES-DIGITAIS-CTI.xlsx — colunas TIPO, NOME, DESCRICAO, SETOR, STACK, LINK (GitHub, opcional), IMAGEM (arquivo em /public/solucoes-digitais/ ou URL), RESPONSAVEL, DATA DE INICIO, OBSERVACOES (status + URL de produção quando Concluída - https://...). Substitui toda a lista.',
          endpoint: '/upload/solucoes-digitais',
          state: solucoesDigitais,
          setState: setSolucoesDigitais,
          ref: solucoesDigitaisRef,
          accept: '.xlsx,.csv',
          onSuccess: () => {
            window.location.href = '/solucoes-digitais'
          },
        },
      ].map((item) => (
        <div
          key={item.endpoint}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet size={20} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--color-text)]">{item.label}</p>
              <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">{item.description}</p>

              {item.state.status !== 'idle' && (
                <div className={cn('flex items-center gap-2 mt-3 text-sm', item.state.status === 'success' ? 'text-emerald-400' : item.state.status === 'error' ? 'text-red-400' : 'text-[var(--color-text-muted)]')}>
                  {item.state.status === 'success' ? <CheckCircle size={14} /> : item.state.status === 'error' ? <AlertCircle size={14} /> : <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                  <span>{item.state.status === 'uploading' ? 'Importando dados...' : item.state.message}</span>
                </div>
              )}

              <div className="mt-4">
                <input
                  ref={item.ref}
                  type="file"
                  accept={item.accept}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file, item.endpoint, item.setState, item.onSuccess)
                  }}
                />
                <button
                  onClick={() => item.ref.current?.click()}
                  disabled={item.state.status === 'uploading'}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={14} />
                  {item.state.status === 'uploading' ? 'Importando...' : 'Selecionar arquivo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <section className="border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-card)]">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-2">
          <History size={16} className="text-[var(--color-primary)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Histórico de importações</p>
            <p className="text-xs text-[var(--color-text-subtle)]">Registrado automaticamente após cada upload concluído.</p>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          {logsLoading ? (
            <p className="p-4 text-sm text-[var(--color-text-muted)]">Carregando…</p>
          ) : importLogs.length === 0 ? (
            <p className="p-4 text-sm text-[var(--color-text-muted)]">
              Nenhum registro ainda. Após a primeira importação neste ambiente, o histórico aparecerá aqui.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-bg-card)] z-10">
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-subtle)] uppercase">
                  <th className="px-4 py-2 font-medium">Data</th>
                  <th className="px-4 py-2 font-medium">Tipo</th>
                  <th className="px-4 py-2 font-medium">Arquivo</th>
                  <th className="px-4 py-2 font-medium text-right">Linhas</th>
                </tr>
              </thead>
              <tbody>
                {importLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--color-border)]/70 hover:bg-[var(--color-bg-hover)]/40">
                    <td className="px-4 py-2 text-[var(--color-text-muted)] whitespace-nowrap tabular-nums">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text)]">{tipoLabel(log.tipo)}</td>
                    <td className="px-4 py-2 text-xs text-[var(--color-text-muted)] max-w-[180px] truncate" title={log.filename ?? ''}>
                      {log.filename ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-[var(--color-text-muted)]">{log.rowsCount ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
