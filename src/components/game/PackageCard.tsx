import { cn } from '#/lib/utils'
import { formatSize } from '#/lib/npm-registry'
import type { PackageInfo } from '#/lib/npm-registry'

interface PackageCardProps {
  packageInfo: PackageInfo
}

type Tier = {
  badge: string
  body: string
  chip: string
  glyph: string
  label: string
  shadow: string
  text: string
}

const TIERS: Tier[] = [
  {
    badge: 'bg-emerald-200 text-emerald-900',
    body: 'from-emerald-50 via-white to-emerald-50',
    chip: 'text-emerald-700',
    glyph: '♣',
    label: 'tiny',
    shadow: 'shadow-[0_10px_0_#1e4d37,0_14px_22px_rgba(0,0,0,0.55)]',
    text: 'text-emerald-900',
  },
  {
    badge: 'bg-sky-200 text-sky-900',
    body: 'from-sky-50 via-white to-sky-50',
    chip: 'text-sky-700',
    glyph: '♦',
    label: 'light',
    shadow: 'shadow-[0_10px_0_#1d3b63,0_14px_22px_rgba(0,0,0,0.55)]',
    text: 'text-sky-900',
  },
  {
    badge: 'bg-amber-200 text-amber-900',
    body: 'from-amber-50 via-white to-amber-50',
    chip: 'text-amber-700',
    glyph: '♠',
    label: 'heavy',
    shadow: 'shadow-[0_10px_0_#5c3a14,0_14px_22px_rgba(0,0,0,0.55)]',
    text: 'text-amber-900',
  },
  {
    badge: 'bg-rose-200 text-rose-900',
    body: 'from-rose-50 via-white to-rose-50',
    chip: 'text-rose-700',
    glyph: '♥',
    label: 'mythic',
    shadow: 'shadow-[0_10px_0_#5c1a1a,0_14px_22px_rgba(0,0,0,0.55)]',
    text: 'text-rose-900',
  },
]

function pickTier(size: number | null): Tier {
  if (size === null) {
    return TIERS[1]!
  }

  if (size < 50 * 1024) return TIERS[0]!
  if (size < 500 * 1024) return TIERS[1]!
  if (size < 2 * 1024 * 1024) return TIERS[2]!
  return TIERS[3]!
}

export function PackageCard({ packageInfo }: PackageCardProps) {
  const tier = pickTier(packageInfo.unpackedSize)
  const label = packageInfo.name.replace(/^@/, '').replace(/\//g, ' · ')

  return (
    <div
      className={cn(
        'relative flex aspect-[2/2.8] w-[9.5rem] shrink-0 flex-col rounded-[18px] border-[3px] border-black/85 bg-gradient-to-br p-3 transition-transform',
        tier.body,
        tier.shadow,
        'hover:-translate-y-1'
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between font-display text-[0.65rem] uppercase leading-none',
          tier.text
        )}
      >
        <span className={cn('text-2xl leading-none', tier.chip)}>{tier.glyph}</span>
        <span
          className={cn(
            'rounded-md border border-black/80 px-1.5 py-0.5 text-[0.55rem] tracking-[0.15em]',
            tier.badge
          )}
        >
          {tier.label}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center px-1">
        <span
          className={cn(
            'break-words text-center font-display text-[0.78rem] uppercase leading-[1.15] tracking-[0.04em]',
            tier.text
          )}
          title={packageInfo.name}
        >
          {label}
        </span>
      </div>

      <div
        className={cn(
          'mt-auto flex items-end justify-between font-display text-[0.62rem] uppercase leading-none',
          tier.text
        )}
      >
        <span className={cn('text-2xl leading-none', tier.chip)}>{tier.glyph}</span>
        <span className="text-right text-[0.8rem]">{formatSize(packageInfo.unpackedSize)}</span>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[15px] ring-1 ring-inset ring-white/70" />
    </div>
  )
}

export function PackageCardBack({
  className,
  labelClassName,
  label = 'npm',
  note,
}: {
  className?: string
  labelClassName?: string
  label?: string
  note?: string
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-[2/2.8] w-[9.5rem] shrink-0 flex-col items-center justify-center rounded-[18px] border-[3px] border-black/85 bg-[repeating-linear-gradient(135deg,#be2a2a_0,#be2a2a_10px,#911d1d_10px,#911d1d_20px)] text-white shadow-[0_4px_0_#3a0b0b,0_8px_20px_rgba(0,0,0,0.55)]',
        className
      )}
    >
      <div className="absolute inset-2 rounded-[13px] border-2 border-white/70" />
      <div className="relative z-10 flex flex-col items-center gap-2 text-center font-display uppercase">
        <span className={cn('text-xs tracking-[0.25em] text-white/90', labelClassName)}>{label}</span>
        {note ? <span className="text-[0.62rem] tracking-[0.3em] text-white/70">{note}</span> : null}
      </div>
    </div>
  )
}

export function PackageCardSlot({ label }: { label: string }) {
  return (
    <div className="flex aspect-[2/2.8] w-[9.5rem] shrink-0 items-center justify-center rounded-[18px] border-2 border-dashed border-white/25 bg-white/4 text-center font-display text-[0.62rem] uppercase tracking-[0.3em] text-white/55">
      {label}
    </div>
  )
}
