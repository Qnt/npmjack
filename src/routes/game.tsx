import { createFileRoute } from '@tanstack/react-router'

import { PlayBoard } from '#/components/game/PlayBoard'
import { TableFrame } from '#/components/game/TableFrame'
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
    <TableFrame>
      <div className="flex flex-1 flex-col gap-4">
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
    </TableFrame>
  )
}

function PackagePoolError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-[20px] border border-rose-400/30 bg-rose-500/10 p-4 text-rose-50 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <div className="font-display text-[0.72rem] uppercase tracking-[0.18em]">
          Deck unavailable
        </div>
        <p className="mt-1 text-sm text-rose-100/80">
          Couldn&apos;t load the package pool. Start a fresh round to retry.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-[12px] border border-rose-200/30 bg-rose-400/15 px-4 py-2 font-display text-[0.72rem] uppercase tracking-[0.18em] text-rose-50 transition-colors hover:bg-rose-400/25"
      >
        Retry deck
      </button>
    </div>
  )
}
