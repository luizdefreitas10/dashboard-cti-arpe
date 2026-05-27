import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10 text-[var(--color-text)]">
      <section className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <WifiOff size={22} aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Você está offline</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Não foi possível carregar esta página agora. Verifique sua conexão e tente acessar o Dashboard CTI novamente.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Voltar para o dashboard
        </Link>
      </section>
    </main>
  )
}
