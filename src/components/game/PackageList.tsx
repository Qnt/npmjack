import type { PackageInfo } from '#/lib/npm-registry'
import { formatSize } from '#/lib/npm-registry'

interface PackageListProps {
  packages: PackageInfo[]
}

export function PackageList({ packages }: PackageListProps) {
  if (packages.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        Deck is warm. No packages in this hand yet.
      </div>
    )
  }

  return (
    <div className="grid gap-2.5">
      {packages.map((pkg, index) => (
        <div
          key={`${pkg.name}-${index}`}
          className="package-row flex items-center justify-between gap-3 rounded-[20px] px-3 py-3"
        >
          <div className="min-w-0 flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-display text-[10px] text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{pkg.name}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                v{pkg.version}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-display text-xs uppercase text-foreground">
              {formatSize(pkg.unpackedSize)}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              weight
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
