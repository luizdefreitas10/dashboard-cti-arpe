'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Database,
  FileSpreadsheet,
  FileText,
  History,
  Layers,
  RefreshCw,
  Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatNumber } from '@/lib/utils'
import { getApiBaseUrl } from '@/lib/api-config'
import { RecentImportLogs } from '@/components/dashboard/recent-import-logs'
import type { DataImportLog } from '@/services/models/import-logs'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UploadState {
  status: UploadStatus
  message?: string
}

interface ImportCardProps {
  label: string
  eyebrow: string
  description: string
  filename: string
  accept: string
  acceptLabel: string
  state: UploadState
  inputRef: React.RefObject<HTMLInputElement | null>
  icon: React.ReactNode
  onFileSelected: (file: File) => void
}

function ImportStatus({ state }: { state: UploadState }) {
  if (state.status === 'idle') {
    return (
      <span className="text-xs text-(--color-text-subtle)">
        Aguardando seleção do arquivo.
      </span>
    )
  }

  const isSuccess = state.status === 'success'
  const isError = state.status === 'error'

  return (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium',
        isSuccess && 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500',
        isError && 'border-red-500/25 bg-red-500/10 text-red-400',
        state.status === 'uploading' && 'border-(--color-border) bg-(--color-bg-hover) text-(--color-text-muted)',
      )}
    >
      {isSuccess ? (
        <CheckCircle size={14} aria-hidden />
      ) : isError ? (
        <AlertCircle size={14} aria-hidden />
      ) : (
        <RefreshCw size={14} className="animate-spin" aria-hidden />
      )}
      <span className="truncate">
        {state.status === 'uploading' ? 'Importando dados...' : state.message}
      </span>
    </div>
  )
}

function SpreadsheetImportCard({
  label,
  eyebrow,
  description,
  filename,
  accept,
  acceptLabel,
  state,
  inputRef,
  icon,
  onFileSelected,
}: ImportCardProps) {
  const isUploading = state.status === 'uploading'

  return (
    <article className="flex min-w-0 flex-col justify-between rounded-lg border border-(--color-border) bg-(--color-bg-card) p-4 transition-colors hover:border-(--color-primary)/30 sm:p-5">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-(--color-primary)/10 text-(--color-primary)">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-text-subtle)">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-base font-semibold text-(--color-text)">{label}</h2>
          <p className="mt-1 text-sm leading-relaxed text-(--color-text-muted) text-pretty">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-(--color-border) bg-(--color-bg)/35 p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-(--color-text-subtle)">
          Arquivo esperado
        </p>
        <p className="mt-1 truncate text-sm font-medium text-(--color-text)" title={filename}>
          {filename}
        </p>
        <p className="mt-1 text-xs text-(--color-text-subtle)">{acceptLabel}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ImportStatus state={state} />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onFileSelected(file)
            event.currentTarget.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-(--color-primary)/25 bg-(--color-primary)/10 px-4 py-2 text-sm font-semibold text-(--color-primary) transition-colors hover:bg-(--color-primary)/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          <Upload size={15} aria-hidden />
          {isUploading ? 'Importando...' : 'Selecionar arquivo'}
        </button>
      </div>
    </article>
  )
}

function ImportHistorySkeleton() {
  return (
    <section className="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-card)">
      <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-3">
        <History size={16} className="text-(--color-primary)" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-(--color-text)">Histórico de importações</p>
          <p className="text-xs text-(--color-text-subtle)">Carregando auditoria dos uploads...</p>
        </div>
      </div>
      <div className="space-y-3 p-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-md bg-(--color-bg-hover)" />
        ))}
      </div>
    </section>
  )
}

export default function ImportarPage() {
  const [atividades, setAtividades] = useState<UploadState>({ status: 'idle' })
  const [bens, setBens] = useState<UploadState>({ status: 'idle' })
  const [powerBi, setPowerBi] = useState<UploadState>({ status: 'idle' })
  const [solucoesDigitais, setSolucoesDigitais] = useState<UploadState>({ status: 'idle' })
  const [contratos, setContratos] = useState<UploadState>({ status: 'idle' })
  const atividadesRef = useRef<HTMLInputElement>(null)
  const bensRef = useRef<HTMLInputElement>(null)
  const powerBiRef = useRef<HTMLInputElement>(null)
  const solucoesDigitaisRef = useRef<HTMLInputElement>(null)
  const contratosRef = useRef<HTMLInputElement>(null)

  const [importLogs, setImportLogs] = useState<DataImportLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const base = getApiBaseUrl()
      const res = await fetch(`${base}/import-logs`, { cache: 'no-store', credentials: 'include' })
      if (!res.ok) throw new Error('fetch')
      const data = await res.json() as { logs?: DataImportLog[] }
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

      const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: 'POST',
        body: form,
        credentials: 'include',
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

  const importCards = [
    {
      label: 'Atividades',
      eyebrow: 'Operação diária',
      description: 'Atualiza os indicadores, dashboards e tabelas de acompanhamento das atividades da CTI.',
      filename: 'atividades_padronizadas.xlsx',
      endpoint: '/upload/atividades',
      state: atividades,
      setState: setAtividades,
      inputRef: atividadesRef,
      accept: '.xlsx,.csv',
      acceptLabel: 'Aceita .xlsx ou .csv',
      icon: <BarChart3 size={21} aria-hidden />,
    },
    {
      label: 'Bens Patrimoniais',
      eyebrow: 'Inventário',
      description: 'Substitui a base de patrimônio, softwares, ramais e celulares usada nos painéis de bens.',
      filename: 'Monitoramento de Bens - CTI.xlsx',
      endpoint: '/upload/bens',
      state: bens,
      setState: setBens,
      inputRef: bensRef,
      accept: '.xlsx,.csv',
      acceptLabel: 'Aceita .xlsx ou .csv',
      icon: <Database size={21} aria-hidden />,
    },
    {
      label: 'Catálogo Power BI',
      eyebrow: 'Links externos',
      description: 'Atualiza nome, link, descrição, autores, status e imagem dos dashboards publicados.',
      filename: 'Links Dashboards.xlsx',
      endpoint: '/upload/power-bi',
      state: powerBi,
      setState: setPowerBi,
      inputRef: powerBiRef,
      accept: '.xlsx,.csv',
      acceptLabel: 'Aceita .xlsx ou .csv',
      icon: <FileSpreadsheet size={21} aria-hidden />,
      onSuccess: () => {
        window.location.href = '/power-bi'
      },
    },
    {
      label: 'Contratos de Telemática',
      eyebrow: 'Financeiro',
      description: 'Atualiza as abas OI, CLARO, SIMPRESS, MÉTODO, VECTRA e 1TELECOM com acompanhamento mensal por competência.',
      filename: 'Contratos Telemática.xlsx',
      endpoint: '/upload/contratos',
      state: contratos,
      setState: setContratos,
      inputRef: contratosRef,
      accept: '.xlsx,.xls',
      acceptLabel: 'Aceita .xlsx ou .xls',
      icon: <FileText size={21} aria-hidden />,
      onSuccess: () => {
        window.location.href = '/contratos'
      },
    },
    {
      label: 'Soluções Digitais',
      eyebrow: 'Portfólio CTI',
      description: 'Atualiza soluções, stack, responsáveis, imagens e links de produção ou GitHub.',
      filename: 'SOLUCOES-DIGITAIS-CTI.xlsx',
      endpoint: '/upload/solucoes-digitais',
      state: solucoesDigitais,
      setState: setSolucoesDigitais,
      inputRef: solucoesDigitaisRef,
      accept: '.xlsx,.csv',
      acceptLabel: 'Aceita .xlsx ou .csv',
      icon: <Layers size={21} aria-hidden />,
      onSuccess: () => {
        window.location.href = '/solucoes-digitais'
      },
    },
  ]

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <section className="grid gap-4 rounded-lg border border-(--color-border) bg-(--color-bg-card) p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">
            Central de importação
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-(--color-text) sm:text-3xl">
            Atualize os dados do dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-(--color-text-muted) text-pretty">
            Envie a planilha correspondente a cada módulo. Cada importação substitui a base anterior,
            registra auditoria e atualiza os indicadores relacionados.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div className="rounded-md border border-(--color-border) bg-(--color-bg)/35 p-3">
            <p className="text-2xl font-bold text-(--color-text) tabular-nums">
              {formatNumber(importCards.length)}
            </p>
            <p className="text-xs text-(--color-text-subtle)">bases disponíveis</p>
          </div>
          <div className="rounded-md border border-(--color-border) bg-(--color-bg)/35 p-3">
            <p className="text-2xl font-bold text-(--color-text) tabular-nums">
              {formatNumber(importLogs.length)}
            </p>
            <p className="text-xs text-(--color-text-subtle)">registros no histórico</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-(--color-text) sm:grid-cols-[auto_minmax(0,1fr)]">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" aria-hidden />
        <div>
          <p className="font-semibold">A importação substitui os dados anteriores do módulo selecionado.</p>
          <p className="mt-1 text-(--color-text-muted)">
            Confira o arquivo antes de enviar. Após concluir, o upload aparece automaticamente no histórico.
          </p>
          <p className="mt-1 text-(--color-text-muted)">
            Não se preocupe, os dados anteriores à importação são mantidos no histórico.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-(--color-text-muted)">
              Escolha o módulo que será atualizado:
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {importCards.map((item) => (
            <SpreadsheetImportCard
              key={item.endpoint}
              label={item.label}
              eyebrow={item.eyebrow}
              description={item.description}
              filename={item.filename}
              accept={item.accept}
              acceptLabel={item.acceptLabel}
              state={item.state}
              inputRef={item.inputRef}
              icon={item.icon}
              onFileSelected={(file) => {
                void handleUpload(file, item.endpoint, item.setState, item.onSuccess)
              }}
            />
          ))}
        </div>
      </section>

      {logsLoading ? (
        <ImportHistorySkeleton />
      ) : (
        <RecentImportLogs
          logs={importLogs}
          title="Histórico de importações"
          description="Registro automático dos uploads concluídos, com responsável, arquivo e volume processado."
          pageSize={8}
          emptyState={
            <section className="rounded-lg border border-(--color-border) bg-(--color-bg-card) p-4">
              <div className="flex items-start gap-3">
                <History size={18} className="mt-0.5 shrink-0 text-(--color-primary)" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-(--color-text)">Histórico de importações</p>
                  <p className="mt-1 text-sm text-(--color-text-muted)">
                    Nenhum registro ainda. Após a primeira importação neste ambiente, o histórico aparecerá aqui.
                  </p>
                </div>
              </div>
            </section>
          }
        />
      )}
    </div>
  )
}
