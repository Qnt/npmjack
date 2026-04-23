import { Dice5, RefreshCw, Shield } from 'lucide-react'

import { Spinner } from '#/components/ui/spinner'
import { cn } from '#/lib/utils'

import type { GameStatus } from '#/hooks/useGame'

interface GameControlsProps {
  status: GameStatus
  isLoading: boolean
  onHit: () => void
  onStand: () => void
  onNewGame: () => void
}

const chunkyButton =
  'group inline-flex items-center justify-center gap-1.5 rounded-[11px] border-[3px] border-black/85 px-4 py-2 font-display text-[0.62rem] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-60'

export function GameControls({
  status,
  isLoading,
  onHit,
  onStand,
  onNewGame,
}: GameControlsProps) {
  const isGameOver =
    status === 'won' || status === 'lost' || status === 'bust' || status === 'dealerBust'

  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={onNewGame}
        className={cn(
          chunkyButton,
          'bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[0_6px_0_#4a0f12,0_12px_24px_rgba(0,0,0,0.5)] active:shadow-[0_2px_0_#4a0f12,0_5px_10px_rgba(0,0,0,0.5)]'
        )}
      >
        <Dice5 className="size-4" />
        Deal
      </button>
    )
  }

  if (status === 'playing') {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onHit}
          disabled={isLoading}
          className={cn(
            chunkyButton,
            'bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[0_6px_0_#4a0f12,0_12px_20px_rgba(0,0,0,0.45)] active:shadow-[0_2px_0_#4a0f12,0_5px_10px_rgba(0,0,0,0.45)]'
          )}
        >
          {isLoading ? <Spinner className="size-4" /> : <Dice5 className="size-4" />}
          Hit
        </button>
        <button
          type="button"
          onClick={onStand}
          disabled={isLoading}
          className={cn(
            chunkyButton,
            'bg-gradient-to-b from-orange-400 to-orange-600 text-orange-950 shadow-[0_6px_0_#7a2a07,0_12px_20px_rgba(0,0,0,0.45)] active:shadow-[0_2px_0_#7a2a07,0_5px_10px_rgba(0,0,0,0.45)]'
          )}
        >
          <Shield className="size-4" />
          Stand
        </button>
      </div>
    )
  }

  if (isGameOver) {
    return (
      <button
        type="button"
        onClick={onNewGame}
        className={cn(
          chunkyButton,
          'bg-gradient-to-b from-emerald-400 to-emerald-600 text-emerald-950 shadow-[0_6px_0_#0a3b25,0_12px_20px_rgba(0,0,0,0.45)] active:shadow-[0_2px_0_#0a3b25,0_5px_10px_rgba(0,0,0,0.45)]'
        )}
      >
        <RefreshCw className="size-4" />
        New Round
      </button>
    )
  }

  return null
}
