import { useQuery } from '@tanstack/react-query'

import { fetchPackageInfo } from '#/lib/npm-registry'
import type { PackageInfo } from '#/lib/npm-registry'

export function usePackageInfo(packageName: string | null, drawId?: number) {
  return useQuery<PackageInfo>({
    queryKey: ['package', packageName, drawId],
    queryFn: () => fetchPackageInfo(packageName!),
    enabled: !!packageName,
    staleTime: 5 * 60 * 1000,
  })
}
