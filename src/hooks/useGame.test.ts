import { describe, expect, it, vi } from 'vitest'

import {
  finalizeDealerTurn,
  resolveRoundOutcome,
  selectNextPackage,
  transitionToDealerTurn,
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

    expect(
      resolveRoundOutcome(targetMB, playerTotalBytes, dealerTotalBytes),
    ).toBe('lost')
  })
})
