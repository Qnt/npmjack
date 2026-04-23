import { useState, useCallback, useEffect, useRef } from 'react'

import { usePackagePool } from '#/hooks/usePackagePool'
import type { PackageInfo } from '#/lib/npm-registry'

export type GameStatus = 'idle' | 'playing' | 'dealerTurn' | 'won' | 'lost' | 'bust' | 'dealerBust'

export interface PlayerDraw {
  packageName: string
  drawId: number
}

export interface GameState {
  targetMB: number
  dealerTargetMB: number
  playerTotalBytes: number
  dealerTotalBytes: number
  playerPackages: PackageInfo[]
  dealerPackages: PackageInfo[]
  status: GameStatus
  playerDraw: PlayerDraw | null
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
  const packagePoolQuery = usePackagePool()
  
  const [gameState, setGameState] = useState<GameState>({
    targetMB: generateTargetMB(),
    dealerTargetMB: 0,
    playerTotalBytes: 0,
    dealerTotalBytes: 0,
    playerPackages: [],
    dealerPackages: [],
    status: 'idle',
    playerDraw: null,
  })

  const dealerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dealerPauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dealerPausingRef = useRef(false)
  const pendingDealerPackageRef = useRef<string | null>(null)
  const [dealerPackageName, setDealerPackageName] = useState<string | null>(null)
  const usedPackageNamesRef = useRef<Set<string>>(new Set())
  const noSizePackageNamesRef = useRef<Set<string>>(new Set())
  const drawIdRef = useRef(0)
  const packagePoolRef = useRef<string[]>([])

  if (packagePoolQuery.data && packagePoolRef.current !== packagePoolQuery.data) {
    packagePoolRef.current = packagePoolQuery.data
  }

  const startGame = useCallback(() => {
    const targetMB = generateTargetMB()
    usedPackageNamesRef.current = new Set()
    setGameState({
      targetMB,
      dealerTargetMB: generateDealerTargetMB(targetMB),
      playerTotalBytes: 0,
      dealerTotalBytes: 0,
      playerPackages: [],
      dealerPackages: [],
      status: 'playing',
      playerDraw: null,
    })
    pendingDealerPackageRef.current = null
    dealerPausingRef.current = false
    if (dealerPauseTimeoutRef.current) {
      clearTimeout(dealerPauseTimeoutRef.current)
      dealerPauseTimeoutRef.current = null
    }
    setDealerPackageName(null)
  }, [])

  const getNextPackage = useCallback((): string | null => {
    const pool = packagePoolRef.current
    if (pool.length === 0) {
      return 'react'
    }

    const noSizePackages = noSizePackageNamesRef.current
    const availablePackages = pool.filter(
      name => !usedPackageNamesRef.current.has(name) && !noSizePackages.has(name)
    )

    if (availablePackages.length > 0) {
      return availablePackages[Math.floor(Math.random() * availablePackages.length)]!
    }

    const fallbackPackages = pool.filter(name => !noSizePackages.has(name))
    if (fallbackPackages.length > 0) {
      return fallbackPackages[Math.floor(Math.random() * fallbackPackages.length)]!
    }

    return null
  }, [])

  const drawPlayerPackage = useCallback(() => {
    const packageName = getNextPackage()
    if (!packageName) return
    const drawId = ++drawIdRef.current
    setGameState(prev => ({ ...prev, playerDraw: { packageName, drawId } }))
  }, [getNextPackage])

  const clearPlayerDraw = useCallback(() => {
    setGameState(prev => ({ ...prev, playerDraw: null }))
  }, [])

  const playerHit = useCallback((packageInfo: PackageInfo) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev

      const packageBytes = packageInfo.unpackedSize ?? 0

      usedPackageNamesRef.current.add(packageInfo.name)

      const newTotalBytes = prev.playerTotalBytes + packageBytes
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

      const packageBytes = packageInfo.unpackedSize ?? 0

      usedPackageNamesRef.current.add(packageInfo.name)

      const newTotalBytes = prev.dealerTotalBytes + packageBytes
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

  const rejectPlayerPackage = useCallback((packageName: string) => {
    noSizePackageNamesRef.current.add(packageName)

    setGameState(prev => {
      if (!prev.playerDraw || prev.playerDraw.packageName !== packageName) {
        return prev
      }

      const nextPackageName = getNextPackage()
      if (!nextPackageName) {
        return {
          ...prev,
          playerDraw: null,
        }
      }

      const drawId = ++drawIdRef.current
      return {
        ...prev,
        playerDraw: { packageName: nextPackageName, drawId },
      }
    })
  }, [getNextPackage])

  const rejectDealerPackage = useCallback((packageName: string) => {
    noSizePackageNamesRef.current.add(packageName)

    if (pendingDealerPackageRef.current === packageName) {
      pendingDealerPackageRef.current = null
    }
    setDealerPackageName(current => (current === packageName ? null : current))
  }, [])

  useEffect(() => {
    if (gameState.status === 'dealerTurn') {
      dealerIntervalRef.current = setInterval(() => {
        if (!pendingDealerPackageRef.current && !dealerPausingRef.current) {
          const packageName = getNextPackage()
          if (!packageName) return
          pendingDealerPackageRef.current = packageName
          setDealerPackageName(packageName)
        }
      }, 200)

      return () => {
        if (dealerIntervalRef.current) {
          clearInterval(dealerIntervalRef.current)
          dealerIntervalRef.current = null
        }
        if (dealerPauseTimeoutRef.current) {
          clearTimeout(dealerPauseTimeoutRef.current)
          dealerPauseTimeoutRef.current = null
        }
        dealerPausingRef.current = false
      }
    }
  }, [gameState.status, getNextPackage])

  const handleDealerPackageLoaded = useCallback((packageInfo: PackageInfo) => {
    dealerDraw(packageInfo)
    pendingDealerPackageRef.current = null
    setDealerPackageName(null)
    dealerPausingRef.current = true
    dealerPauseTimeoutRef.current = setTimeout(() => {
      dealerPausingRef.current = false
      dealerPauseTimeoutRef.current = null
    }, 600 + Math.random() * 800)
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
    drawPlayerPackage,
    clearPlayerDraw,
    rejectPlayerPackage,
    rejectDealerPackage,
    dealerPackageName,
    handleDealerPackageLoaded,
  }
}
