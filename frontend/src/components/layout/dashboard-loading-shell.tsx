import { CtiLogo, CtiSymbol } from '@/components/brand/cti-brand'

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-(--color-bg-hover)/80 ${className}`}
      aria-hidden
    />
  )
}

function SidebarSkeleton() {
  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 z-30 h-screen w-(--sidebar-width) flex-col border-r border-(--color-border) bg-(--color-bg-sidebar)"
      aria-hidden
    >
      <div className="px-5 pt-6 pb-4">
        <CtiLogo className="h-10 w-auto" priority />
        <div className="mt-4 flex items-center gap-2.5">
          <span className="arpe-tricolor w-8 shrink-0 opacity-60" />
          <SkeletonBlock className="h-2.5 w-28" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 py-4">
        <SkeletonBlock className="h-9 w-full" />
        <SkeletonBlock className="h-8 w-10/12" />
        <SkeletonBlock className="h-8 w-11/12" />
        <SkeletonBlock className="mt-3 h-9 w-full" />
        <SkeletonBlock className="h-8 w-9/12" />
        <SkeletonBlock className="h-8 w-10/12" />
      </div>

      <div className="border-t border-(--color-border) px-5 py-4">
        <SkeletonBlock className="h-3 w-16" />
      </div>
    </aside>
  )
}

function HeaderSkeleton() {
  return (
    <header
      className="sticky top-0 z-50 flex h-(--dashboard-header-offset) shrink-0 items-center overflow-hidden border-b border-(--color-border) bg-(--color-bg-sidebar)/85 px-3 pt-(--safe-area-inset-top) backdrop-blur-md sm:px-5 lg:px-8"
      aria-hidden
    >
      <div className="grid h-full w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 lg:hidden">
          <SkeletonBlock className="h-10 w-10 shrink-0" />
          <CtiSymbol size={30} decorative />
        </div>
        <span className="hidden lg:block" />

        <div className="flex min-w-0 flex-col items-start justify-center gap-1 px-1">
          <SkeletonBlock className="h-2.5 w-28 max-w-full" />
          <SkeletonBlock className="h-4 w-44 max-w-[70vw] sm:w-56" />
          <SkeletonBlock className="h-2.5 w-36 max-w-[65vw] sm:w-64" />
        </div>

        <div className="flex shrink-0 items-center gap-2 justify-self-end">
          <SkeletonBlock className="hidden h-10 w-36 sm:block" />
          <SkeletonBlock className="h-10 w-10" />
          <SkeletonBlock className="h-10 w-10" />
        </div>
      </div>
    </header>
  )
}

export function DashboardContentSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando conteúdo do painel"
      className="flex w-full min-w-0 max-w-full animate-pulse flex-col gap-6 sm:gap-8"
    >
      <span className="sr-only">Carregando conteúdo do painel</span>

      <section className="min-w-0 space-y-3">
        <SkeletonBlock className="h-4 w-full max-w-2xl" />
        <SkeletonBlock className="h-4 w-10/12 max-w-xl" />
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-card) p-4"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-7 w-20" />
              </div>
              <SkeletonBlock className="h-9 w-9 shrink-0" />
            </div>
            <SkeletonBlock className="h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-card) p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-3 w-64 max-w-full" />
          </div>
          <SkeletonBlock className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-20" />
          ))}
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <SkeletonBlock className="h-64 border border-(--color-border) bg-(--color-bg-card)" />
        <SkeletonBlock className="h-64 border border-(--color-border) bg-(--color-bg-card)" />
      </section>
    </div>
  )
}

export function DashboardLoadingShell() {
  return (
    <div
      className="min-h-screen bg-(--color-bg) text-(--color-text)"
      aria-busy="true"
    >
      <SidebarSkeleton />

      <div className="flex min-h-screen w-full min-w-0 max-w-[100vw] flex-col overflow-x-clip lg:pl-(--sidebar-width)">
        <HeaderSkeleton />
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-3 sm:p-6 lg:p-8">
          <DashboardContentSkeleton />
        </main>
      </div>
    </div>
  )
}
