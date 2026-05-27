'use client'

import { Download, Share2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const INSTALLED_KEY = 'cti_pwa_installed'
const SESSION_DISMISS_KEY = 'cti_pwa_install_prompt_dismissed'

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}

function isIosSafari() {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIosDevice =
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent)

  return isIosDevice && isSafari
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.localStorage.getItem(INSTALLED_KEY) === 'true' ||
      window.sessionStorage.getItem(SESSION_DISMISS_KEY) === 'true'
    )
  })

  useEffect(() => {
    if (dismissed || isStandaloneMode()) return

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      window.localStorage.setItem(INSTALLED_KEY, 'true')
      setInstallEvent(null)
      setShowIosHelp(false)
      setDismissed(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    const iosHelpTimer = window.setTimeout(() => {
      if (!isStandaloneMode() && isIosSafari()) {
        setShowIosHelp(true)
      }
    }, 1200)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.clearTimeout(iosHelpTimer)
    }
  }, [dismissed])

  const canInstall = Boolean(installEvent)
  const shouldShow = !dismissed && (canInstall || showIosHelp)

  const content = useMemo(() => {
    if (canInstall) {
      return {
        icon: <Download size={18} aria-hidden />,
        title: 'Instale o Dashboard CTI',
        description: 'Acesse o dashboard como aplicativo no celular, tablet ou desktop, com abertura em tela cheia.',
        action: 'Instalar app',
      }
    }

    return {
      icon: <Share2 size={18} aria-hidden />,
      title: 'Adicione à Tela de Início',
      description: 'No iPhone ou iPad, toque em Compartilhar e selecione “Adicionar à Tela de Início”.',
      action: null,
    }
  }, [canInstall])

  async function handleInstall() {
    if (!installEvent) return

    await installEvent.prompt()
    const choice = await installEvent.userChoice

    setInstallEvent(null)

    if (choice.outcome === 'accepted') {
      window.localStorage.setItem(INSTALLED_KEY, 'true')
      setDismissed(true)
    }
  }

  function handleDismiss() {
    window.sessionStorage.setItem(SESSION_DISMISS_KEY, 'true')
    setDismissed(true)
    setInstallEvent(null)
    setShowIosHelp(false)
  }

  if (!shouldShow) return null

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 right-3 z-[70] mx-auto max-w-sm rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-[var(--color-text)] shadow-2xl sm:left-auto sm:right-4 sm:mx-0"
    >
      <button
        type="button"
        aria-label="Fechar aviso de instalação"
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
      >
        <X size={16} aria-hidden />
      </button>

      <div className="flex gap-3 pr-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {content.icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{content.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{content.description}</p>
        </div>
      </div>

      {content.action && (
        <button
          type="button"
          onClick={handleInstall}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          <Download size={16} aria-hidden />
          {content.action}
        </button>
      )}
    </aside>
  )
}
