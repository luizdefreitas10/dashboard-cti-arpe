import { ExternalLink, BarChart3 } from 'lucide-react'

export default function PowerBiPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-primary)]/10 flex items-center justify-center">
        <BarChart3 size={32} className="text-[var(--color-primary)]" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">Power BI — Em breve</h2>
        <p className="text-[var(--color-text-muted)] max-w-md text-sm leading-relaxed">
          Os links para os dashboards do Power BI produzidos pela CTI serão disponibilizados aqui em breve.
          Esta seção está reservada para integração futura.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm text-[var(--color-text-subtle)]">
        <ExternalLink size={14} />
        <span>Links externos serão adicionados aqui</span>
      </div>
    </div>
  )
}
