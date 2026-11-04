"use client";

import { MapPin, Phone, ExternalLink } from "lucide-react";
import { CtiSymbol, JointSignature } from "@/components/brand/cti-brand";

const CONTACTS = [
  { label: "Central de Serviços", value: "0800 281 3844" },
  { label: "Energia Elétrica", value: "0800 727 0167" },
  { label: "PABX", value: "(81) 3182-9700" },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-[var(--color-border)] bg-[var(--color-bg-sidebar)]">
      <div className="arpe-tricolor rounded-none" aria-hidden />
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-[var(--color-border)] pb-8 lg:flex-row lg:items-center lg:justify-between">
          <JointSignature size="sm" />
          <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)] lg:text-right">
            Agência de Regulação de Serviços Públicos Delegados de Pernambuco · Governo de Pernambuco
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-3">
            <p className="font-display text-sm font-bold text-[var(--color-text)]">Contatos</p>
            <ul className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
              {CONTACTS.map((contact) => (
                <li key={contact.label} className="flex items-start gap-2">
                  <Phone size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
                  <span>
                    {contact.label}: <span className="tabular-nums text-[var(--color-text)]">{contact.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-display text-sm font-bold text-[var(--color-text)]">Endereço</p>
            <div className="flex gap-2 text-sm text-[var(--color-text-muted)]">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
              <div>
                <p>Av. Conselheiro Rosa e Silva, 975</p>
                <p>Aflitos, Recife/PE · CEP 52.050-020</p>
                <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                  Estacionamento: Rua do Futuro, 150, Aflitos
                </p>
              </div>
            </div>
          </div>

          <div className="arpe-trilhas flex flex-col gap-3 rounded-[var(--radius-lg)] md:col-span-2 xl:col-span-1 bg-[var(--arpe-night)] p-4 text-white/85 ring-1 ring-white/5">
            <div className="flex items-center gap-3">
              <CtiSymbol size={36} decorative />
              <span className="font-display text-sm font-bold leading-snug text-white">
                Coordenadoria de Tecnologia da Informação
              </span>
            </div>
            <p className="text-xs leading-relaxed text-white/75">
              Painel de atividades, patrimônio, contratos e soluções digitais da CTI.
            </p>
            <a
              href="https://www.arpe.pe.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline"
            >
              Visitar site da ARPE
              <ExternalLink size={14} aria-hidden />
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-text-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ARPE — Agência de Regulação de Pernambuco. Todos os direitos reservados.</p>
          <p>Dashboard CTI · v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
