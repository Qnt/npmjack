import { Skull, Trophy } from 'lucide-react'

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

  const Icon = content.icon

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-[18px] border-[3px] bg-gradient-to-b p-3 font-display uppercase shadow-[0_6px_0_rgba(0,0,0,0.5)]',
        content.className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-xl border-2 border-black/70 bg-black/30">
        <Icon className="size-5" />
      </span>
      <div className="flex-1">
        <div className="text-[0.72rem] tracking-[0.3em] opacity-80">round resolution</div>
        <div className="mt-1 text-xl leading-none">{content.title}</div>
        <div className="mt-1 text-[0.72rem] tracking-[0.15em] opacity-80 normal-case">
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
      className: 'from-rose-500 to-rose-700 border-rose-950/80 text-rose-50',
      description: `over the limit by ${(playerTotalMB - targetMB).toFixed(3)} mb`,
      icon: Skull,
      title: 'Player Bust',
    }
  }
  if (status === 'dealerBust') {
    return {
      className: 'from-emerald-400 to-emerald-600 border-emerald-950/80 text-emerald-950',
      description: `dealer overshot by ${(dealerTotalMB - targetMB).toFixed(3)} mb`,
      icon: Trophy,
      title: 'House Bust',
    }
  }
  if (status === 'won') {
    return {
      className: 'from-amber-300 to-amber-500 border-amber-950/80 text-amber-950',
      description: `${playerTotalMB.toFixed(3)} mb vs dealer ${dealerTotalMB.toFixed(3)} mb`,
      icon: Trophy,
      title: 'Round Won',
    }
  }
  if (status === 'lost') {
    return {
      className: 'from-orange-500 to-orange-700 border-orange-950/80 text-orange-50',
      description: `${playerTotalMB.toFixed(3)} mb vs dealer ${dealerTotalMB.toFixed(3)} mb`,
      icon: Skull,
      title: 'Dealer Edge',
    }
  }
  return null
}
