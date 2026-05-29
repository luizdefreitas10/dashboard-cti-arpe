'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import toast from 'react-hot-toast'
import {
  Bold,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Italic,
  Loader2,
  MapPin,
  Maximize2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { EmptyState } from '@/components/dashboard/empty-state'
import { cn, formatNumber } from '@/lib/utils'
import AgendaService, {
  AgendaReuniao,
  AgendaReuniaoFilters,
  CreateAgendaReuniaoInput,
  UpdateAgendaReuniaoInput,
} from '@/services/models/agenda'

const DEFAULT_PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 350

function toDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDaysToDateInput(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return toDateInputValue(date)
}

function dateKey(value: string) {
  return value.includes('T') ? value.split('T')[0] : value
}

function formatAgendaDate(value: string) {
  const [year, month, day] = dateKey(value).split('-').map(Number)
  if (!year || !month || !day) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatAgendaWeekday(value: string) {
  const [year, month, day] = dateKey(value).split('-').map(Number)
  if (!year || !month || !day) return ''
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(year, month - 1, day))
}

function isTodayMeeting(reuniao: AgendaReuniao, today = toDateInputValue()) {
  return dateKey(reuniao.data) === today
}

function todayMeetingsHeading(count: number) {
  if (count === 0) return 'Nenhuma reunião hoje'
  if (count === 1) return '1 reunião hoje'
  return `${count} reuniões hoje`
}

function upcomingMeetingsHeading(count: number) {
  if (count === 0) return 'Nenhuma reunião futura cadastrada'
  if (count === 1) return '1 próxima reunião'
  return `${count} próximas reuniões`
}

function extractErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'Não foi possível concluir a operação.'
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let index = 0

  while (index < text.length) {
    if (text.startsWith('**', index)) {
      const end = text.indexOf('**', index + 2)
      if (end > index + 2) {
        nodes.push(
          <strong key={`${keyPrefix}-${index}`} className="font-semibold text-[var(--color-text)]">
            {text.slice(index + 2, end)}
          </strong>,
        )
        index = end + 2
        continue
      }
    }

    if (text[index] === '*' && text[index + 1] !== '*') {
      const end = text.indexOf('*', index + 1)
      if (end > index + 1) {
        nodes.push(
          <em key={`${keyPrefix}-${index}`} className="italic text-[var(--color-text)]">
            {text.slice(index + 1, end)}
          </em>,
        )
        index = end + 1
        continue
      }
    }

    const nextBold = text.indexOf('**', index + 1)
    const nextItalic = text.indexOf('*', index + 1)
    const candidates = [nextBold, nextItalic].filter((position) => position > index)
    const nextMarker = candidates.length ? Math.min(...candidates) : text.length
    nodes.push(text.slice(index, nextMarker))
    index = nextMarker
  }

  return nodes
}

function AgendaFormattedText({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const lines = value.split(/\r?\n/)

  return (
    <div className={cn('whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-muted)] wrap-anywhere', className)}>
      {lines.map((line, lineIndex) => (
        <Fragment key={`${lineIndex}-${line}`}>
          {renderInlineMarkdown(line, `line-${lineIndex}`)}
          {lineIndex < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </div>
  )
}

function DescriptionPautaEditor({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  const [expandedOpen, setExpandedOpen] = useState(false)
  const compactTextareaRef = useRef<HTMLTextAreaElement>(null)
  const expandedTextareaRef = useRef<HTMLTextAreaElement>(null)
  const helperId = `${id}-helper`
  const previewId = `${id}-preview`

  function applyFormat(marker: '**' | '*', fallback: string, textarea: HTMLTextAreaElement | null) {
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end)
    const replacementText = selectedText || fallback
    const nextValue = `${value.slice(0, start)}${marker}${replacementText}${marker}${value.slice(end)}`
    const selectionStart = start + marker.length
    const selectionEnd = selectionStart + replacementText.length

    onChange(nextValue)
    window.requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  function renderToolbar(textareaRef: RefObject<HTMLTextAreaElement | null>, expanded = false) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => applyFormat('**', 'texto em negrito', textareaRef.current)}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] cursor-pointer"
          aria-label="Aplicar negrito na descrição ou pauta"
        >
          <Bold size={14} aria-hidden />
          Negrito
        </button>
        <button
          type="button"
          onClick={() => applyFormat('*', 'texto em itálico', textareaRef.current)}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] cursor-pointer"
          aria-label="Aplicar itálico na descrição ou pauta"
        >
          <Italic size={14} aria-hidden />
          Itálico
        </button>
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpandedOpen(true)}
            className="ml-auto inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] cursor-pointer"
            aria-label="Expandir editor de descrição ou pauta"
          >
            <Maximize2 size={14} aria-hidden />
            Expandir
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
          Descrição/Pauta <span className="text-[var(--color-text-subtle)]">(opcional)</span>
        </label>
        {renderToolbar(compactTextareaRef)}
        <textarea
          id={id}
          ref={compactTextareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          aria-describedby={helperId}
          className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
        />
        <p id={helperId} className="text-xs text-[var(--color-text-subtle)]">
          Selecione um trecho e use os botões para aplicar negrito ou itálico.
        </p>
      </div>

      <Dialog.Root open={expandedOpen} onOpenChange={setExpandedOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed inset-x-2 bottom-3 top-3 z-[60] flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg focus:outline-none sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[min(94vw,920px)] sm:-translate-x-1/2 sm:-translate-y-1/2"
            aria-describedby={`${id}-expanded-description`}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              expandedTextareaRef.current?.focus()
            }}
          >
            <div className="flex min-w-0 items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <Dialog.Title className="text-lg font-semibold text-[var(--color-text)]">
                  Editar descrição/pauta
                </Dialog.Title>
                <p id={`${id}-expanded-description`} className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Use a área ampliada para escrever, revisar e formatar a pauta da reunião.
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] cursor-pointer"
                  aria-label="Fechar editor expandido"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
              <div className="flex min-h-0 flex-col gap-2">
                {renderToolbar(expandedTextareaRef, true)}
                <textarea
                  id={`${id}-expanded-editor`}
                  ref={expandedTextareaRef}
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  placeholder={placeholder}
                  aria-label="Descrição ou pauta em editor expandido"
                  aria-describedby={`${id}-expanded-description`}
                  className="min-h-[320px] flex-1 resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-4 py-3 text-base leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <section
                id={previewId}
                className="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/35 p-4"
                aria-label="Prévia formatada da descrição ou pauta"
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                  <FileText size={14} aria-hidden />
                  <span>Prévia</span>
                </div>
                {value.trim() ? (
                  <AgendaFormattedText value={value} className="text-base" />
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    A prévia formatada aparecerá aqui enquanto você escreve.
                  </p>
                )}
              </section>
            </div>

            <div className="flex justify-end border-t border-[var(--color-border)] px-4 py-3 sm:px-5">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] cursor-pointer"
                >
                  Concluir edição
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

function MeetingCard({
  reuniao,
  today,
  onSelect,
}: {
  reuniao: AgendaReuniao
  today: string
  onSelect: (reuniao: AgendaReuniao) => void
}) {
  const highlighted = isTodayMeeting(reuniao, today)

  return (
    <button
      type="button"
      onClick={() => onSelect(reuniao)}
      className={cn(
        'w-full min-w-0 overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-bg-card)] p-3 text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] sm:p-4',
        highlighted
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {highlighted && (
              <span className="rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]">
                Hoje
              </span>
            )}
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
              {formatAgendaWeekday(reuniao.data)}
            </p>
          </div>
          <h3 className="mt-1 text-base font-semibold text-[var(--color-text)] wrap-anywhere" title={reuniao.tema}>
            {reuniao.tema}
          </h3>
        </div>
        <div className="w-fit max-w-full shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-2.5 py-1.5 text-left sm:text-right">
          <p className="text-xs font-semibold text-[var(--color-text)] tabular-nums">{formatAgendaDate(reuniao.data)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2">
          <Clock3 size={15} className="shrink-0 text-[var(--color-text-subtle)]" aria-hidden />
          <span className="min-w-0 tabular-nums">{reuniao.horaInicio} às {reuniao.horaFim}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <MapPin size={15} className="shrink-0 text-[var(--color-text-subtle)]" aria-hidden />
          <span className="min-w-0 wrap-anywhere" title={reuniao.local}>{reuniao.local}</span>
        </div>
      </div>

      {reuniao.descricaoPauta && (
        <div className="mt-4 min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/35 p-3">
          <div className="mb-1 flex min-w-0 items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
            <FileText size={14} aria-hidden />
            <span>Descrição/Pauta</span>
          </div>
          <AgendaFormattedText value={reuniao.descricaoPauta} className="line-clamp-3" />
        </div>
      )}
    </button>
  )
}

function MeetingDetailsDialog({
  reuniao,
  open,
  onOpenChange,
  today,
  busy,
  onSave,
  onDelete,
}: {
  reuniao: AgendaReuniao | null
  open: boolean
  onOpenChange: (open: boolean) => void
  today: string
  busy: boolean
  onSave: (id: string, input: UpdateAgendaReuniaoInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<UpdateAgendaReuniaoInput>(() => ({
    tema: reuniao?.tema ?? '',
    data: reuniao ? dateKey(reuniao.data) : '',
    horaInicio: reuniao?.horaInicio ?? '',
    horaFim: reuniao?.horaFim ?? '',
    local: reuniao?.local ?? '',
    descricaoPauta: reuniao?.descricaoPauta ?? '',
  }))

  if (!reuniao) return null

  const highlighted = isTodayMeeting(reuniao, today)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!reuniao) return

    const input = {
      tema: form.tema.trim(),
      data: form.data,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      local: form.local.trim(),
      descricaoPauta: form.descricaoPauta?.trim() || undefined,
    }

    if (!input.tema || !input.data || !input.horaInicio || !input.horaFim || !input.local) {
      toast.error('Preencha todos os dados obrigatórios da reunião.')
      return
    }

    if (input.horaFim <= input.horaInicio) {
      toast.error('A hora de fim deve ser maior que a hora de início.')
      return
    }

    await onSave(reuniao.id, input)
    setForm(input)
    setEditing(false)
  }

  async function handleDelete() {
    if (!reuniao) return
    const confirmed = window.confirm('Tem certeza que deseja excluir esta reunião? Esta ação não pode ser desfeita.')
    if (!confirmed) return

    await onDelete(reuniao.id)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-x-2 bottom-3 top-3 z-50 flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg focus:outline-none sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-[min(92vw,560px)] sm:-translate-x-1/2 sm:-translate-y-1/2"
          aria-describedby="agenda-reuniao-description"
        >
          <div className="flex min-w-0 flex-col gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {highlighted && (
                  <span className="rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]">
                    Hoje
                  </span>
                )}
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                  {formatAgendaWeekday(reuniao.data)}
                </span>
              </div>
              <Dialog.Title className="text-lg font-semibold text-[var(--color-text)] wrap-anywhere">
                {reuniao.tema}
              </Dialog.Title>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-1">
              {!editing && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    disabled={busy}
                    className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    aria-label="Editar reunião"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy}
                    className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-alta)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    aria-label="Excluir reunião"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] cursor-pointer"
                  aria-label="Fechar detalhes da reunião"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div id="agenda-reuniao-description" className="min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {editing ? (
              <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-tema" className="text-sm font-medium text-[var(--color-text)]">Tema da reunião</label>
                  <input
                    id="edit-tema"
                    type="text"
                    value={form.tema}
                    onChange={(event) => setForm((current) => ({ ...current, tema: event.target.value }))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-data" className="text-sm font-medium text-[var(--color-text)]">Data</label>
                    <input
                      id="edit-data"
                      type="date"
                      value={form.data}
                      onChange={(event) => setForm((current) => ({ ...current, data: event.target.value }))}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-horaInicio" className="text-sm font-medium text-[var(--color-text)]">Início</label>
                    <input
                      id="edit-horaInicio"
                      type="time"
                      value={form.horaInicio}
                      onChange={(event) => setForm((current) => ({ ...current, horaInicio: event.target.value }))}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-horaFim" className="text-sm font-medium text-[var(--color-text)]">Fim</label>
                    <input
                      id="edit-horaFim"
                      type="time"
                      value={form.horaFim}
                      onChange={(event) => setForm((current) => ({ ...current, horaFim: event.target.value }))}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-local" className="text-sm font-medium text-[var(--color-text)]">Local</label>
                  <input
                    id="edit-local"
                    type="text"
                    value={form.local}
                    onChange={(event) => setForm((current) => ({ ...current, local: event.target.value }))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </div>

                <DescriptionPautaEditor
                  id="edit-descricaoPauta"
                  value={form.descricaoPauta ?? ''}
                  onChange={(descricaoPauta) => setForm((current) => ({ ...current, descricaoPauta }))}
                  rows={5}
                />

                <div className="flex min-w-0 flex-col-reverse gap-2 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setForm({
                        tema: reuniao.tema,
                        data: dateKey(reuniao.data),
                        horaInicio: reuniao.horaInicio,
                        horaFim: reuniao.horaFim,
                        local: reuniao.local,
                        descricaoPauta: reuniao.descricaoPauta ?? '',
                      })
                    }}
                    disabled={busy}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer sm:w-auto"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer sm:w-auto"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Save size={16} aria-hidden />}
                    {busy ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                  <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">Data</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{formatAgendaDate(reuniao.data)}</p>
                  </div>
                  <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">Horário</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)] tabular-nums">
                      {reuniao.horaInicio} às {reuniao.horaFim}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">Local</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)] wrap-anywhere">{reuniao.local}</p>
                  </div>
                </div>

                <div className="mt-4 min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/35 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                    <FileText size={14} aria-hidden />
                    <span>Descrição/Pauta</span>
                  </div>
                  {reuniao.descricaoPauta ? (
                    <AgendaFormattedText value={reuniao.descricaoPauta} />
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Nenhuma descrição ou pauta foi registrada para esta reunião.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function MeetingCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-[var(--color-bg-hover)]" />
          <div className="h-5 w-48 rounded bg-[var(--color-bg-hover)]" />
        </div>
        <div className="h-8 w-24 rounded-[var(--radius-md)] bg-[var(--color-bg-hover)]" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="h-4 w-28 rounded bg-[var(--color-bg-hover)]" />
        <div className="h-4 w-36 rounded bg-[var(--color-bg-hover)]" />
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const service = useMemo(() => AgendaService(), [])
  const today = useMemo(() => toDateInputValue(), [])
  const tomorrow = useMemo(() => addDaysToDateInput(today, 1), [today])

  const [reunioes, setReunioes] = useState<AgendaReuniao[]>([])
  const [reunioesHoje, setReunioesHoje] = useState<AgendaReuniao[]>([])
  const [proximasReunioes, setProximasReunioes] = useState<AgendaReuniao[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dialogBusy, setDialogBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [localFilter, setLocalFilter] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<AgendaReuniao | null>(null)
  const [form, setForm] = useState<CreateAgendaReuniaoInput>({
    tema: '',
    data: today,
    horaInicio: '',
    horaFim: '',
    local: '',
    descricaoPauta: '',
  })
  const firstLoad = useRef(true)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(handle)
  }, [search])

  const fetchAgenda = useCallback(async () => {
    if (firstLoad.current) {
      setLoading(true)
    } else {
      setListLoading(true)
    }

    try {
      const filters: AgendaReuniaoFilters = { page, size }
      if (debouncedSearch) filters.busca = debouncedSearch
      if (localFilter.trim()) filters.local = localFilter.trim()
      if (dataInicio) filters.dataInicio = dataInicio
      if (dataFim) filters.dataFim = dataFim

      const [historico, hoje, proximas] = await Promise.all([
        service.findMany(filters),
        service.findMany({ page: 1, size: 100, dataInicio: today, dataFim: today }),
        service.findMany({ page: 1, size: 5, dataInicio: tomorrow, ordem: 'asc' }),
      ])

      setReunioes(historico.reunioes)
      setReunioesHoje(hoje.reunioes)
      setProximasReunioes(proximas.reunioes)
      setTotal(historico.total)
      setTotalPages(Math.max(1, historico.totalPages))
    } catch {
      toast.error('Não foi possível carregar a agenda.')
    } finally {
      setLoading(false)
      setListLoading(false)
      firstLoad.current = false
    }
  }, [dataFim, dataInicio, debouncedSearch, localFilter, page, service, size, today, tomorrow])

  useEffect(() => {
    void fetchAgenda()
  }, [fetchAgenda])

  function clearFilters() {
    setSearch('')
    setDebouncedSearch('')
    setLocalFilter('')
    setDataInicio('')
    setDataFim('')
    setPage(1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const input = {
      tema: form.tema.trim(),
      data: form.data,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      local: form.local.trim(),
      descricaoPauta: form.descricaoPauta?.trim() || undefined,
    }

    if (!input.tema || !input.data || !input.horaInicio || !input.horaFim || !input.local) {
      toast.error('Preencha todos os dados da reunião.')
      return
    }

    if (input.horaFim <= input.horaInicio) {
      toast.error('A hora de fim deve ser maior que a hora de início.')
      return
    }

    setSubmitting(true)
    try {
      await service.create(input)
      toast.success('Reunião registrada com sucesso.')
      setForm({ tema: '', data: today, horaInicio: '', horaFim: '', local: '', descricaoPauta: '' })
      setPage(1)
      await fetchAgenda()
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateMeeting(id: string, input: UpdateAgendaReuniaoInput) {
    setDialogBusy(true)
    try {
      const updated = await service.update(id, input)
      setSelectedMeeting(updated)
      toast.success('Reunião atualizada com sucesso.')
      await fetchAgenda()
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setDialogBusy(false)
    }
  }

  async function handleDeleteMeeting(id: string) {
    setDialogBusy(true)
    try {
      await service.remove(id)
      setSelectedMeeting(null)
      toast.success('Reunião excluída com sucesso.')
      await fetchAgenda()
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setDialogBusy(false)
    }
  }

  const hasFilters = Boolean(debouncedSearch || localFilter || dataInicio || dataFim)
  const detailsOpen = Boolean(selectedMeeting)

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-4 overflow-x-hidden sm:gap-5">
      <section
        aria-live="polite"
        className={cn(
          'min-w-0 max-w-full overflow-hidden rounded-[var(--radius-xl)] border p-4 sm:p-5',
          reunioesHoje.length
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
            : 'border-[var(--color-border)] bg-[var(--color-bg-card)]',
        )}
      >
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)]">
              <CalendarDays size={18} className="text-[var(--color-primary)]" aria-hidden />
              <span>Reuniões de hoje</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)] wrap-anywhere sm:text-2xl">
              {loading ? 'Carregando agenda...' : todayMeetingsHeading(reunioesHoje.length)}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)] wrap-anywhere">
              {reunioesHoje.length
                ? 'Os cards abaixo ficam destacados para que o usuário identifique rapidamente os compromissos do dia.'
                : 'Quando houver reuniões na data atual, elas aparecerão aqui com destaque visual.'}
            </p>
          </div>
          <div className="w-fit max-w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">Hoje</p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-text)] tabular-nums">{formatAgendaDate(today)}</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <MeetingCardSkeleton key={index} />)}
          </div>
        ) : reunioesHoje.length ? (
          <div className="mt-5 grid min-w-0 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {reunioesHoje.map((reuniao) => (
              <MeetingCard key={reuniao.id} reuniao={reuniao} today={today} onSelect={setSelectedMeeting} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="min-w-0 max-w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)]">
              <CalendarDays size={18} className="text-[var(--color-primary)]" aria-hidden />
              <span>Próximas reuniões</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)] wrap-anywhere">
              {loading ? 'Carregando próximas reuniões...' : upcomingMeetingsHeading(proximasReunioes.length)}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)] wrap-anywhere">
              Acompanhe os próximos compromissos já registrados, em ordem cronológica.
            </p>
          </div>
          <div className="w-fit max-w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/35 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">A partir de</p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-text)] tabular-nums">{formatAgendaDate(tomorrow)}</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <MeetingCardSkeleton key={index} />)}
          </div>
        ) : proximasReunioes.length ? (
          <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-3">
            {proximasReunioes.map((reuniao) => (
              <MeetingCard key={reuniao.id} reuniao={reuniao} today={today} onSelect={setSelectedMeeting} />
            ))}
          </div>
        ) : (
          <div className="mt-5 min-w-0 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-hover)]/25 p-4 text-sm text-[var(--color-text-muted)] wrap-anywhere sm:p-5">
            Cadastre uma reunião com data futura para que ela apareça neste quadro.
          </div>
        )}
      </section>

      <section className="grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Registro rápido</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--color-text)]">Nova reunião</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] wrap-anywhere">
              Informe tema, data, horário, local e a pauta quando quiser documentar os assuntos tratados.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tema" className="text-sm font-medium text-[var(--color-text)]">Tema da reunião</label>
              <input
                id="tema"
                type="text"
                value={form.tema}
                onChange={(event) => setForm((current) => ({ ...current, tema: event.target.value }))}
                placeholder="Ex.: Alinhamento semanal da CTI"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="data" className="text-sm font-medium text-[var(--color-text)]">Data</label>
                <input
                  id="data"
                  type="date"
                  value={form.data}
                  onChange={(event) => setForm((current) => ({ ...current, data: event.target.value }))}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="horaInicio" className="text-sm font-medium text-[var(--color-text)]">Início</label>
                <input
                  id="horaInicio"
                  type="time"
                  value={form.horaInicio}
                  onChange={(event) => setForm((current) => ({ ...current, horaInicio: event.target.value }))}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="horaFim" className="text-sm font-medium text-[var(--color-text)]">Fim</label>
                <input
                  id="horaFim"
                  type="time"
                  value={form.horaFim}
                  onChange={(event) => setForm((current) => ({ ...current, horaFim: event.target.value }))}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="local" className="text-sm font-medium text-[var(--color-text)]">Local</label>
              <input
                id="local"
                type="text"
                value={form.local}
                onChange={(event) => setForm((current) => ({ ...current, local: event.target.value }))}
                placeholder="Ex.: Sala de reuniões, Teams, Gabinete"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <DescriptionPautaEditor
              id="descricaoPauta"
              value={form.descricaoPauta ?? ''}
              onChange={(descricaoPauta) => setForm((current) => ({ ...current, descricaoPauta }))}
              placeholder="Registre os assuntos tratados, encaminhamentos ou observações da reunião..."
              rows={4}
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Plus size={16} aria-hidden />}
              {submitting ? 'Registrando...' : 'Registrar reunião'}
            </button>
          </div>
        </form>

        <section className="min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Histórico</p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--color-text)]">Todas as reuniões</h2>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{formatNumber(total)} registro{total === 1 ? '' : 's'}</p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" aria-hidden />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por tema, local ou pauta..."
                  className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={cn(
                  'inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-sm transition-colors cursor-pointer lg:w-auto',
                  showFilters
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                )}
              >
                <Filter size={15} aria-hidden />
                Filtros
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-alta)] cursor-pointer lg:w-auto"
                >
                  <X size={15} aria-hidden />
                  Limpar
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid min-w-0 gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-hover)]/35 p-4 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="localFilter" className="text-xs font-medium text-[var(--color-text-subtle)]">Local</label>
                  <input
                    id="localFilter"
                    type="text"
                    value={localFilter}
                    onChange={(event) => {
                      setLocalFilter(event.target.value)
                      setPage(1)
                    }}
                    placeholder="Filtrar local..."
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dataInicio" className="text-xs font-medium text-[var(--color-text-subtle)]">Data início</label>
                  <input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(event) => {
                      setDataInicio(event.target.value)
                      setPage(1)
                    }}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dataFim" className="text-xs font-medium text-[var(--color-text-subtle)]">Data fim</label>
                  <input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(event) => {
                      setDataFim(event.target.value)
                      setPage(1)
                    }}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              {loading ? (
                <div className="grid min-w-0 gap-3">
                  {Array.from({ length: 5 }).map((_, index) => <MeetingCardSkeleton key={index} />)}
                </div>
              ) : reunioes.length ? (
                <div className="grid min-w-0 gap-3">
                  {reunioes.map((reuniao) => (
                    <MeetingCard key={reuniao.id} reuniao={reuniao} today={today} onSelect={setSelectedMeeting} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Nenhuma reunião encontrada"
                  description="Registre uma nova reunião ou ajuste os filtros para consultar outro período."
                />
              )}

              {!loading && listLoading && (
                <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                  Atualizando histórico...
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <span>Por página:</span>
                <select
                  value={size}
                  onChange={(event) => {
                    setSize(Number(event.target.value))
                    setPage(1)
                  }}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-input)] px-2 py-1 text-sm text-[var(--color-text)] focus:outline-none cursor-pointer"
                >
                  {[10, 25, 50].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-text-muted)] sm:justify-end">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Página anterior"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-1.5 transition-colors hover:bg-[var(--color-bg-hover)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={15} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima página"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-1.5 transition-colors hover:bg-[var(--color-bg-hover)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={15} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <MeetingDetailsDialog
        key={selectedMeeting?.id ?? 'empty'}
        reuniao={selectedMeeting}
        open={detailsOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedMeeting(null)
        }}
        today={today}
        busy={dialogBusy}
        onSave={handleUpdateMeeting}
        onDelete={handleDeleteMeeting}
      />
    </div>
  )
}
