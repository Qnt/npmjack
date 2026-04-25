// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  canStartPlayerDraw,
  createNewGameState,
  finalizeDealerTurn,
  resolveRoundOutcome,
  selectNextPackage,
  transitionToDealerTurn,
  useGame,
} from './useGame'

import type { GameState } from './useGame'

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    dealerPackages: [],
    dealerTargetMB: 1.5,
    dealerTotalBytes: 0,
    playerDraw: null,
    playerPackages: [],
    playerTotalBytes: 0,
    status: 'playing',
    targetMB: 2,
    ...overrides,
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useGame helpers', () => {
  it('keeps dealer target unchanged when transitioning to dealer turn', () => {
    const state = createState({ dealerTargetMB: 1.23 })

    const nextState = transitionToDealerTurn(state)

    expect(nextState.status).toBe('dealerTurn')
    expect(nextState.dealerTargetMB).toBe(1.23)
  })

  it('returns null when every package is skipped or invalid', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    const selected = selectNextPackage(
      ['react'],
      new Set<string>(),
      new Set<string>(),
      new Set<string>(['react']),
    )

    expect(selected).toBeNull()
    expect(randomSpy).not.toHaveBeenCalled()
  })

  it('does not fall back to packages already used this round', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    const selected = selectNextPackage(
      ['react'],
      new Set<string>(['react']),
      new Set<string>(),
      new Set<string>(),
    )

    expect(selected).toBeNull()
    expect(randomSpy).not.toHaveBeenCalled()
  })

  it('can create a deterministic initial state for SSR', () => {
    const state = createNewGameState({ targetMB: 2, dealerTargetMB: 1.5 })

    expect(state.targetMB).toBe(2)
    expect(state.dealerTargetMB).toBe(1.5)
    expect(state.status).toBe('playing')
  })

  it('does not allow player draws outside an idle playing state', () => {
    expect(canStartPlayerDraw(createState())).toBe(true)
    expect(canStartPlayerDraw(createState({ status: 'dealerTurn' }))).toBe(false)
    expect(
      canStartPlayerDraw(createState({ playerDraw: { packageName: 'react', drawId: 1 } })),
    ).toBe(false)
  })

  it('finalizes an empty dealer turn instead of leaving dealerTurn active', () => {
    const state = createState({
      dealerTotalBytes: 0,
      playerTotalBytes: 100,
      status: 'dealerTurn',
      targetMB: 2,
    })

    const nextState = finalizeDealerTurn(state)

    expect(nextState.status).toBe('won')
  })

  it('resolves round outcome by closeness to target', () => {
    const targetMB = 2
    const playerTotalBytes = Math.round(1.8 * 1024 * 1024)
    const dealerTotalBytes = Math.round(1.9 * 1024 * 1024)

    expect(resolveRoundOutcome(targetMB, playerTotalBytes, dealerTotalBytes)).toBe('lost')
  })
})

describe('useGame hook lifecycle', () => {
  it('replaces player draw with a new draw id after rejectPlayerPackage', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGame({ dealerTargetMB: 1.3, targetMB: 1.8 }))

    act(() => {
      result.current.setPackagePool(['react', 'vue'])
      result.current.drawPlayerPackage()
    })

    const initialDraw = result.current.playerDraw

    expect(initialDraw).toBeTruthy()
    expect(initialDraw?.packageName).toBe('react')

    act(() => {
      result.current.rejectPlayerPackage('react')
    })

    expect(result.current.playerDraw).toBeTruthy()
    expect(result.current.playerDraw?.packageName).toBe('vue')
    expect(result.current.playerDraw?.drawId).toBeGreaterThan(initialDraw!.drawId)
    expect(randomSpy).toHaveBeenCalled()
  })

  it('continues dealer loop after skipDealerPackage clears pending package', () => {
    vi.useFakeTimers()
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)

    const { result } = renderHook(() => useGame({ dealerTargetMB: 1.2, targetMB: 2 }))

    act(() => {
      result.current.setPackagePool(['react', 'vue'])
      result.current.stand()
    })

    act(() => {
      vi.advanceTimersByTime(220)
    })

    expect(result.current.dealerPackageName).toBe('react')

    act(() => {
      result.current.skipDealerPackage('react')
    })

    expect(result.current.dealerPackageName).toBeNull()

    act(() => {
      vi.advanceTimersByTime(220)
    })

    expect(result.current.dealerPackageName).toBe('vue')
    expect(randomSpy).toHaveBeenCalled()
  })
})
