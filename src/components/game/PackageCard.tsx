import { cn } from '#/lib/utils'
import { formatSize } from '#/lib/npm-registry'
import type { PackageInfo } from '#/lib/npm-registry'

interface PackageCardProps {
  packageInfo: PackageInfo
}

function getTone(size: number | null) {
  if (size === null) {
    return {
      badge: 'unknown',
      card: 'border-slate-700/80 bg-slate-100 text-slate-900 shadow-[0_5px_0_#334155,0_10px_16px_rgba(0,0,0,0.38)]',
      accent: 'text-slate-600',
    }
  }

  if (size < 50 * 1024) {
    return {
      badge: 'tiny',
      card: 'border-emerald-950/80 bg-emerald-50 text-emerald-950 shadow-[0_5px_0_#1e4d37,0_10px_16px_rgba(0,0,0,0.38)]',
      accent: 'text-emerald-700',
    }
  }

  if (size < 500 * 1024) {
    return {
      badge: 'light',
      card: 'border-sky-950/80 bg-sky-50 text-sky-950 shadow-[0_5px_0_#1d3b63,0_10px_16px_rgba(0,0,0,0.38)]',
      accent: 'text-sky-700',
    }
  }

  if (size < 2 * 1024 * 1024) {
    return {
      badge: 'heavy',
      card: 'border-amber-950/80 bg-amber-50 text-amber-950 shadow-[0_5px_0_#5c3a14,0_10px_16px_rgba(0,0,0,0.38)]',
      accent: 'text-amber-700',
    }
  }

  return {
    badge: 'mythic',
    card: 'border-rose-950/80 bg-rose-50 text-rose-950 shadow-[0_5px_0_#5c1a1a,0_10px_16px_rgba(0,0,0,0.38)]',
    accent: 'text-rose-700',
  }
}

export function PackageCard({ packageInfo }: PackageCardProps) {
  const tone = getTone(packageInfo.unpackedSize)
  const label = packageInfo.name.replace(/^@/, '').replace(/\//g, ' · ')

  return (
    <article
      aria-label={`Package ${packageInfo.name}`}
      className={cn(
        'relative flex aspect-[2/2.8] w-[9.5rem] shrink-0 flex-col rounded-[18px] border-[3px] p-3',
        tone.card,
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between font-display text-[0.62rem] uppercase',
          tone.accent,
        )}
      >
        <span className="tracking-[0.2em]">npm</span>
        <span className="tracking-[0.2em]">{tone.badge}</span>
      </div>

      <div className="mt-4 flex-1">
        <div className="font-display text-[0.88rem] uppercase leading-[1.2] tracking-[0.04em]">
          {label}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <span
          className={cn('font-display text-[0.62rem] uppercase tracking-[0.16em]', tone.accent)}
        >
          v{packageInfo.version}
        </span>
        <span className="text-right font-display text-[0.9rem]">
          {formatSize(packageInfo.unpackedSize)}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[15px] ring-1 ring-inset ring-white/60" />
    </article>
  )
}

export function PackageCardBack({
  className,
  labelClassName,
  label = 'npm',
  note,
  loading,
}: {
  className?: string
  labelClassName?: string
  label?: string
  note?: string
  loading?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-[2/2.8] w-[9.5rem] shrink-0 flex-col items-center justify-center rounded-[18px] border-[3px] border-black/85 bg-[repeating-linear-gradient(135deg,#be2a2a_0,#be2a2a_10px,#911d1d_10px,#911d1d_20px)] text-white shadow-[0_2px_0_#3a0b0b,0_6px_14px_rgba(0,0,0,0.46)]',
        className,
      )}
      style={
        loading ? { animation: 'npmjack-card-loading-size 1.25s ease-in-out infinite' } : undefined
      }
    >
      <div className="absolute inset-2 rounded-[13px] border-2 border-white/70" />
      <div className="relative z-10 flex flex-col items-center gap-2 text-center font-display uppercase">
        <span className={cn('text-sm tracking-[0.25em] text-white/90', labelClassName)}>
          {label}
        </span>
        {note ? (
          <span className="text-[0.72rem] tracking-[0.3em] text-white/70">{note}</span>
        ) : null}
      </div>
    </div>
  )
}
