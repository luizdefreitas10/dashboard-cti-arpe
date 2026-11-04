'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { ThemeSwitch } from '@/components/layout/theme-switch'
import AuthService from '@/services/models/auth'

function extractMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'Não foi possível concluir a operação.'
}

export default function LoginPage() {
  const authService = useMemo(() => AuthService(), [])
  const { user, loading, login, bootstrapAdmin } = useAuth()
  const router = useRouter()
  const [checkingBootstrap, setCheckingBootstrap] = useState(true)
  const [canBootstrap, setCanBootstrap] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, router, user])

  useEffect(() => {
    authService
      .bootstrapStatus()
      .then((status) => setCanBootstrap(status.canBootstrap))
      .catch(() => setCanBootstrap(false))
      .finally(() => setCheckingBootstrap(false))
  }, [authService])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    try {
      if (canBootstrap) {
        await bootstrapAdmin(form)
        toast.success('Administrador criado com sucesso.')
      } else {
        await login({ email: form.email, password: form.password })
        toast.success('Login realizado com sucesso.')
      }
      router.replace('/dashboard')
    } catch (error) {
      toast.error(extractMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-input)] px-3 text-sm text-[var(--color-text)] transition-colors placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-[var(--color-primary)]/15'

  return (
    <main className="grid min-h-dvh bg-[var(--color-bg)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section
        className="arpe-circuit relative hidden flex-col justify-between overflow-hidden bg-[var(--arpe-night)] p-10 text-white lg:flex xl:p-14"
        aria-label="Identificação institucional"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(30,58,95,0.9),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(230,2,29,0.14),transparent_40%)]"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-[12px] bg-white shadow-[var(--shadow-md)]">
            <Image src="/arpe-drawer-logo.svg" alt="" width={36} height={22} className="h-auto w-9" priority />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight">Dashboard CTI</p>
            <p className="text-xs text-white/70">Coordenadoria de Tecnologia da Informação · ARPE</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <div className="arpe-tricolor mb-6 w-24" aria-hidden />
          <h2 className="font-display text-4xl font-extrabold leading-[1.1] xl:text-5xl">
            Tecnologia a serviço da regulação de Pernambuco.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/75">
            Atividades, patrimônio, contratos e soluções digitais da CTI reunidos em um só painel.
          </p>
        </div>

        <p className="relative text-xs text-white/55">
          Agência de Regulação de Serviços Públicos Delegados de Pernambuco · Governo de Pernambuco
        </p>
      </section>

      <section className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeSwitch />
        </div>
        <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
          <span className="flex size-12 items-center justify-center rounded-[12px] bg-white shadow-[var(--shadow-md)] ring-1 ring-[var(--color-border)]">
            <Image src="/arpe-drawer-logo.svg" alt="" width={36} height={22} className="h-auto w-9" priority />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-[var(--color-text)]">Dashboard CTI</p>
            <p className="text-xs text-[var(--color-text-subtle)]">Coordenadoria de TI · ARPE</p>
          </div>
        </div>

        <div className="arpe-surface arpe-accent-top w-full max-w-md p-6 shadow-[var(--shadow-lg)] sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              {canBootstrap ? <ShieldCheck size={22} aria-hidden /> : <LockKeyhole size={22} aria-hidden />}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[var(--color-text)]">
                {canBootstrap ? 'Criar administrador inicial' : 'Entrar no sistema'}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {canBootstrap
                  ? 'Configure o primeiro agente administrador para iniciar a gestão segura do sistema.'
                  : 'Use suas credenciais da Coordenadoria de TI para acessar o painel.'}
              </p>
            </div>
          </div>

          {checkingBootstrap ? (
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-text-muted)]">
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Verificando configuração inicial...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {canBootstrap && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-[var(--color-text)]">
                    Nome
                  </label>
                  <input
                    id="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nome@arpe.pe.gov.br"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-[var(--color-text)]">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={canBootstrap ? 'new-password' : 'current-password'}
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  minLength={canBootstrap ? 8 : 1}
                  className={inputClass}
                  required
                />
                {canBootstrap && (
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    Use pelo menos 8 caracteres.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
                {submitting ? 'Processando...' : canBootstrap ? 'Criar administrador' : 'Entrar'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-text-subtle)]">
          © {new Date().getFullYear()} ARPE — Agência de Regulação de Pernambuco
        </p>
      </section>

      <Toaster position="bottom-right" />
    </main>
  )
}
