"use client";

import Image from "next/image";
import { MapPin, Phone, Building2, Cpu, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-sidebar)] mt-auto w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Conteúdo superior: padding-bottom garante espaço acima do divider (não depende de margin) */}
        <div className="pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {/* ARPE - Identidade */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-[var(--color-primary)]" />
                <span className="font-semibold text-[var(--color-text)]">
                  ARPE
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Agência de Regulação de Serviços Públicos Delegados de
                Pernambuco
              </p>
              <p className="text-xs text-[var(--color-text-subtle)]">
                Governo de Pernambuco
              </p>
            </div>

            {/* Contatos */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Contatos
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex items-center gap-2">
                  <Phone
                    size={14}
                    className="text-[var(--color-primary)] shrink-0"
                  />
                  <span>Central de Serviços: 0800 281 3844</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone
                    size={14}
                    className="text-[var(--color-primary)] shrink-0"
                  />
                  <span>Energia Elétrica: 0800 727 0167</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone
                    size={14}
                    className="text-[var(--color-primary)] shrink-0"
                  />
                  <span>PABX: (81) 3182-9700</span>
                </li>
              </ul>
            </div>

            {/* Endereço */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Endereço
              </p>
              <div className="flex gap-2 text-sm text-[var(--color-text-muted)]">
                <MapPin
                  size={14}
                  className="text-[var(--color-primary)] shrink-0 mt-0.5"
                />
                <div>
                  <p>Avenida Conselheiro Rosa e Silva, 975</p>
                  <p>Aflitos, Recife/PE</p>
                  <p>CEP 52.050-020</p>
                  <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                    Estacionamento: Rua do Futuro, 150, Aflitos, Recife/PE
                  </p>
                </div>
              </div>
            </div>

            {/* CTI - Destaque */}
            <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 rounded-md bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                <Cpu size={20} className="text-[var(--color-primary)]" />
                <span className="font-semibold text-[var(--color-text)]">
                  Coordenadoria de Tecnologia da Informação
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">
                Dashboard de atividades e monitoramento de bens da CTI — Agência
                de Regulação de Pernambuco.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé inferior: © à esquerda | logo ao centro | link à direita (empilha no mobile) */}
        <div className="pt-8 pb-2 border-t border-[var(--color-border)] w-full">
          <div className="grid w-full max-w-7xl mx-auto grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-8 lg:gap-6 items-center">
            {/* Esquerda: copyright */}
            <div className="flex justify-center lg:justify-start items-center order-2 lg:order-none min-w-0">
              <p className="text-xs text-[var(--color-text-subtle)] leading-relaxed text-center lg:text-left max-w-md lg:max-w-none">
                © {new Date().getFullYear()} ARPE — Agência de Regulação de
                Pernambuco. Todos os direitos reservados.
              </p>
            </div>

            {/* Centro: logo */}
            <div className="flex justify-center items-center order-1 lg:order-none px-2">
              <Image
                src="/arpe-logo-footer.webp"
                alt="ARPE — Agência de Regulação de Pernambuco"
                width={800}
                height={220}
                className="h-24 sm:h-28 md:h-32 lg:h-36 w-auto max-w-[min(560px,92vw)] object-contain object-center opacity-95"
                sizes="(max-width: 1024px) 92vw, 560px"
              />
            </div>

            {/* Direita: link */}
            <div className="flex justify-center lg:justify-end items-center order-3 lg:order-none">
              <a
                href="https://www.arpe.pe.gov.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
              >
                <span>Visitar site da ARPE</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
