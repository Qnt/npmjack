// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockUseGameBoard = vi.fn()

vi.mock('#/components/game/PlayBoard', () => ({
  PlayBoard: () => <div data-testid="play-board" />,
}))

vi.mock('#/hooks/useGameBoard', () => ({
  useGameBoard: (...args: unknown[]) => mockUseGameBoard(...args),
}))

import { GameScreen, Route } from './game'

afterEach(() => {
  mockUseGameBoard.mockReset()
})

type InitialRoundLoader = () => {
  dealerTargetMB: number
  targetMB: number
}

describe('/game route', () => {
  it('loads a randomized initial round snapshot', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValueOnce(0.2).mockReturnValueOnce(0.4)

    const loader = Route.options.loader as InitialRoundLoader | undefined

    expect(loader?.()).toEqual({
      dealerTargetMB: 1.148,
      targetMB: 1.4,
    })

    expect(randomSpy).toHaveBeenCalledTimes(2)
  })

  it('passes loader-generated initial round data into useGameBoard', () => {
    const initialRound = {
      dealerTargetMB: 1.4,
      targetMB: 1.8,
    }

    mockUseGameBoard.mockReturnValue({
      game: {
        dealerPackages: [],
        dealerTotalMB: 0,
        drawPlayerPackage: vi.fn(),
        playerPackages: [],
        playerTotalMB: 0,
        stand: vi.fn(),
        status: 'playing',
        targetMB: initialRound.targetMB,
      },
      handleRetryDeck: vi.fn(),
      handleStartGame: vi.fn(),
      isDeckReady: true,
      isLoadingDealer: false,
      isLoadingDeck: false,
      isLoadingPlayer: false,
      packagePoolError: false,
    })

    render(<GameScreen initialRound={initialRound} />)

    expect(mockUseGameBoard).toHaveBeenCalledWith(initialRound)
  })

  it('renders retry banner and retries the deck when package pool fails', () => {
    const handleRetryDeck = vi.fn()

    mockUseGameBoard.mockReturnValue({
      game: {
        dealerPackages: [],
        dealerTotalMB: 0,
        drawPlayerPackage: vi.fn(),
        playerPackages: [],
        playerTotalMB: 0,
        stand: vi.fn(),
        status: 'playing',
        targetMB: 1.8,
      },
      handleRetryDeck,
      handleStartGame: vi.fn(),
      isDeckReady: false,
      isLoadingDealer: false,
      isLoadingDeck: false,
      isLoadingPlayer: false,
      packagePoolError: true,
    })

    render(
      <GameScreen
        initialRound={{
          dealerTargetMB: 1.4,
          targetMB: 1.8,
        }}
      />,
    )

    expect(screen.getByRole('alert')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /retry deck/i }))
    expect(handleRetryDeck).toHaveBeenCalledTimes(1)
  })
})
