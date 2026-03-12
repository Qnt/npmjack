import { Dice5 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import type { GameStatus } from '#/hooks/useGame'

interface GameControlsProps {
  status: GameStatus
  isLoading: boolean
  onHit: () => void
  onStand: () => void
  onNewGame: () => void
}

export function GameControls({
  status,
  isLoading,
  onHit,
  onStand,
  onNewGame,
}: GameControlsProps) {
  const isGameOver = status === 'won' || status === 'lost' || status === 'bust' || status === 'dealerBust'

  if (status === 'idle') {
    return (
      <div className="text-center">
        <Button onClick={onNewGame} size="lg">
          Start Game
        </Button>
      </div>
    )
  }

  if (status === 'playing') {
    return (
      <div className="flex justify-center gap-4">
        <Button onClick={onHit} disabled={isLoading} size="lg">
          {isLoading ? (
            <Spinner className="mr-2" />
          ) : (
            <Dice5 className={isLoading ? 'animate-spin' : ''} size={20} />
          )}
          Hit
        </Button>
        <Button onClick={onStand} disabled={isLoading} size="lg" variant="secondary">
          Stand
        </Button>
      </div>
    )
  }

  if (isGameOver) {
    return (
      <div className="flex justify-center">
        <Button onClick={onNewGame} size="lg">
          New Game
        </Button>
      </div>
    )
  }

  return null
}
