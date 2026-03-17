'use client'

import { MapPin, Phone, Building2, Cpu, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-bg-sidebar) mt-auto w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Conteúdo superior: padding-bottom garante espaço acima do divider (não depende de margin) */}
        <div className="pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {/* ARPE - Identidade */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-(--color-primary)" />
              <span className="font-semibold text-(--color-text)">ARPE</span>
            </div>
            <p className="text-sm text-(--color-text-muted) leading-relaxed">
              Agência de Regulação de Serviços Públicos Delegados de Pernambuco
            </p>
            <p className="text-xs text-(--color-text-subtle)">Governo de Pernambuco</p>
          </div>

          {/* Contatos */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-(--color-text)">Contatos</p>
            <ul className="space-y-2 text-sm text-(--color-text-muted)">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-(--color-primary) shrink-0" />
                <span>Central de Serviços: 0800 281 3844</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-(--color-primary) shrink-0" />
                <span>Energia Elétrica: 0800 727 0167</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-(--color-primary) shrink-0" />
                <span>PABX: (81) 3182-9700</span>
              </li>
            </ul>
          </div>

          {/* Endereço */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-(--color-text)">Endereço</p>
            <div className="flex gap-2 text-sm text-(--color-text-muted)">
              <MapPin size={14} className="text-(--color-primary) shrink-0 mt-0.5" />
              <div>
                <p>Avenida Conselheiro Rosa e Silva, 975</p>
                <p>Aflitos, Recife/PE</p>
                <p>CEP 52.050-020</p>
                <p className="mt-2 text-xs text-(--color-text-subtle)">
                  Estacionamento: Rua do Futuro, 150, Aflitos, Recife/PE
                </p>
              </div>
            </div>
          </div>

          {/* CTI - Destaque */}
          <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded-md bg-(--color-primary)/10 border border-(--color-primary)/20">
              <Cpu size={20} className="text-(--color-primary)" />
              <span className="font-semibold text-(--color-text)">Coordenadoria de Tecnologia da Informação</span>
            </div>
            <p className="text-sm text-(--color-text-muted) mt-2">
              Dashboard de atividades e monitoramento de bens da CTI — Agência de Regulação de Pernambuco.
            </p>
          </div>
          </div>
        </div>

        {/* Divider: linha separa conteúdo de cima (espaço vem do pb-12 do bloco acima) */}
        <div className="pt-8 pb-2 border-t border-(--color-border) flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <p className="text-xs text-(--color-text-subtle) min-w-0">
            © {new Date().getFullYear()} ARPE — Agência de Regulação de Pernambuco. Todos os direitos reservados.
          </p>
          <a
            href="https://www.arpe.pe.gov.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-(--color-primary) hover:underline"
          >
            <span>Visitar site da ARPE</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
