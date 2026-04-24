import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Dice5 } from 'lucide-react'

import { FeltOverlay } from '#/components/game/FeltOverlay'
import { PlayBoard } from '#/components/game/PlayBoard'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { createInitialRound } from '#/hooks/useGame'
import { useGameBoard } from '#/hooks/useGameBoard'

export const Route = createFileRoute('/game')({
  loader: () => createInitialRound(),
  component: GameRoute,
})

function GameRoute() {
  const initialRound = Route.useLoaderData()

  return <GameScreen initialRound={initialRound} />
}

export function GameScreen({
  initialRound,
}: {
  initialRound: ReturnType<typeof createInitialRound>
}) {
  const {
    game,
    handleRetryDeck,
    handleStartGame,
    isDeckReady,
    isLoadingDeck,
    isLoadingDealer,
    isLoadingPlayer,
    packagePoolError,
  } = useGameBoard(initialRound)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="relative flex flex-1 flex-col overflow-hidden p-3 sm:p-5">
        <div
          className="relative flex flex-1 flex-col overflow-hidden rounded-[24px] border-[3px] border-black/80 bg-[radial-gradient(circle_at_top,rgba(120,180,160,0.18),transparent_55%),linear-gradient(160deg,#0e2e28_0%,#061617_55%,#0a2028_100%)] p-4 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.05),0_40px_80px_rgba(0,0,0,0.55)] sm:p-6"
          style={{ viewTransitionName: 'felt-table' }}
        >
          <FeltOverlay />

          <div className="relative z-10 flex flex-1 flex-col">
            {packagePoolError ? <PackagePoolError onRetry={handleRetryDeck} /> : null}
            <PlayBoard
              dealerDrawing={isLoadingDealer}
              dealerPackages={game.dealerPackages}
              dealerTotalMB={game.dealerTotalMB}
              isLoadingDeck={isLoadingDeck || !isDeckReady}
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

function PackagePoolError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert className="mb-4 border-rose-400/25 bg-rose-500/10 text-rose-50">
      <AlertCircle className="size-4" />
      <AlertTitle className="font-display uppercase tracking-[0.18em]">Deck unavailable</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4 text-rose-100/80">
        <span>Couldn&apos;t load the package pool. Start a fresh round to retry.</span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md border border-rose-200/30 bg-rose-400/15 px-3 py-1.5 font-display text-[0.72rem] uppercase tracking-[0.18em] text-rose-50 transition-colors hover:bg-rose-400/25"
        >
          <Dice5 className="size-3.5" />
          Retry
        </button>
      </AlertDescription>
    </Alert>
  )
}
