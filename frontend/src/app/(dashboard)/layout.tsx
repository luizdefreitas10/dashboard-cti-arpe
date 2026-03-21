'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sem margin-left: menu é modal (overlay); evita faixa vazia no topo à esquerda quando o drawer abre */}
      <div className="flex min-h-screen w-full min-w-0 max-w-[100vw] flex-col overflow-x-clip">
        <Header onMenuToggle={toggleSidebar} isMenuOpen={sidebarOpen} />
        <main className="flex-1 w-full min-w-0 max-w-full p-3 sm:p-6 lg:p-8">{children}</main>
        <Footer />
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-bg-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          },
        }}
      />
    </div>
  )
}
