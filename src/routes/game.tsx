import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { FeltOverlay } from '#/components/game/FeltOverlay'
import { GameControls } from '#/components/game/GameControls'
import { GameStatus } from '#/components/game/GameStatus'
import { PackageCard, PackageCardBack } from '#/components/game/PackageCard'
import { usePackageInfo } from '#/hooks/usePackageInfo'
import { useGame } from '#/hooks/useGame'
import { cn } from '#/lib/utils'

import type { GameStatus as RoundStatus } from '#/hooks/useGame'
import type { PackageInfo } from '#/lib/npm-registry'

export const Route = createFileRoute('/game')({ component: Game })

function Game() {
  const game = useGame()
  const processedDrawIdRef = useRef<number | null>(null)
  const {
    data: playerPackageInfo,
    isError: isPlayerPackageError,
    isLoading: isLoadingPlayer,
  } = usePackageInfo(
    game.playerDraw?.packageName ?? null,
    game.playerDraw?.drawId
  )
  const {
    data: dealerPackageInfo,
    isError: isDealerPackageError,
    isLoading: isLoadingDealer,
  } = usePackageInfo(
    game.dealerPackageName
  )

  const handleStartGame = () => {
    processedDrawIdRef.current = null
    game.startGame()
  }

  useEffect(() => {
    handleStartGame()
  }, [])

  useEffect(() => {
    if (game.playerDraw && isPlayerPackageError) {
      if (processedDrawIdRef.current === game.playerDraw.drawId) return
      processedDrawIdRef.current = game.playerDraw.drawId
      game.skipPlayerPackage(game.playerDraw.packageName)
      return
    }

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
  }, [playerPackageInfo, isLoadingPlayer, isPlayerPackageError, game.playerDraw, game])

  useEffect(() => {
    if (game.dealerPackageName && isDealerPackageError) {
      game.skipDealerPackage(game.dealerPackageName)
      return
    }

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
  }, [dealerPackageInfo, isLoadingDealer, isDealerPackageError, game])

  return (
    <div className="flex min-h-screen flex-col">
      <main className="relative flex flex-1 flex-col overflow-hidden p-3 sm:p-5">
        <div
          className="relative flex flex-1 flex-col overflow-hidden rounded-[24px] border-[3px] border-black/80 bg-[radial-gradient(circle_at_top,rgba(120,180,160,0.18),transparent_55%),linear-gradient(160deg,#0e2e28_0%,#061617_55%,#0a2028_100%)] p-4 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.05),0_40px_80px_rgba(0,0,0,0.55)] sm:p-6"
          style={{ viewTransitionName: 'felt-table' }}
        >
          <FeltOverlay />

          <div className="relative z-10 flex flex-1 flex-col">
            <PlayBoard
              dealerDrawing={isLoadingDealer}
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
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        <HandLane drawing={dealerDrawing} packages={dealerPackages} />
      </div>

      <CenterBar
        dealerTotalMB={dealerTotalMB}
        playerTotalMB={playerTotalMB}
        status={status}
        targetMB={targetMB}
      />

      <div className="pr-[11rem]">
        <HandLane drawing={isLoadingPlayer} packages={playerPackages} />
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
          playerCardCount={playerPackages.length}
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
        <div className="flex h-4 items-center justify-center">
          {showDealer && (
            <span
              key={`d-${status}`}
              className={cn(
                'animate-in fade-in-0 slide-in-from-top-1 duration-500 font-display text-[0.95rem] leading-none tabular-nums tracking-[0.04em]',
                dealerBust ? 'text-rose-300' : 'text-orange-200/90'
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
                'animate-in fade-in-0 slide-in-from-bottom-1 duration-500 font-display text-[0.95rem] leading-none tabular-nums tracking-[0.04em]',
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
}

const CARD_W_REM = 9.5
const MIN_PEEK_REM = 2.5
const MAX_PEEK_REM = CARD_W_REM

function peekRem(count: number, containerRem: number): number {
  if (count <= 1) return MAX_PEEK_REM
  const needed = CARD_W_REM + (count - 1) * MIN_PEEK_REM
  if (needed <= containerRem) {
    const natural = (containerRem - CARD_W_REM) / (count - 1)
    return Math.min(natural, MAX_PEEK_REM)
  }
  return MIN_PEEK_REM
}

function HandLane({ drawing, packages }: HandLaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerPx, setContainerPx] = useState(640)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth
      setContainerPx(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (openIndex !== null && openIndex >= packages.length) setOpenIndex(null)
  }, [packages.length, openIndex])

  const containerRem = containerPx / 16
  const count = packages.length + (drawing ? 1 : 0)
  const peek = peekRem(count === 0 ? 1 : count, containerRem)
  const laneWidthRem = CARD_W_REM + Math.max(0, count - 1) * peek
  const startLeftRem = (containerRem - laneWidthRem) / 2

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <div className="relative h-[13.5rem]">
        {packages.map((pkg, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={`${pkg.name}-${i}`}
              className="absolute top-0 transition-all duration-300"
              style={{ left: `${startLeftRem + i * peek}rem`, zIndex: isOpen ? 60 : i + 1 }}
            >
              <PackageCard
                onClose={() => setOpenIndex(null)}
                onToggle={() => setOpenIndex(isOpen ? null : i)}
                open={isOpen}
                packageInfo={pkg}
              />
            </div>
          )
        })}
        {drawing && (
          <div
            className="absolute top-0 transition-all duration-300"
            style={{ left: `${startLeftRem + packages.length * peek}rem`, zIndex: packages.length + 1 }}
          >
            <PackageCardBack label="drawing" note="..." loading />
          </div>
        )}
      </div>
    </div>
  )
}
