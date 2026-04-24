import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { FeltOverlay } from '#/components/game/FeltOverlay'
import { PackageCardBack } from '#/components/game/PackageCard'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()

  const handleDeal = () => {
    navigate({ to: '/game', viewTransition: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="relative flex flex-1 flex-col overflow-hidden p-3 sm:p-5">
        <div
          className="relative flex flex-1 flex-col overflow-hidden rounded-[24px] border-[3px] border-black/80 bg-[radial-gradient(circle_at_top,rgba(120,180,160,0.18),transparent_55%),linear-gradient(160deg,#0e2e28_0%,#061617_55%,#0a2028_100%)] p-4 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.05),0_40px_80px_rgba(0,0,0,0.55)] sm:p-6"
          style={{ viewTransitionName: 'felt-table' }}
        >
          <FeltOverlay />

          <div className="relative z-10 flex flex-1 flex-col">
            <IdleBoard onStart={handleDeal} />
          </div>
        </div>
      </main>
    </div>
  )
}

function IdleBoard({ onStart }: { onStart: () => void }) {
  const titleRows = [
    ['N', 'P', 'M'],
    ['J', 'A', 'C', 'K'],
  ]

  const floatingSuits: Array<{
    s: string
    x: string
    y: string
    sz: string
    op: number
    delay: string
    dur: string
    red: boolean
  }> = [
    { s: '♠', x: '7%', y: '13%', sz: '1.5rem', op: 0.11, delay: '0s', dur: '5.2s', red: false },
    { s: '♥', x: '89%', y: '19%', sz: '1.1rem', op: 0.09, delay: '1.3s', dur: '6.1s', red: true },
    { s: '♦', x: '4%', y: '70%', sz: '1.9rem', op: 0.07, delay: '0.7s', dur: '7.3s', red: true },
    { s: '♣', x: '92%', y: '64%', sz: '1.2rem', op: 0.1, delay: '2.1s', dur: '5.8s', red: false },
    { s: '♥', x: '76%', y: '5%', sz: '2.1rem', op: 0.07, delay: '3.4s', dur: '8.0s', red: true },
    { s: '♠', x: '13%', y: '45%', sz: '0.9rem', op: 0.08, delay: '1.8s', dur: '6.5s', red: false },
    { s: '♦', x: '68%', y: '86%', sz: '1.6rem', op: 0.08, delay: '0.4s', dur: '7.0s', red: true },
    { s: '♣', x: '32%', y: '4%', sz: '1.0rem', op: 0.07, delay: '2.7s', dur: '5.5s', red: false },
  ]

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-2 py-4 text-center sm:px-4 sm:py-5">
      <div
        className="pointer-events-none absolute inset-x-0 top-[14%] h-28 bg-[radial-gradient(circle_at_center,rgba(255,117,117,0.2),transparent_68%)] blur-2xl"
        style={{ animation: 'npmjack-pulse-glow 4s ease-in-out infinite' }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-[6%] h-24 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_72%)] blur-xl" />

      {floatingSuits.map((suit, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute select-none font-display"
          style={{
            left: suit.x,
            top: suit.y,
            fontSize: suit.sz,
            opacity: suit.op,
            color: suit.red ? '#fca5a5' : '#6ee7b7',
            animation: `npmjack-float ${suit.dur} ease-in-out ${suit.delay} infinite`,
          }}
        >
          {suit.s}
        </span>
      ))}

      <div className="z-10 flex w-full max-w-4xl flex-col items-center gap-2">
        <div className="mt-1 flex flex-col items-center gap-1.5 sm:gap-2">
          {titleRows.map((row, rowIndex) => (
            <div
              key={row.join('')}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2.5',
                rowIndex === 0 ? 'translate-x-[2%]' : '-translate-x-[1%]',
              )}
            >
              {row.map((letter) => (
                <PackageCardBack
                  key={`${rowIndex}-${letter}`}
                  className={cn(
                    'w-[clamp(4.1rem,11dvh,8.75rem)]',
                    rowIndex === 0 ? 'rotate-[-0.8deg]' : 'rotate-[0.8deg]',
                  )}
                  label={letter}
                  labelClassName="text-[clamp(1.7rem,4.8dvh,3.4rem)] tracking-[0.06em] text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.65)]"
                  note=""
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="z-10 mt-5 flex flex-col items-center gap-4 sm:mt-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
          <span className="font-display text-[0.68rem] tracking-[0.28em] text-white/30">
            ♠ ♥ ♦ ♣
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        <p className="max-w-sm text-[0.92rem] leading-6 text-white/55">
          Draw npm packages notorious for their legendary bloat.
          <br />
          <span className="text-[0.82rem] text-white/35">
            Good luck not drowning in dependencies.
          </span>
        </p>

        <div className="relative mt-1" style={{ paddingBottom: '6px' }}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-[12px]"
            style={{ height: '6px', background: '#4a0f12' }}
          />
          <button
            onClick={onStart}
            type="button"
            className="relative inline-flex items-center gap-3 rounded-[12px] border-[2.5px] border-black/80 bg-gradient-to-b from-rose-500 to-rose-700 px-12 py-4 font-display text-base sm:text-lg uppercase tracking-[0.24em] text-white transition-transform duration-[60ms] ease-linear active:translate-y-[5px]"
          >
            Deal
          </button>
        </div>
      </div>
    </div>
  )
}
