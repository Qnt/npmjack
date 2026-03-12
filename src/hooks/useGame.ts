import { useState, useCallback, useEffect, useRef } from 'react'

import { getRandomPackage } from '#/lib/random-package'
import type { PackageInfo } from '#/lib/npm-registry'

export type GameStatus = 'idle' | 'playing' | 'dealerTurn' | 'won' | 'lost' | 'bust' | 'dealerBust'

export interface GameState {
  targetMB: number
  dealerTargetMB: number
  playerTotalBytes: number
  dealerTotalBytes: number
  playerPackages: PackageInfo[]
  dealerPackages: PackageInfo[]
  status: GameStatus
}

function generateTargetMB(): number {
  return 0.5 + Math.random() * 4.5
}

function generateDealerTargetMB(targetMB: number): number {
  return targetMB * (0.7 + Math.random() * 0.3)
}

function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024)
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    targetMB: generateTargetMB(),
    dealerTargetMB: 0,
    playerTotalBytes: 0,
    dealerTotalBytes: 0,
    playerPackages: [],
    dealerPackages: [],
    status: 'idle',
  })

  const dealerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingDealerPackageRef = useRef<string | null>(null)
  const [dealerPackageName, setDealerPackageName] = useState<string | null>(null)

  const startGame = useCallback(() => {
    const targetMB = generateTargetMB()
    setGameState({
      targetMB,
      dealerTargetMB: generateDealerTargetMB(targetMB),
      playerTotalBytes: 0,
      dealerTotalBytes: 0,
      playerPackages: [],
      dealerPackages: [],
      status: 'playing',
    })
    pendingDealerPackageRef.current = null
    setDealerPackageName(null)
  }, [])

  const getAllDrawnNames = useCallback((): Set<string> => {
    const names = new Set<string>()
    gameState.playerPackages.forEach(p => names.add(p.name))
    gameState.dealerPackages.forEach(p => names.add(p.name))
    return names
  }, [gameState.playerPackages, gameState.dealerPackages])

  const getNextPackage = useCallback((): string => {
    const drawnNames = getAllDrawnNames()
    let attempts = 0
    const maxAttempts = 100

    while (attempts < maxAttempts) {
      const packageName = getRandomPackage()
      if (!drawnNames.has(packageName)) {
        return packageName
      }
      attempts++
    }

    return getRandomPackage()
  }, [getAllDrawnNames])

  const playerHit = useCallback((packageInfo: PackageInfo) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev

      if (packageInfo.unpackedSize === null) {
        return prev
      }

      const newTotalBytes = prev.playerTotalBytes + packageInfo.unpackedSize
      const newTotalMB = bytesToMB(newTotalBytes)

      if (newTotalMB > prev.targetMB) {
        return {
          ...prev,
          playerTotalBytes: newTotalBytes,
          playerPackages: [...prev.playerPackages, packageInfo],
          status: 'bust',
        }
      }

      return {
        ...prev,
        playerTotalBytes: newTotalBytes,
        playerPackages: [...prev.playerPackages, packageInfo],
      }
    })
  }, [])

  const dealerDraw = useCallback((packageInfo: PackageInfo) => {
    setGameState(prev => {
      if (prev.status !== 'dealerTurn') return prev

      if (packageInfo.unpackedSize === null) {
        return prev
      }

      const newTotalBytes = prev.dealerTotalBytes + packageInfo.unpackedSize
      const newTotalMB = bytesToMB(newTotalBytes)

      if (newTotalMB > prev.targetMB) {
        return {
          ...prev,
          dealerTotalBytes: newTotalBytes,
          dealerPackages: [...prev.dealerPackages, packageInfo],
          status: 'dealerBust',
        }
      }

      if (newTotalMB >= prev.dealerTargetMB) {
        const playerMB = bytesToMB(prev.playerTotalBytes)
        const dealerMB = newTotalMB
        const playerDiff = Math.abs(prev.targetMB - playerMB)
        const dealerDiff = Math.abs(prev.targetMB - dealerMB)

        return {
          ...prev,
          dealerTotalBytes: newTotalBytes,
          dealerPackages: [...prev.dealerPackages, packageInfo],
          status: playerDiff <= dealerDiff ? 'won' : 'lost',
        }
      }

      return {
        ...prev,
        dealerTotalBytes: newTotalBytes,
        dealerPackages: [...prev.dealerPackages, packageInfo],
      }
    })
  }, [])

  const stand = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev
      return {
        ...prev,
        dealerTargetMB: generateDealerTargetMB(prev.targetMB),
        status: 'dealerTurn',
      }
    })
  }, [])

  useEffect(() => {
    if (gameState.status === 'dealerTurn') {
      dealerIntervalRef.current = setInterval(() => {
        if (!pendingDealerPackageRef.current) {
          const packageName = getNextPackage()
          pendingDealerPackageRef.current = packageName
          setDealerPackageName(packageName)
        }
      }, 1000)

      return () => {
        if (dealerIntervalRef.current) {
          clearInterval(dealerIntervalRef.current)
          dealerIntervalRef.current = null
        }
      }
    }
  }, [gameState.status, getNextPackage])

  const handleDealerPackageLoaded = useCallback((packageInfo: PackageInfo) => {
    dealerDraw(packageInfo)
    pendingDealerPackageRef.current = null
    setDealerPackageName(null)
  }, [dealerDraw])

  const playerTotalMB = bytesToMB(gameState.playerTotalBytes)
  const dealerTotalMB = bytesToMB(gameState.dealerTotalBytes)

  return {
    ...gameState,
    playerTotalMB,
    dealerTotalMB,
    startGame,
    playerHit,
    stand,
    getNextPackage,
    dealerPackageName,
    handleDealerPackageLoaded,
  }
}
