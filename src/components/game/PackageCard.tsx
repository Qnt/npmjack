import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Github, Package as PackageIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import { formatSize } from '#/lib/npm-registry'
import type { PackageInfo } from '#/lib/npm-registry'

interface PackageCardProps {
  packageInfo: PackageInfo
  open?: boolean
  onToggle?: () => void
  onClose?: () => void
}

type Tier = {
  body: string
  label: string
  shadow: string
  text: string
  accent: string
  accentBg: string
  accentBorder: string
  accentRing: string
  popBorder: string
  popShadow: string
}

const TIERS: Tier[] = [
  {
    body: 'from-emerald-50 via-white to-emerald-50',
    label: 'tiny',
    shadow: 'shadow-[0_5px_0_#1e4d37,0_10px_16px_rgba(0,0,0,0.48)]',
    text: 'text-emerald-900',
    accent: 'text-emerald-700',
    accentBg: 'bg-emerald-100/70',
    accentBorder: 'border-emerald-900/15',
    accentRing: 'ring-emerald-900/10',
    popBorder: 'border-emerald-900/20',
    popShadow: 'shadow-[0_3px_0_#1e4d37,0_12px_26px_rgba(0,0,0,0.42)]',
  },
  {
    body: 'from-sky-50 via-white to-sky-50',
    label: 'light',
    shadow: 'shadow-[0_5px_0_#1d3b63,0_10px_16px_rgba(0,0,0,0.48)]',
    text: 'text-sky-900',
    accent: 'text-sky-700',
    accentBg: 'bg-sky-100/70',
    accentBorder: 'border-sky-900/15',
    accentRing: 'ring-sky-900/10',
    popBorder: 'border-sky-900/20',
    popShadow: 'shadow-[0_3px_0_#1d3b63,0_12px_26px_rgba(0,0,0,0.42)]',
  },
  {
    body: 'from-amber-50 via-white to-amber-50',
    label: 'heavy',
    shadow: 'shadow-[0_5px_0_#5c3a14,0_10px_16px_rgba(0,0,0,0.48)]',
    text: 'text-amber-900',
    accent: 'text-amber-700',
    accentBg: 'bg-amber-100/70',
    accentBorder: 'border-amber-900/15',
    accentRing: 'ring-amber-900/10',
    popBorder: 'border-amber-900/25',
    popShadow: 'shadow-[0_3px_0_#5c3a14,0_12px_26px_rgba(0,0,0,0.42)]',
  },
  {
    body: 'from-rose-50 via-white to-rose-50',
    label: 'mythic',
    shadow: 'shadow-[0_5px_0_#5c1a1a,0_10px_16px_rgba(0,0,0,0.48)]',
    text: 'text-rose-900',
    accent: 'text-rose-700',
    accentBg: 'bg-rose-100/70',
    accentBorder: 'border-rose-900/15',
    accentRing: 'ring-rose-900/10',
    popBorder: 'border-rose-900/25',
    popShadow: 'shadow-[0_3px_0_#5c1a1a,0_12px_26px_rgba(0,0,0,0.42)]',
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

function NpmMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 6h20v12h-10v-10h-4v10h-6z" />
    </svg>
  )
}

export function PackageCard({ packageInfo, open = false, onToggle, onClose }: PackageCardProps) {
  const tier = pickTier(packageInfo.unpackedSize)
  const label = packageInfo.name.replace(/^@/, '').replace(/\//g, ' · ')
  const hasRepo = Boolean(packageInfo.repositoryUrl)
  const primaryHref =
    packageInfo.repositoryUrl ?? `https://www.npmjs.com/package/${packageInfo.name}`
  const Icon = hasRepo ? Github : NpmMark
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [popoverReady, setPopoverReady] = useState(false)

  useEffect(() => {
    if (!open) return
    const handlePointer = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) onClose?.()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setPopoverReady(false)
      return
    }

    const card = cardRef.current
    if (!card) {
      setPopoverReady(true)
      return
    }

    let finished = false
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== card || event.propertyName !== 'transform') return
      finished = true
      setPopoverReady(true)
    }

    card.addEventListener('transitionend', onTransitionEnd)
    const fallbackTimer = window.setTimeout(() => {
      if (!finished) setPopoverReady(true)
    }, 260)

    return () => {
      card.removeEventListener('transitionend', onTransitionEnd)
      window.clearTimeout(fallbackTimer)
    }
  }, [open])

  const interactive = Boolean(onToggle)

  return (
    <>
      {open ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[3px]"
          onClick={onClose}
          style={{ animation: 'npmjack-card-backdrop-in 180ms ease-out both' }}
        />
      ) : null}
      <div ref={containerRef} className={cn('relative w-[9.5rem]', open && 'z-50')}>
        <div
          ref={cardRef}
          aria-expanded={open}
          aria-label={`Package ${packageInfo.name}`}
          className={cn(
            'relative flex aspect-[2/2.8] w-[9.5rem] shrink-0 flex-col rounded-[18px] border-[3px] border-black/85 bg-gradient-to-br p-3 transition-transform duration-200',
            tier.body,
            tier.shadow,
            interactive && 'cursor-pointer',
            !open && interactive && 'hover:-translate-y-1',
            open && '-translate-y-10',
          )}
          onClick={interactive ? onToggle : undefined}
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggle?.()
                  }
                }
              : undefined
          }
          role={interactive ? 'button' : undefined}
          style={{
            animation: 'npmjack-card-reveal-flip 520ms cubic-bezier(0.2, 0.85, 0.25, 1) both',
          }}
          tabIndex={interactive ? 0 : undefined}
        >
          <div
            className={cn(
              'flex items-start justify-between font-display text-[0.72rem] uppercase leading-none',
              tier.text,
            )}
          >
            <Icon className={cn('size-5', tier.accent)} />
            <span className={cn('tracking-[0.2em] text-[0.6rem]', tier.accent)}>{tier.label}</span>
          </div>

          <div className="flex flex-1 items-center justify-center px-1">
            <span
              className={cn(
                'break-words text-center font-display text-[0.88rem] uppercase leading-[1.15] tracking-[0.04em]',
                tier.text,
              )}
              title={packageInfo.name}
            >
              {label}
            </span>
          </div>

          <div
            className={cn(
              'mt-auto flex items-end justify-between font-display text-[0.72rem] uppercase leading-none',
              tier.text,
            )}
          >
            <Icon className={cn('size-5 rotate-180', tier.accent)} />
            <span className="text-right text-[0.9rem]">{formatSize(packageInfo.unpackedSize)}</span>
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-[15px] ring-1 ring-inset ring-white/70" />
        </div>

        {open && popoverReady ? (
          <PackageCardPopover
            author={packageInfo.author}
            description={packageInfo.description}
            href={primaryHref}
            hrefKind={hasRepo ? 'github' : 'npm'}
            name={packageInfo.name}
            tier={tier}
            version={packageInfo.version}
          />
        ) : null}
      </div>
    </>
  )
}

interface PopoverProps {
  author: PackageInfo['author']
  description: string | null
  href: string
  hrefKind: 'github' | 'npm'
  name: string
  tier: Tier
  version: string
}

function PackageCardPopover({
  author,
  description,
  href,
  hrefKind,
  name,
  tier,
  version,
}: PopoverProps) {
  const Icon = hrefKind === 'github' ? Github : NpmMark
  const linkLabel = hrefKind === 'github' ? 'GitHub' : 'npm'
  const boxRef = useRef<HTMLDivElement>(null)
  const [shiftX, setShiftX] = useState(0)

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const margin = 16
    const adjust = () => {
      el.style.transform = 'translateX(0px)'
      const rect = el.getBoundingClientRect()
      let delta = 0
      if (rect.left < margin) delta = margin - rect.left
      else if (rect.right > window.innerWidth - margin)
        delta = window.innerWidth - margin - rect.right
      setShiftX(delta)
    }
    adjust()
    window.addEventListener('resize', adjust)
    return () => window.removeEventListener('resize', adjust)
  }, [])

  return (
    <div
      className="absolute bottom-full left-1/2 z-10 mb-12 -translate-x-1/2"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={boxRef}
        className={cn(
          'relative w-[19rem] rounded-[20px] border bg-gradient-to-br from-[#fbf6e7] via-[#f5eed6] to-[#ede4c4] p-4 text-left',
          tier.popBorder,
          tier.popShadow,
        )}
        role="dialog"
        style={{
          animation: 'npmjack-card-popover-in 220ms cubic-bezier(0.2, 0.85, 0.25, 1) both',
          transform: `translateX(${shiftX}px)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[17px] ring-1 ring-inset ring-white/60" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className={cn('truncate font-display text-[0.95rem] leading-none', tier.text)}
              title={name}
            >
              {name}
            </div>
            <div
              className={cn(
                'mt-1.5 font-display text-[0.6rem] uppercase leading-none tracking-[0.3em]',
                tier.accent,
              )}
            >
              v{version}
            </div>
          </div>
          <a
            aria-label={`Open on ${linkLabel}`}
            className={cn(
              'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white/70 transition-colors hover:bg-white',
              tier.accentBorder,
              tier.accent,
            )}
            href={href}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon className="size-4" />
          </a>
        </div>

        {description ? (
          <p
            className={cn(
              'relative mt-3 line-clamp-3 text-[0.8rem] leading-snug',
              tier.text,
              'opacity-80',
            )}
          >
            {description}
          </p>
        ) : null}

        <div className={cn('relative mt-3 border-t pt-3', tier.accentBorder)}>
          <div
            className={cn(
              'font-display text-[0.55rem] uppercase leading-none tracking-[0.32em]',
              tier.accent,
            )}
          >
            Owner
          </div>
          <div className="mt-2 flex items-center gap-2">
            <PackageIcon className={cn('size-3.5', tier.accent)} />
            {author ? (
              author.url ? (
                <a
                  className={cn('truncate text-[0.82rem] font-medium hover:underline', tier.text)}
                  href={author.url}
                  onClick={(e) => e.stopPropagation()}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {author.name}
                </a>
              ) : (
                <span className={cn('truncate text-[0.82rem] font-medium', tier.text)}>
                  {author.name}
                </span>
              )
            ) : (
              <span className={cn('text-[0.82rem]', tier.text, 'opacity-50')}>Unknown</span>
            )}
          </div>
        </div>
      </div>
    </div>
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
