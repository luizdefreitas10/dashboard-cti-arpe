'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-lg">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            {canBootstrap ? <ShieldCheck size={22} aria-hidden /> : <LockKeyhole size={22} aria-hidden />}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
              Dashboard CTI
            </p>
            <h1 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
              {canBootstrap ? 'Criar administrador inicial' : 'Entrar no sistema'}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {canBootstrap
                ? 'Configure o primeiro agente administrador para iniciar a gestão segura do sistema.'
                : 'Use suas credenciais da Coordenadoria de TI para acessar as ações do sistema.'}
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
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
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
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
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
                minLength={canBootstrap ? 10 : 1}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                required
              />
              {canBootstrap && (
                <p className="text-xs text-[var(--color-text-subtle)]">
                  Use pelo menos 10 caracteres.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
              {submitting ? 'Processando...' : canBootstrap ? 'Criar administrador' : 'Entrar'}
            </button>
          </form>
        )}
      </div>

      <Toaster position="bottom-right" />
    </main>
  )
}
