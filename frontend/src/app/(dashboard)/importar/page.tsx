'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UploadState {
  status: UploadStatus
  message?: string
}

export default function ImportarPage() {
  const [atividades, setAtividades] = useState<UploadState>({ status: 'idle' })
  const [bens, setBens] = useState<UploadState>({ status: 'idle' })
  const atividadesRef = useRef<HTMLInputElement>(null)
  const bensRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (
    file: File,
    endpoint: string,
    setState: (s: UploadState) => void,
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setState({ status: 'error', message })
      toast.error(message)
    }
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <p className="text-sm text-[var(--color-text-muted)]">
        Faça upload das planilhas para atualizar os dados do dashboard. Os dados anteriores serão substituídos.
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
                    if (file) handleUpload(file, item.endpoint, item.setState)
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
    </div>
  )
}
