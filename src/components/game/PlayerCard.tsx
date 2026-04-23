import { User, Cpu } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'
import { cn } from '#/lib/utils'

import { PackageList } from './PackageList'

import type { PackageInfo } from '#/lib/npm-registry'

interface PlayerCardProps {
  title: 'You' | 'Dealer'
  icon: 'user' | 'dealer'
  totalMB: number
  packages: PackageInfo[]
  targetMB: number
  isDrawing?: boolean
}

export function PlayerCard({
  title,
  icon,
  totalMB,
  packages,
  targetMB,
  isDrawing,
}: PlayerCardProps) {
  const Icon = icon === 'user' ? User : Cpu
  const isPlayer = icon === 'user'
  const gap = targetMB - totalMB
  const isBust = gap < 0
  const stateLabel = isDrawing ? 'Drawing' : isBust ? 'Busted' : packages.length === 0 ? 'Fresh hand' : 'Live hand'
  const footerCopy = isDrawing
    ? 'Pulling from the deck'
    : packages.length === 0
      ? 'Awaiting the first draw'
      : isBust
        ? 'Blind already crossed'
        : 'Still inside the line'

  return (
    <Card
      className={cn(
        'game-panel h-full min-h-[28rem] rounded-[32px] bg-[linear-gradient(180deg,rgba(10,15,20,0.72),rgba(8,11,16,0.76))] py-0 ring-0',
        isPlayer ? 'border-sky-400/20' : 'border-orange-400/20'
      )}
    >
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-11 items-center justify-center rounded-2xl border bg-black/15',
              isPlayer ? 'border-sky-400/20 text-sky-100' : 'border-orange-400/20 text-orange-100'
            )}
          >
            <Icon size={20} />
          </span>
          <div>
            <div className="font-display text-lg uppercase text-foreground">{title}</div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              {isPlayer ? 'Your stack' : 'House stack'}
            </div>
          </div>
          <span
            className={cn(
              'ml-auto rounded-full border px-3 py-1 font-display text-[10px] uppercase',
              isDrawing
                ? 'border-primary/35 bg-primary/12 text-primary'
                : isBust
                  ? 'border-rose-400/20 bg-rose-500/10 text-rose-100'
                  : 'border-white/10 bg-white/5 text-foreground/80'
            )}
          >
            {stateLabel}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 pt-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <div className="rounded-[28px] border border-white/10 bg-black/15 p-4">
            <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Hand total
            </div>
            <div className="mt-4 font-display text-4xl uppercase text-foreground">
              {totalMB.toFixed(2)}
              <span className="ml-2 text-base text-muted-foreground">MB</span>
            </div>
            <div className={cn('mt-3 text-xs leading-6', isBust ? 'text-rose-200' : 'text-muted-foreground')}>
              {isBust
                ? `Over the blind by ${Math.abs(gap).toFixed(2)} MB.`
                : `${gap.toFixed(2)} MB of room remaining.`}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Cards</div>
              <div className="mt-2 font-display text-2xl text-foreground">
                {packages.length.toString().padStart(2, '0')}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Delta</div>
              <div
                className={cn(
                  'mt-2 font-display text-lg',
                  isBust ? 'text-rose-200' : isPlayer ? 'text-sky-100' : 'text-orange-100'
                )}
              >
                {isBust ? `+${Math.abs(gap).toFixed(2)}` : gap.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <PackageList packages={packages} />
      </CardContent>

      <CardFooter className="border-t border-white/10 bg-black/10">
        <div className="flex w-full items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>{isPlayer ? 'Player lane' : 'Dealer lane'}</span>
          <span>{footerCopy}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
