'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'

type Theme = 'dark' | 'light'
type ThemeSnapshot = Theme | null

const THEME_STORAGE_KEY = 'cti_theme'
const THEME_CHANGE_EVENT = 'cti-theme-change'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)')?.matches
  return prefersLight ? 'light' : 'dark'
}

function subscribeToThemeChanges(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: light)')
  window.addEventListener('storage', callback)
  window.addEventListener(THEME_CHANGE_EVENT, callback)
  mediaQuery?.addEventListener('change', callback)

  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(THEME_CHANGE_EVENT, callback)
    mediaQuery?.removeEventListener('change', callback)
  }
}

function getThemeSnapshot(): ThemeSnapshot {
  if (typeof window === 'undefined') return null
  return getInitialTheme()
}

function getServerThemeSnapshot(): ThemeSnapshot {
  return null
}

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

export function ThemeSwitch() {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  )

  const label = useMemo(
    () =>
      theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro',
    [theme],
  )

  const isLight = theme === 'light'

  // Evita mismatch de hidratação: só renderiza no cliente após saber o tema.
  if (!theme) return null

  return (
    <button
      type="button"
      onClick={() => applyTheme(isLight ? 'dark' : 'light')}
      aria-label={label}
      title={label}
      className="flex h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-card) px-0 text-(--color-text-muted) transition-colors hover:bg-(--color-bg-hover) hover:text-(--color-text) cursor-pointer touch-manipulation sm:px-3"
    >
      {isLight ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
      <span className="hidden text-xs font-medium sm:inline">{isLight ? 'Tema escuro' : 'Tema claro'}</span>
    </button>
  )
}

