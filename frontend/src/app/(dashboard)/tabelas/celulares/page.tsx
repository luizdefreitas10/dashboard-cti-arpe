'use client'

import { useEffect, useState, useCallback } from 'react'
import BensService, { Celular } from '@/services/models/bens'
import { exportToCSV } from '@/lib/export-csv'
import { Download, Smartphone, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

/** Exibe IMEI mascarado (privacidade em telas compartilhadas). */
function maskImei(imei: string) {
  const t = imei.trim()
  if (t.length <= 4) return '••••'
  return `${'•'.repeat(Math.min(t.length - 4, 12))}${t.slice(-4)}`
}

export default function TabelaCelularesPage() {
  const [data, setData] = useState<Celular[]>([])
  const [loading, setLoading] = useState(true)
  const [reveal, setReveal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { getCelulares } = BensService()
      const result = await getCelulares()
      setData(result.celulares)
    } catch {
      toast.error('Erro ao carregar celulares')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleExport = () => {
    exportToCSV(
      'celulares-cti',
      data.map((c) => ({
        Modelo: c.modelo,
        Setor: c.setor,
        IMEI: reveal ? c.imei : maskImei(c.imei),
      })),
    )
    toast.success('Exportado!')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <Smartphone size={14} className="text-[var(--color-primary)]" />
            Total: <strong className="text-[var(--color-text)]">{data.length}</strong>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-subtle)]">
            <Shield size={12} />
            IMEI mascarado por padrão
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="text-xs px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
          >
            {reveal ? 'Ocultar IMEI' : 'Mostrar IMEI completo'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {['Modelo', 'Setor', 'IMEI'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] animate-pulse">
                    {[1, 2, 3].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[var(--color-bg-hover)] rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">{c.modelo}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.setor}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-subtle)] tabular-nums">
                      {reveal ? c.imei : maskImei(c.imei)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
