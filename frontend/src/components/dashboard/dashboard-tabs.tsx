'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

export type TabId = 'volume' | 'distribuicao' | 'tendencias'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { id: 'volume', label: 'Volume', icon: <BarChart3 size={16} /> },
  { id: 'distribuicao', label: 'Distribuição', icon: <PieChart size={16} /> },
  { id: 'tendencias', label: 'Tendências', icon: <TrendingUp size={16} /> },
]

interface DashboardTabsProps {
  defaultValue?: TabId
  children: (activeTab: TabId) => React.ReactNode
}

export function DashboardTabs({ defaultValue = 'volume', children }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultValue)

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        className="flex flex-wrap gap-1 p-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] w-fit"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
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
      <div role="tabpanel">{children(activeTab)}</div>
    </div>
  )
}
