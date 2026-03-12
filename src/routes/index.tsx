import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

import { usePackageInfo } from '#/hooks/usePackageInfo'
import { useGame } from '#/hooks/useGame'
import { TargetDisplay } from '#/components/game/TargetDisplay'
import { PlayerCard } from '#/components/game/PlayerCard'
import { GameStatus } from '#/components/game/GameStatus'
import { GameControls } from '#/components/game/GameControls'
import { LoadingIndicator } from '#/components/game/LoadingIndicator'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const game = useGame()
  const [pendingPlayerPackage, setPendingPlayerPackage] = useState<string | null>(null)
  const { data: playerPackageInfo, isLoading: isLoadingPlayer } = usePackageInfo(pendingPlayerPackage)
  const { data: dealerPackageInfo, isLoading: isLoadingDealer } = usePackageInfo(game.dealerPackageName)

  useEffect(() => {
    if (playerPackageInfo && !isLoadingPlayer && pendingPlayerPackage) {
      const isNewPackage = !game.playerPackages.some(p => p.name === playerPackageInfo.name)
      if (isNewPackage) {
        game.playerHit(playerPackageInfo)
        setPendingPlayerPackage(null)
      }
    }
  }, [playerPackageInfo, isLoadingPlayer, pendingPlayerPackage, game])

  useEffect(() => {
    if (dealerPackageInfo && !isLoadingDealer && game.dealerPackageName) {
      const isNewPackage = !game.dealerPackages.some(p => p.name === dealerPackageInfo.name) &&
        !game.playerPackages.some(p => p.name === dealerPackageInfo.name)
      if (isNewPackage) {
        game.handleDealerPackageLoaded(dealerPackageInfo)
      }
    }
  }, [dealerPackageInfo, isLoadingDealer, game])

  const handleStartGame = () => {
    game.startGame()
    setPendingPlayerPackage(null)
  }

  const handleHit = () => {
    const packageName = game.getNextPackage()
    setPendingPlayerPackage(packageName)
  }

  const handleStand = () => {
    game.stand()
    setPendingPlayerPackage(null)
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-foreground">npmjack</h1>

        {game.status === 'idle' && (
          <div className="text-center">
            <p className="mb-6 text-muted-foreground">
              Draw npm packages to get as close as possible to the target size in MB.
              Beat the dealer without going over!
            </p>
            <GameControls
              status={game.status}
              isLoading={false}
              onHit={handleHit}
              onStand={handleStand}
              onNewGame={handleStartGame}
            />
          </div>
        )}

        {game.status !== 'idle' && (
          <>
            <TargetDisplay targetMB={game.targetMB} />

            <div className="mb-6 grid grid-cols-2 gap-4">
              <PlayerCard
                title="You"
                icon="user"
                totalMB={game.playerTotalMB}
                packages={game.playerPackages}
              />
              <PlayerCard
                title="Dealer"
                icon="dealer"
                totalMB={game.dealerTotalMB}
                packages={game.dealerPackages}
                isDrawing={game.status === 'dealerTurn'}
              />
            </div>

            {isLoadingPlayer && <LoadingIndicator />}

            <GameStatus
              status={game.status}
              playerTotalMB={game.playerTotalMB}
              dealerTotalMB={game.dealerTotalMB}
              targetMB={game.targetMB}
            />

            <GameControls
              status={game.status}
              isLoading={isLoadingPlayer}
              onHit={handleHit}
              onStand={handleStand}
              onNewGame={handleStartGame}
            />
          </>
        )}
      </div>
    </main>
  )
}
