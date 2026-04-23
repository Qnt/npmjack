import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { GameControls } from '#/components/game/GameControls'
import { GameStatus } from '#/components/game/GameStatus'
import { PackageCard, PackageCardBack, PackageCardSlot } from '#/components/game/PackageCard'
import { usePackageInfo } from '#/hooks/usePackageInfo'
import { useGame } from '#/hooks/useGame'
import { cn } from '#/lib/utils'

import type { GameStatus as RoundStatus } from '#/hooks/useGame'
import type { PackageInfo } from '#/lib/npm-registry'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const game = useGame()
  const processedDrawIdRef = useRef<number | null>(null)
  const { data: playerPackageInfo, isLoading: isLoadingPlayer } = usePackageInfo(
    game.playerDraw?.packageName ?? null,
    game.playerDraw?.drawId
  )
  const { data: dealerPackageInfo, isLoading: isLoadingDealer } = usePackageInfo(
    game.dealerPackageName
  )

  useEffect(() => {
    if (playerPackageInfo && !isLoadingPlayer && game.playerDraw) {
      if (processedDrawIdRef.current === game.playerDraw.drawId) return

      if (playerPackageInfo.unpackedSize === null) {
        processedDrawIdRef.current = game.playerDraw.drawId
        game.rejectPlayerPackage(game.playerDraw.packageName)
        return
      }

      processedDrawIdRef.current = game.playerDraw.drawId
      game.playerHit(playerPackageInfo)
      game.clearPlayerDraw()
    }
  }, [playerPackageInfo, isLoadingPlayer, game.playerDraw, game])

  useEffect(() => {
    if (dealerPackageInfo && !isLoadingDealer && game.dealerPackageName) {
      if (dealerPackageInfo.unpackedSize === null) {
        game.rejectDealerPackage(game.dealerPackageName)
        return
      }

      const isNewPackage =
        !game.dealerPackages.some(p => p.name === dealerPackageInfo.name) &&
        !game.playerPackages.some(p => p.name === dealerPackageInfo.name)
      if (isNewPackage) game.handleDealerPackageLoaded(dealerPackageInfo)
    }
  }, [dealerPackageInfo, isLoadingDealer, game])

  const handleStartGame = () => {
    processedDrawIdRef.current = null
    game.startGame()
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Felt table */}
      <main className="relative flex flex-1 flex-col overflow-hidden p-3 sm:p-5">
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-[24px] border-[3px] border-black/80 bg-[radial-gradient(circle_at_top,rgba(120,180,160,0.18),transparent_55%),linear-gradient(160deg,#0e2e28_0%,#061617_55%,#0a2028_100%)] p-4 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.05),0_40px_80px_rgba(0,0,0,0.55)] sm:p-6">
          <FeltOverlay />

          <div className="relative z-10 flex flex-1 flex-col">
            {game.status === 'idle' ? (
              <IdleBoard onStart={handleStartGame} />
            ) : (
              <PlayBoard
                dealerDrawing={game.status === 'dealerTurn'}
                dealerPackages={game.dealerPackages}
                dealerTotalMB={game.dealerTotalMB}
                isLoadingPlayer={isLoadingPlayer}
                onHit={game.drawPlayerPackage}
                onNewGame={handleStartGame}
                onStand={game.stand}
                playerPackages={game.playerPackages}
                playerTotalMB={game.playerTotalMB}
                status={game.status}
                targetMB={game.targetMB}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Felt components ──────────────────────────────────────────────────────────

function FeltOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[21px] opacity-70 mix-blend-soft-light"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px)',
        backgroundSize: '20px 20px',
      }}
    />
  )
}

function IdleBoard({ onStart }: { onStart: () => void }) {
  const titleRows = [
    ['N', 'P', 'M'],
    ['J', 'A', 'C', 'K'],
  ]

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-2 py-4 text-center sm:px-4 sm:py-5">
      <div className="pointer-events-none absolute inset-x-0 top-[14%] h-28 bg-[radial-gradient(circle_at_center,rgba(255,117,117,0.2),transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[6%] h-24 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_72%)] blur-xl" />

      <div className="z-10 flex w-full max-w-4xl flex-col items-center gap-2">
        <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 font-display text-[0.52rem] uppercase tracking-[0.24em] text-amber-200/90">
          npm blackjack
        </span>

        <div className="mt-1 flex flex-col items-center gap-1.5 sm:gap-2">
          {titleRows.map((row, rowIndex) => (
            <div
              key={row.join('')}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2.5',
                rowIndex === 0 ? 'translate-x-[2%]' : '-translate-x-[1%]'
              )}
            >
              {row.map(letter => (
                <PackageCardBack
                  key={`${rowIndex}-${letter}`}
                  className={cn(
                    'w-[clamp(4.1rem,11dvh,8.75rem)]',
                    rowIndex === 0 ? 'rotate-[-0.8deg]' : 'rotate-[0.8deg]'
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

      <div className="z-10 mt-3 flex flex-col items-center gap-3 sm:mt-4">
        <p className="max-w-xl text-sm leading-6 text-white/75 sm:text-base">
          Draw npm packages, hug the blind, and outlast the dealer.
        </p>
        <button
          onClick={onStart}
          type="button"
          className="inline-flex items-center gap-3 rounded-[16px] border-[3px] border-black/85 bg-gradient-to-b from-rose-500 to-rose-700 px-9 py-4 font-display text-sm uppercase tracking-[0.2em] text-white shadow-[0_8px_0_#4a0f12,0_14px_26px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-0.5 active:translate-y-[4px] active:shadow-[0_3px_0_#4a0f12,0_7px_14px_rgba(0,0,0,0.5)]"
        >
          Deal
        </button>
        <span className="text-[0.62rem] uppercase tracking-[0.22em] text-white/45">
          21.00 mb blind
        </span>
      </div>
    </div>
  )
}

interface PlayBoardProps {
  dealerDrawing: boolean
  dealerPackages: PackageInfo[]
  dealerTotalMB: number
  isLoadingPlayer: boolean
  onHit: () => void
  onNewGame: () => void
  onStand: () => void
  playerPackages: PackageInfo[]
  playerTotalMB: number
  status: RoundStatus
  targetMB: number
}

function PlayBoard({
  dealerDrawing,
  dealerPackages,
  dealerTotalMB,
  isLoadingPlayer,
  onHit,
  onNewGame,
  onStand,
  playerPackages,
  playerTotalMB,
  status,
  targetMB,
}: PlayBoardProps) {
  return (
    <div className="relative flex flex-1 flex-col justify-between">
      <div className="pr-[11rem]">
        <HandLane drawing={dealerDrawing} packages={dealerPackages} tone="dealer" />
      </div>

      <CenterBar
        dealerTotalMB={dealerTotalMB}
        playerTotalMB={playerTotalMB}
        status={status}
        targetMB={targetMB}
      />

      <div className="pr-[11rem]">
        <HandLane drawing={isLoadingPlayer} packages={playerPackages} tone="player" />
      </div>

      <div className="pointer-events-none absolute right-2 top-1/2 z-20 -translate-y-1/2">
        <DeckStack active={dealerDrawing || isLoadingPlayer} />
      </div>

      <div className="absolute bottom-2 right-2 z-20">
        <GameControls
          isLoading={isLoadingPlayer}
          onHit={onHit}
          onNewGame={onNewGame}
          onStand={onStand}
          status={status}
        />
      </div>

      <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
        <GameStatus
          dealerTotalMB={dealerTotalMB}
          playerTotalMB={playerTotalMB}
          status={status}
          targetMB={targetMB}
        />
      </div>
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
        {/* Dealer (top) */}
        <div className="flex h-4 items-center justify-center">
          {showDealer && (
            <span
              key={`d-${status}`}
              className={cn(
                'animate-in fade-in-0 slide-in-from-top-1 duration-500 font-display text-[0.82rem] leading-none tabular-nums tracking-[0.04em]',
                dealerBust ? 'text-rose-300' : 'text-orange-200/90'
              )}
            >
              {dealerTotalMB.toFixed(2)}
              <span className="ml-0.5 text-[0.55em] opacity-50">MB</span>
            </span>
          )}
        </div>

        {/* Limit (center) */}
        <span className="font-display text-[0.7rem] leading-none tabular-nums tracking-[0.12em] text-amber-300/70">
          {targetMB.toFixed(2)}
          <span className="ml-0.5 text-[0.55em] opacity-50">MB</span>
        </span>

        {/* Player (bottom) */}
        <div className="flex h-4 items-center justify-center">
          {showPlayer && (
            <span
              className={cn(
                'animate-in fade-in-0 slide-in-from-bottom-1 duration-500 font-display text-[0.82rem] leading-none tabular-nums tracking-[0.04em]',
                playerBust ? 'text-rose-300' : 'text-sky-200/90'
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
          active && '-translate-y-1 rotate-[-2deg]'
        )}
      >
        <PackageCardBack label="npm" note={active ? 'dealing' : 'deck'} />
      </div>
    </div>
  )
}

interface HandLaneProps {
  drawing: boolean
  packages: PackageInfo[]
  tone: 'dealer' | 'player'
}

// How much each card peeks out from under the next when overlapping.
// Cards are 9.5rem wide; we want them to start overlapping once there are
// enough that they would otherwise overflow.
const CARD_W_REM = 9.5
const MIN_PEEK_REM = 2.5 // minimum visible strip when very crowded
const MAX_PEEK_REM = CARD_W_REM // full width when only 1 card

function peekRem(count: number): number {
  if (count <= 1) return MAX_PEEK_REM
  // Fill a container of roughly 100% width.  We can't know the px width here
  // so we use a fixed reference for the hand lane (~640px ≈ 40rem), which
  // accounts for the deck reserved on the right.
  const containerRem = 40
  const needed = CARD_W_REM + (count - 1) * MIN_PEEK_REM
  if (needed <= containerRem) {
    // All cards fit at full width — no overlap needed
    const natural = (containerRem - CARD_W_REM) / (count - 1)
    return Math.min(natural, MAX_PEEK_REM)
  }
  return MIN_PEEK_REM
}

function HandLane({ drawing, packages, tone }: HandLaneProps) {
  const all = drawing ? [...packages, null] : packages
  const count = all.length
  const peek = peekRem(count === 0 ? 1 : count)

  return (
    <div className="flex flex-col gap-2">
      {/* Card row — overlapping */}
      <div className="relative h-[13.5rem]">
        {count === 0 && (
          <PackageCardSlot label="empty" />
        )}
        {packages.map((pkg, i) => (
          <div
            key={`${pkg.name}-${i}`}
            className="absolute top-0 transition-all duration-300"
            style={{ left: `${i * peek}rem`, zIndex: i + 1 }}
          >
            <PackageCard packageInfo={pkg} variant={tone} />
          </div>
        ))}
        {drawing && (
          <div
            className="absolute top-0 transition-all duration-300"
            style={{ left: `${packages.length * peek}rem`, zIndex: packages.length + 1 }}
          >
            <PackageCardBack label="drawing" note="..." />
          </div>
        )}
      </div>
    </div>
  )
}
