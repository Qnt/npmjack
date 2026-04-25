import { cn } from '#/lib/utils'

import type { GameStatus as GameStatusType } from '#/hooks/useGame'

interface GameStatusProps {
  status: GameStatusType
  playerTotalMB: number
  dealerTotalMB: number
  targetMB: number
}

export function GameStatus({ status, playerTotalMB, dealerTotalMB, targetMB }: GameStatusProps) {
  const content = getStatusContent(status, playerTotalMB, dealerTotalMB, targetMB)
  if (!content) return null

  return (
    <div
      className={cn(
        'animate-in fade-in zoom-in-95 duration-300 relative inline-flex flex-col items-center justify-center rounded-[18px] border-[3px] border-black/85 px-8 py-4 text-white shadow-[0_2px_0_rgba(0,0,0,0.5),0_6px_14px_rgba(0,0,0,0.46)]',
      )}
      style={{ background: content.gradient }}
    >
      <div className="absolute inset-2 rounded-[13px] border-2 border-white/70" />
      <div className="relative z-10 text-center font-display uppercase">
        <div className="text-[1.15rem] leading-none tracking-[0.25em]">{content.title}</div>
        <div className="mt-1.5 text-[0.72rem] leading-none tracking-[0.15em] text-white/80 normal-case">
          {content.description}
        </div>
      </div>
    </div>
  )
}

function getStatusContent(
  status: GameStatusType,
  playerTotalMB: number,
  dealerTotalMB: number,
  targetMB: number,
) {
  if (status === 'bust') {
    return {
      description: `${targetMB.toFixed(2)}\u00A0MB + ${(playerTotalMB - targetMB).toFixed(2)}\u00A0MB`,
      gradient:
        'repeating-linear-gradient(135deg,#be2a2a_0,#be2a2a_10px,#911d1d_10px,#911d1d_20px)',
      title: 'Bust',
    }
  }
  if (status === 'dealerBust') {
    return {
      description: `${targetMB.toFixed(2)}\u00A0MB + ${(dealerTotalMB - targetMB).toFixed(2)}\u00A0MB`,
      gradient:
        'repeating-linear-gradient(135deg,#10b981_0,#10b981_10px,#059669_10px,#059669_20px)',
      title: 'House Bust',
    }
  }
  if (status === 'won') {
    return {
      description: `${playerTotalMB.toFixed(2)}\u00A0MB / ${targetMB.toFixed(2)}\u00A0MB`,
      gradient:
        'repeating-linear-gradient(135deg,#f59e0b_0,#f59e0b_10px,#d97706_10px,#d97706_20px)',
      title: 'Won',
    }
  }
  if (status === 'lost') {
    return {
      description: `${playerTotalMB.toFixed(2)}\u00A0MB / ${targetMB.toFixed(2)}\u00A0MB`,
      gradient:
        'repeating-linear-gradient(135deg,#f97316_0,#f97316_10px,#ea580c_10px,#ea580c_20px)',
      title: 'Lost',
    }
  }
  return null
}
