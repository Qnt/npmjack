import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { TableFrame } from '#/components/game/TableFrame'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()

  const handleDeal = () => {
    navigate({ to: '/game', viewTransition: true })
  }

  return (
    <TableFrame>
      <LandingScreen onStart={handleDeal} />
    </TableFrame>
  )
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-10 lg:gap-16">
      <div className="max-w-3xl">
        <p className="font-display text-[0.72rem] uppercase tracking-[0.32em] text-amber-200/70">
          Blackjack for package bloat
        </p>
        <h1 className="mt-4 font-display text-[clamp(3.8rem,12vw,7rem)] leading-none uppercase text-white">
          npmjack
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
          Draw npm packages, add their unpacked size to your hand, and stop as close to the target
          as you dare.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4 sm:grid-cols-3">
          <RuleCard
            title="Hit"
            text="Pull another package and add its unpacked size to your hand."
          />
          <RuleCard
            title="Stand"
            text="Lock your total and force the dealer to chase the same target."
          />
          <RuleCard
            title="Bust"
            text="Go over the target and the round is gone, no matter how close you were."
          />
        </div>

        <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-black/20 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div>
            <p className="font-display text-[0.68rem] uppercase tracking-[0.26em] text-white/45">
              Current direction
            </p>
            <p className="mt-4 text-sm leading-6 text-white/65">
              Strip the theatrics. Keep the odds, the tension, and the package-size reveal.
            </p>
          </div>

          <button
            onClick={onStart}
            type="button"
            className="mt-8 inline-flex items-center justify-center rounded-[14px] border-2 border-black/70 bg-gradient-to-b from-rose-500 to-rose-700 px-6 py-3 font-display text-sm uppercase tracking-[0.22em] text-white transition-transform duration-75 active:translate-y-[3px]"
          >
            Deal
          </button>
        </div>
      </div>
    </div>
  )
}

function RuleCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[20px] border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <h2 className="font-display text-[0.78rem] uppercase tracking-[0.18em] text-white/80">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
    </article>
  )
}
