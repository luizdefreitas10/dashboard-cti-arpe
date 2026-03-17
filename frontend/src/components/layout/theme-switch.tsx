'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const saved = window.localStorage.getItem('cti_theme')
  if (saved === 'light' || saved === 'dark') return saved
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)')?.matches
  return prefersLight ? 'light' : 'dark'
}

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    document.documentElement.dataset.theme = initial
    document.documentElement.style.colorScheme = initial
  }, [])

  useEffect(() => {
    if (!theme) return
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('cti_theme', theme)
  }, [theme])

  const label = useMemo(
    () =>
      theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro',
    [theme],
  )

  const isLight = theme === 'light'

  // Evita mismatch de hidratação: só renderiza no cliente após saber o tema
  if (!theme) return null

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      aria-label={label}
      className="flex items-center gap-2 px-2 py-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-card)]/70 hover:bg-[var(--color-bg-hover)] cursor-pointer"
    >
      {isLight ? <Sun size={16} /> : <Moon size={16} />}
      <span className="text-xs text-[var(--color-text-muted)]">{isLight ? 'Claro' : 'Escuro'}</span>
    </button>
  )
}

