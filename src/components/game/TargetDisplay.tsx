import { Target } from 'lucide-react'

import { Card, CardContent } from '#/components/ui/card'
import { cn } from '#/lib/utils'

interface TargetDisplayProps {
  dealerTotalMB: number
  playerTotalMB: number
  targetMB: number
}

export function TargetDisplay({ dealerTotalMB, playerTotalMB, targetMB }: TargetDisplayProps) {
  return (
    <Card className="game-panel mb-5 rounded-[32px] bg-[linear-gradient(180deg,rgba(13,20,26,0.7),rgba(9,13,18,0.72))] py-0 ring-0">
      <CardContent className="p-5 sm:p-7">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                Target blind
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Closest hand to the blind wins. Crossing it is an instant bust.
              </div>
            </div>

            <div className="score-pill self-start sm:self-auto">
              <Target className="size-4 text-primary" />
              <strong>{targetMB.toFixed(2)} MB limit</strong>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/15 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
            <div className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
              House line
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 font-display text-4xl uppercase text-foreground sm:text-6xl">
              <Target className="size-7 text-primary sm:size-9" />
              <span className="text-primary">{targetMB.toFixed(2)}</span>
              <span className="text-xl text-muted-foreground sm:text-2xl">MB</span>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <ProgressLane label="You" targetMB={targetMB} tone="player" totalMB={playerTotalMB} />
            <ProgressLane label="Dealer" targetMB={targetMB} tone="dealer" totalMB={dealerTotalMB} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ProgressLaneProps {
  label: string
  targetMB: number
  tone: 'dealer' | 'player'
  totalMB: number
}

function ProgressLane({ label, targetMB, tone, totalMB }: ProgressLaneProps) {
  const gap = targetMB - totalMB
  const isBust = gap < 0
  const progress = targetMB === 0 ? 0 : Math.min((totalMB / targetMB) * 100, 100)
  const width = totalMB > 0 ? Math.max(progress, 8) : 0

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em]">
        <span className="text-foreground/80">{label}</span>
        <span
          className={cn(
            'font-display text-[0.72rem] uppercase',
            tone === 'player' ? 'text-sky-100' : 'text-orange-100'
          )}
        >
          {totalMB.toFixed(2)} MB
        </span>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/30">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isBust
              ? 'bg-gradient-to-r from-rose-500 to-orange-300'
              : tone === 'player'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-300'
                : 'bg-gradient-to-r from-orange-500 to-amber-300'
          )}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-3 text-xs leading-6 text-muted-foreground">
        {totalMB === 0
          ? 'No packages drawn yet.'
          : isBust
            ? `Over the blind by ${Math.abs(gap).toFixed(2)} MB.`
            : `${gap.toFixed(2)} MB before bust.`}
      </div>
    </div>
  )
}
