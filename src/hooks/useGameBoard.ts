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
  } = usePackageInfo(game.playerDraw?.packageName ?? null, game.playerDraw?.drawId)
  const {
    data: dealerPackageInfo,
    isError: isDealerPackageError,
    isLoading: isLoadingDealer,
  } = usePackageInfo(game.dealerPackageName)

  useEffect(() => {
    game.setPackagePool(packagePoolQuery.data)
  }, [game, packagePoolQuery.data])

  const markPlayerDrawProcessed = (drawId: number) => {
    processedDrawIdRef.current = drawId
  }

  const isPlayerDrawProcessed = (drawId: number) => processedDrawIdRef.current === drawId

  const handlePlayerDrawError = () => {
    if (!game.playerDraw || !isPlayerPackageError) return false
    if (isPlayerDrawProcessed(game.playerDraw.drawId)) return true

    markPlayerDrawProcessed(game.playerDraw.drawId)
    game.skipPlayerPackage(game.playerDraw.packageName)
    return true
  }

  const handlePlayerDrawLoaded = () => {
    if (!playerPackageInfo || isLoadingPlayer || !game.playerDraw) return false
    if (isPlayerDrawProcessed(game.playerDraw.drawId)) return true

    if (playerPackageInfo.name !== game.playerDraw.packageName) {
      return true
    }

    if (playerPackageInfo.unpackedSize === null) {
      markPlayerDrawProcessed(game.playerDraw.drawId)
      game.rejectPlayerPackage(game.playerDraw.packageName)
      return true
    }

    markPlayerDrawProcessed(game.playerDraw.drawId)
    game.playerHit(playerPackageInfo)
    game.clearPlayerDraw()
    return true
  }

  const handleDealerDrawError = () => {
    if (!game.dealerPackageName || !isDealerPackageError) return false
    game.skipDealerPackage(game.dealerPackageName)
    return true
  }

  const handleDealerDrawLoaded = () => {
    if (!dealerPackageInfo || isLoadingDealer || !game.dealerPackageName) return false

    if (dealerPackageInfo.unpackedSize === null) {
      game.rejectDealerPackage(game.dealerPackageName)
      return true
    }

    const isNewPackage =
      !game.dealerPackages.some((pkg) => pkg.name === dealerPackageInfo.name) &&
      !game.playerPackages.some((pkg) => pkg.name === dealerPackageInfo.name)

    if (isNewPackage) {
      game.handleDealerPackageLoaded(dealerPackageInfo)
      return true
    }

    game.skipDealerPackage(game.dealerPackageName)
    return true
  }

  useEffect(() => {
    if (handlePlayerDrawError()) return
    handlePlayerDrawLoaded()
  }, [game, isLoadingPlayer, isPlayerPackageError, playerPackageInfo])

  useEffect(() => {
    if (handleDealerDrawError()) return
    handleDealerDrawLoaded()
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
