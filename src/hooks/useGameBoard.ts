import { useEffect, useRef } from 'react'

import { usePackageInfo } from '#/hooks/usePackageInfo'
import { usePackagePool } from '#/hooks/usePackagePool'
import { useGame } from '#/hooks/useGame'

export function useGameBoard(initialRound?: Parameters<typeof useGame>[0]) {
  const game = useGame(initialRound)
  const processedDrawIdRef = useRef<number | null>(null)
  const packagePoolQuery = usePackagePool()
  const isDeckReady = packagePoolQuery.isSuccess && packagePoolQuery.data.length > 0
  const {
    data: playerPackageInfo,
    isError: isPlayerPackageError,
    isLoading: isLoadingPlayer,
  } = usePackageInfo(
    game.playerDraw?.packageName ?? null,
    game.playerDraw?.drawId,
  )
  const {
    data: dealerPackageInfo,
    isError: isDealerPackageError,
    isLoading: isLoadingDealer,
  } = usePackageInfo(game.dealerPackageName)

  useEffect(() => {
    game.setPackagePool(packagePoolQuery.data)
  }, [game, packagePoolQuery.data])

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
  }, [game, isLoadingPlayer, isPlayerPackageError, playerPackageInfo])

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
        !game.dealerPackages.some(pkg => pkg.name === dealerPackageInfo.name) &&
        !game.playerPackages.some(pkg => pkg.name === dealerPackageInfo.name)

      if (isNewPackage) {
        game.handleDealerPackageLoaded(dealerPackageInfo)
      }
    }
  }, [dealerPackageInfo, game, isDealerPackageError, isLoadingDealer])

  const handleStartGame = () => {
    processedDrawIdRef.current = null
    game.startGame()
  }

  const handleRetryDeck = () => {
    processedDrawIdRef.current = null
    void packagePoolQuery.refetch()
    game.startGame()
  }

  return {
    game,
    handleStartGame,
    handleRetryDeck,
    isDeckReady,
    isLoadingDeck: packagePoolQuery.isLoading,
    isLoadingDealer,
    isLoadingPlayer,
    packagePoolError: packagePoolQuery.isError,
  }
}
