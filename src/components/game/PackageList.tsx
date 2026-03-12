import type { PackageInfo } from '#/lib/npm-registry'
import { formatSize } from '#/lib/npm-registry'

interface PackageListProps {
  packages: PackageInfo[]
}

export function PackageList({ packages }: PackageListProps) {
  return (
    <div className="space-y-2">
      {packages.map((pkg, index) => (
        <div
          key={`${pkg.name}-${index}`}
          className="flex items-center justify-between rounded bg-muted px-2 py-1 text-sm"
        >
          <span className="text-foreground">{pkg.name}</span>
          <span className="font-mono text-muted-foreground">{formatSize(pkg.unpackedSize)}</span>
        </div>
      ))}
    </div>
  )
}
