'use client'

import { useState, useCallback, useId } from 'react'
import { cn } from '@/lib/utils'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

export type TabId = 'volume' | 'distribuicao' | 'tendencias'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { id: 'volume', label: 'Volume', icon: <BarChart3 size={16} aria-hidden /> },
  { id: 'distribuicao', label: 'Distribuição', icon: <PieChart size={16} aria-hidden /> },
  { id: 'tendencias', label: 'Tendências', icon: <TrendingUp size={16} aria-hidden /> },
]

interface DashboardTabsProps {
  defaultValue?: TabId
  volumeContent: React.ReactNode
  distribuicaoContent: React.ReactNode
  tendenciasContent: React.ReactNode
}

export function DashboardTabs({
  defaultValue = 'volume',
  volumeContent,
  distribuicaoContent,
  tendenciasContent,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultValue)
  const tablistId = useId()
  const panelId = useId()

  const activeIndex = tabs.findIndex((t) => t.id === activeTab)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = activeIndex
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        next = Math.min(activeIndex + 1, tabs.length - 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        next = Math.max(activeIndex - 1, 0)
      } else if (e.key === 'Home') {
        e.preventDefault()
        next = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        next = tabs.length - 1
      } else return
      setActiveTab(tabs[next].id)
    },
    [activeIndex],
  )

  const contentMap: Record<TabId, React.ReactNode> = {
    volume: volumeContent,
    distribuicao: distribuicaoContent,
    tendencias: tendenciasContent,
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        id={tablistId}
        aria-label="Seções do dashboard de atividades"
        onKeyDown={handleKeyDown}
        className="flex flex-wrap gap-1 p-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] w-fit"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            id={`${tablistId}-tab-${i}`}
            aria-selected={activeTab === tab.id}
            aria-controls={panelId}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]',
              activeTab === tab.id
                ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${tablistId}-tab-${activeIndex}`}
        tabIndex={0}
      >
        {contentMap[activeTab]}
      </div>
    </div>
  )
}
