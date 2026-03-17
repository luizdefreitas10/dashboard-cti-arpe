'use client'

import { useEffect, useState } from 'react'
import BensService, { Software } from '@/services/models/bens'
import { exportToCSV } from '@/lib/export-csv'
import { Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatNumber } from '@/lib/utils'

export default function TabelaSoftwaresPage() {
  const [data, setData] = useState<Software[]>([])
  const [filtered, setFiltered] = useState<Software[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { getSoftwares } = BensService()
        const result = await getSoftwares()
        setData(result.softwares)
        setFiltered(result.softwares)
      } catch {
        toast.error('Erro ao carregar softwares')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!busca) { setFiltered(data); return }
    const b = busca.toLowerCase()
    setFiltered(data.filter((s) => s.nome.toLowerCase().includes(b) || (s.finalidade ?? '').toLowerCase().includes(b)))
  }, [busca, data])

  const handleExport = () => {
    exportToCSV('softwares-cti', filtered.map((s) => ({ Nome: s.nome, Versão: s.versao ?? '', Finalidade: s.finalidade ?? '' })))
    toast.success('Exportado!')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input type="text" placeholder="Buscar software..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">{formatNumber(filtered.length)} softwares</span>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors"><Download size={14} /> CSV</button>
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {['Nome do Software', 'Versão', 'Finalidade'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--color-border)] animate-pulse">
                {[1,2,3].map((j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[var(--color-bg-hover)] rounded w-32" /></td>)}
              </tr>
            )) : filtered.map((s) => (
              <tr key={s.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors">
                <td className="px-4 py-3 font-medium text-[var(--color-text)]">{s.nome}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-xs">{s.versao ?? '—'}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{s.finalidade ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
