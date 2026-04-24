// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GameControls } from './GameControls'

describe('GameControls', () => {
  it('shows a disabled hit button while the deck is loading', () => {
    render(
      <GameControls
        isLoading
        onHit={vi.fn()}
        onNewGame={vi.fn()}
        onStand={vi.fn()}
        playerCardCount={0}
        status="playing"
      />,
    )

    const hitButton = screen.getByRole('button', { name: /hit/i }) as HTMLButtonElement

    expect(hitButton.disabled).toBe(true)
  })

  it('shows new round for finished games', () => {
    render(
      <GameControls
        isLoading={false}
        onHit={vi.fn()}
        onNewGame={vi.fn()}
        onStand={vi.fn()}
        playerCardCount={2}
        status="won"
      />,
    )

    expect(screen.getByRole('button', { name: /new round/i })).toBeTruthy()
  })
})
