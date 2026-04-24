import { RefreshCw, Shield } from 'lucide-react'

import { cn } from '#/lib/utils'

import type { GameStatus } from '#/hooks/useGame'

interface GameControlsProps {
  status: GameStatus
  isLoading: boolean
  playerCardCount: number
  onHit: () => void
  onStand: () => void
  onNewGame: () => void
}

function PressButton({
  onClick,
  disabled,
  shadowColor,
  shimmer,
  className,
  children,
}: {
  onClick?: () => void
  disabled?: boolean
  shadowColor: string
  shimmer?: boolean
  className: string
  children: React.ReactNode
}) {
  return (
    <div className="relative" style={{ paddingBottom: '5px' }}>
      <div
        className="absolute inset-x-0 bottom-0 rounded-[10px]"
        style={{ height: '5px', background: shadowColor }}
      />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] border-[2.5px] border-black/70 font-display uppercase tracking-[0.2em]',
          'transition-transform duration-[60ms] ease-linear',
          'active:translate-y-[4px]',
          'disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
      >
        {shimmer && disabled && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[10px]">
            <span
              className="absolute inset-y-0 left-0 w-1/2"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
                animation: 'npmjack-btn-shimmer 1.4s ease-in-out infinite',
              }}
            />
          </span>
        )}
        {children}
      </button>
    </div>
  )
}

export function GameControls({
  status,
  isLoading,
  playerCardCount,
  onHit,
  onStand,
  onNewGame,
}: GameControlsProps) {
  const isGameOver =
    status === 'won' || status === 'lost' || status === 'bust' || status === 'dealerBust'

  if (status === 'playing') {
    return (
      <div className="flex flex-col gap-2">
        {playerCardCount > 0 && (
          <PressButton
            onClick={onStand}
            disabled={isLoading}
            shadowColor="#7a2a07"
            className="bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-2 text-[0.72rem] sm:text-[0.82rem] text-orange-950"
          >
            <Shield className="size-3.5" />
            Stand
          </PressButton>
        )}
        <PressButton
          onClick={onHit}
          disabled={isLoading}
          shadowColor="#4a0f12"
          shimmer
          className="bg-gradient-to-b from-rose-500 to-rose-700 px-6 py-3 text-[0.82rem] sm:text-[0.92rem] text-white"
        >
          Hit
        </PressButton>
      </div>
    )
  }

  if (isGameOver) {
    return (
      <PressButton
        onClick={onNewGame}
        shadowColor="#0a3b25"
        className="bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2.5 text-[0.75rem] sm:text-[0.85rem] text-emerald-950"
      >
        <RefreshCw className="size-4" />
        New Round
      </PressButton>
    )
  }

  return null
}
