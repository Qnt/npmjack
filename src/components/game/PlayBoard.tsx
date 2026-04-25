import { GameControls } from '#/components/game/GameControls'
import { GameStatus } from '#/components/game/GameStatus'
import { PackageCard, PackageCardBack } from '#/components/game/PackageCard'
import { cn } from '#/lib/utils'

import type { GameStatus as RoundStatus } from '#/hooks/useGame'
import type { PackageInfo } from '#/lib/npm-registry'

interface PlayBoardProps {
  dealerDrawing: boolean
  dealerPackages: PackageInfo[]
  dealerTotalMB: number
  isLoadingDeck: boolean
  isLoadingPlayer: boolean
  onHit: () => void
  onNewGame: () => void
  onStand: () => void
  playerPackages: PackageInfo[]
  playerTotalMB: number
  status: RoundStatus
  targetMB: number
}

export function PlayBoard({
  dealerDrawing,
  dealerPackages,
  dealerTotalMB,
  isLoadingDeck,
  isLoadingPlayer,
  onHit,
  onNewGame,
  onStand,
  playerPackages,
  playerTotalMB,
  status,
  targetMB,
}: PlayBoardProps) {
  const controlsLoading = dealerDrawing || isLoadingDeck || isLoadingPlayer

  return (
    <div className="flex flex-1 flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:grid-rows-[1fr_auto_1fr]">
      <section className="flex min-h-[13.5rem] flex-col justify-center xl:row-start-1">
        <HandLane drawing={dealerDrawing} label="Dealer" packages={dealerPackages} />
      </section>

      <section className="flex flex-col items-center gap-4 xl:row-start-2">
        {(status === 'playing' || status === 'dealerTurn') && (
          <CenterBar
            dealerTotalMB={dealerTotalMB}
            playerTotalMB={playerTotalMB}
            status={status}
            targetMB={targetMB}
          />
        )}
        <GameStatus
          dealerTotalMB={dealerTotalMB}
          playerTotalMB={playerTotalMB}
          status={status}
          targetMB={targetMB}
        />
      </section>

      <section className="flex min-h-[13.5rem] flex-col justify-center xl:row-start-3">
        <HandLane drawing={isLoadingPlayer} label="Player" packages={playerPackages} />
      </section>

      <aside className="order-last flex items-end justify-between gap-4 pt-2 xl:order-none xl:col-start-2 xl:row-span-3 xl:flex-col xl:items-stretch xl:justify-center xl:pt-0">
        <div className="pointer-events-none flex justify-center xl:justify-end">
          <DeckStack active={controlsLoading} />
        </div>
        <div className="flex justify-end">
          <GameControls
            isLoading={isLoadingDeck || isLoadingPlayer}
            onHit={onHit}
            onNewGame={onNewGame}
            onStand={onStand}
            playerCardCount={playerPackages.length}
            status={status}
          />
        </div>
      </aside>
    </div>
  )
}

function CenterBar({
  dealerTotalMB,
  playerTotalMB,
  status,
  targetMB,
}: {
  dealerTotalMB: number
  playerTotalMB: number
  status: RoundStatus
  targetMB: number
}) {
  const playerBust = playerTotalMB > targetMB
  const dealerBust = dealerTotalMB > targetMB
  const showDealer = status !== 'playing' && dealerTotalMB > 0
  const showPlayer = playerTotalMB > 0

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative flex flex-col items-center gap-2 py-3">
        <div className="flex h-4 items-center justify-center">
          {showDealer && (
            <span
              key={`d-${status}`}
              className={cn(
                'font-display text-[0.95rem] leading-none tabular-nums tracking-[0.04em]',
                dealerBust ? 'text-rose-300' : 'text-orange-200/90',
              )}
            >
              {dealerTotalMB.toFixed(2)}
              <span className="ml-0.5 text-[0.55em] opacity-50">MB</span>
            </span>
          )}
        </div>

        <span className="font-display text-[0.82rem] leading-none tabular-nums tracking-[0.12em] text-amber-300/70">
          {targetMB.toFixed(2)}
          <span className="ml-0.5 text-[0.55em] opacity-50">MB</span>
        </span>

        <div className="flex h-4 items-center justify-center">
          {showPlayer && (
            <span
              className={cn(
                'font-display text-[0.95rem] leading-none tabular-nums tracking-[0.04em]',
                playerBust ? 'text-rose-300' : 'text-sky-200/90',
              )}
            >
              {playerTotalMB.toFixed(2)}
              <span className="ml-0.5 text-[0.55em] opacity-50">MB</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function DeckStack({ active }: { active: boolean }) {
  return (
    <div className="relative h-[13.5rem] w-[9.5rem]">
      <div className="absolute left-2 top-2 opacity-70">
        <PackageCardBack label="npm" note="deck" className="shadow-none" />
      </div>
      <div className="absolute left-1 top-1 opacity-85">
        <PackageCardBack label="npm" note="deck" className="shadow-none" />
      </div>
      <div
        className={cn(
          'absolute left-0 top-0 transition-transform duration-300',
          active && '-translate-y-1 rotate-[-2deg]',
        )}
      >
        <PackageCardBack label="npm" note="deck" />
      </div>
    </div>
  )
}

interface HandLaneProps {
  drawing: boolean
  label: string
  packages: PackageInfo[]
}

function HandLane({ drawing, label, packages }: HandLaneProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-2">
        <span className="font-display text-[0.72rem] uppercase tracking-[0.18em] text-white/45">
          {label}
        </span>
        <span className="text-xs uppercase tracking-[0.16em] text-white/25">
          {packages.length} shown
        </span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-h-[13.5rem] w-max min-w-full items-start justify-center px-3 [&>*+*]:-ml-10 sm:[&>*+*]:-ml-12 lg:[&>*+*]:-ml-16">
          {packages.map((pkg, index) => (
            <div key={`${pkg.name}-${index}`} className="transition-transform duration-200">
              <PackageCard packageInfo={pkg} />
            </div>
          ))}
          {drawing ? <PackageCardBack label="drawing" note="…" loading /> : null}
        </div>
      </div>
    </div>
  )
}
