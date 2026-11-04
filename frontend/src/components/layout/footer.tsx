"use client";

import Image from "next/image";
import { MapPin, Phone, Cpu, ExternalLink } from "lucide-react";

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
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit rounded-[var(--radius-md)] bg-white px-3 py-2 shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-border)]">
              <Image
                src="/arpe-logo-footer.webp"
                alt="ARPE — Agência de Regulação de Pernambuco"
                width={800}
                height={220}
                className="h-12 w-auto object-contain"
                sizes="220px"
              />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
              Agência de Regulação de Serviços Públicos Delegados de Pernambuco · Governo de Pernambuco
            </p>
          </div>

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

          <div className="arpe-circuit flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--arpe-night)] p-4 text-white/85">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/10 text-[var(--arpe-yellow)]">
                <Cpu size={18} aria-hidden />
              </span>
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
