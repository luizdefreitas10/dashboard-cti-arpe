'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Save, ShieldCheck, UserPlus } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { cn, formatDate } from '@/lib/utils'
import UsersService, { SystemUser } from '@/services/models/users'
import type { UserRole } from '@/services/models/auth'

function extractMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'Não foi possível concluir a operação.'
}

const emptyCreateForm = {
  name: '',
  email: '',
  password: '',
  role: 'agent' as UserRole,
  active: true,
}

export default function UsuariosPage() {
  const usersService = useMemo(() => UsersService(), [])
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [editing, setEditing] = useState<Record<string, SystemUser>>({})
  const [passwords, setPasswords] = useState<Record<string, string>>({})

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await usersService.list()
      setUsers(response)
      setEditing(Object.fromEntries(response.map((item) => [item.id, item])))
    } catch (error) {
      toast.error(extractMessage(error))
    } finally {
      setLoading(false)
    }
  }, [usersService])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await usersService.create(createForm)
      toast.success('Usuário criado com sucesso.')
      setCreateForm(emptyCreateForm)
      await fetchUsers()
    } catch (error) {
      toast.error(extractMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    const next = editing[id]
    if (!next) return

    setSaving(true)
    try {
      await usersService.update(id, {
        name: next.name,
        email: next.email,
        role: next.role,
        active: next.active,
      })
      toast.success('Usuário atualizado com sucesso.')
      await fetchUsers()
    } catch (error) {
      toast.error(extractMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleResetPassword(id: string) {
    const password = passwords[id]?.trim()
    if (!password) {
      toast.error('Informe a nova senha.')
      return
    }

    setSaving(true)
    try {
      await usersService.resetPassword(id, password)
      setPasswords((current) => ({ ...current, [id]: '' }))
      toast.success('Senha redefinida com sucesso.')
    } catch (error) {
      toast.error(extractMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 text-sm text-[var(--color-text-muted)]">
        Apenas administradores podem acessar a gestão de usuários.
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <UserPlus size={20} aria-hidden />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Novo agente</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--color-text)]">Cadastrar usuário da CTI</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Usuários cadastrados podem operar agenda e importações. Administradores também gerenciam contas.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={createForm.name}
            onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nome"
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
            required
          />
          <input
            type="email"
            value={createForm.email}
            onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="E-mail"
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
            required
          />
          <input
            type="password"
            value={createForm.password}
            onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Senha inicial"
            minLength={10}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
            required
          />
          <select
            value={createForm.role}
            onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value as UserRole }))}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="agent">Agente</option>
            <option value="admin">Administrador</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <UserPlus size={16} aria-hidden />}
            Criar
          </button>
        </form>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[var(--color-primary)]" aria-hidden />
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Usuários cadastrados</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Carregando usuários...
          </div>
        ) : (
          <div className="grid gap-3">
            {users.map((item) => {
              const draft = editing[item.id] ?? item
              return (
                <article
                  key={item.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/25 p-4"
                >
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_160px_140px_auto]">
                    <input
                      value={draft.name}
                      onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...draft, name: event.target.value } }))}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                    />
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...draft, email: event.target.value } }))}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                    />
                    <select
                      value={draft.role}
                      onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...draft, role: event.target.value as UserRole } }))}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                    >
                      <option value="agent">Agente</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <label className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                      <input
                        type="checkbox"
                        checked={draft.active}
                        onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...draft, active: event.target.checked } }))}
                      />
                      Ativo
                    </label>
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id)}
                      disabled={saving}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      <Save size={15} aria-hidden />
                      Salvar
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-subtle)] sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Último login: {item.lastLoginAt ? formatDate(item.lastLoginAt) : '—'}
                    </span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="password"
                        value={passwords[item.id] ?? ''}
                        onChange={(event) => setPasswords((current) => ({ ...current, [item.id]: event.target.value }))}
                        placeholder="Nova senha"
                        minLength={10}
                        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPassword(item.id)}
                        disabled={saving || !(passwords[item.id]?.trim())}
                        className={cn(
                          'inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                          'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                      >
                        Redefinir senha
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
