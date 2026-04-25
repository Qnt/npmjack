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
        'animate-in fade-in zoom-in-95 duration-300 inline-flex flex-col items-center gap-0.5 rounded-full border border-white/10 bg-black/40 px-7 py-2.5 font-display uppercase backdrop-blur-md',
        content.textClass,
      )}
    >
      <div className="text-[1.05rem] leading-none tracking-[0.25em]">{content.title}</div>
      <div className="text-[0.68rem] leading-none tracking-[0.15em] opacity-60 normal-case">
        {content.description}
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
      description: `+${(playerTotalMB - targetMB).toFixed(2)} MB`,
      textClass: 'text-rose-300',
      title: 'Bust',
    }
  }
  if (status === 'dealerBust') {
    return {
      description: `dealer +${(dealerTotalMB - targetMB).toFixed(2)} MB`,
      textClass: 'text-emerald-300',
      title: 'House Bust',
    }
  }
  if (status === 'won') {
    return {
      description: `${playerTotalMB.toFixed(2)} MB vs ${dealerTotalMB.toFixed(2)} MB`,
      textClass: 'text-amber-300',
      title: 'Won',
    }
  }
  if (status === 'lost') {
    return {
      description: `${playerTotalMB.toFixed(2)} MB vs ${dealerTotalMB.toFixed(2)} MB`,
      textClass: 'text-orange-300',
      title: 'Lost',
    }
  }
  return null
}
