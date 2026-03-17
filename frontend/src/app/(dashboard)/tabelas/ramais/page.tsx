'use client'

import { useEffect, useState } from 'react'
import BensService, { Ramal } from '@/services/models/bens'
import { exportToCSV } from '@/lib/export-csv'
import { Download, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TabelaRamaisPage() {
  const [data, setData] = useState<Ramal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { getRamais } = BensService()
        const result = await getRamais()
        setData(result.ramais)
      } catch {
        toast.error('Erro ao carregar ramais')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleExport = () => {
    exportToCSV('ramais-cti', data.map((r) => ({ Setor: r.setor, Digital: r.digital, Analógico: r.analogico, Total: r.total, Descrição: r.descricao ?? '' })))
    toast.success('Exportado!')
  }

  const totalDigital = data.reduce((s, r) => s + r.digital, 0)
  const totalAnalogico = data.reduce((s, r) => s + r.analogico, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5"><Phone size={14} className="text-[var(--color-primary)]" /> Digital: <strong className="text-[var(--color-text)]">{totalDigital}</strong></span>
          <span>Analógico: <strong className="text-[var(--color-text)]">{totalAnalogico}</strong></span>
          <span>Total: <strong className="text-[var(--color-text)]">{totalDigital + totalAnalogico}</strong></span>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors"><Download size={14} /> CSV</button>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {['Setor', 'Digital', 'Analógico', 'Total', 'Ramais / Descrição'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--color-border)] animate-pulse">
                {[1,2,3,4,5].map((j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[var(--color-bg-hover)] rounded w-20" /></td>)}
              </tr>
            )) : data.map((r) => (
              <tr key={r.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors">
                <td className="px-4 py-3 font-medium text-[var(--color-text)]">{r.setor}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium">{r.digital}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-medium">{r.analogico}</span>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-[var(--color-text)]">{r.total}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs max-w-xs truncate">{r.descricao ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
