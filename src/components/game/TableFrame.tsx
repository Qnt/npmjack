import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

export function TableFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl p-3 sm:p-5">
        <section
          className={cn(
            'flex w-full flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(246,201,92,0.08),transparent_36%),linear-gradient(160deg,#12332c_0%,#081617_55%,#0c1d22_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_32px_70px_rgba(0,0,0,0.4)] sm:p-6',
            className,
          )}
          style={{ viewTransitionName: 'felt-table' }}
        >
          {children}
        </section>
      </main>
    </div>
  )
}
