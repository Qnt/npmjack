import { useQuery } from '@tanstack/react-query'

import { fetchPopularPackages, fetchTrendingPackages } from '#/lib/npms-api'

const POPULAR_PACKAGES_COUNT = 200
const TRENDING_PACKAGES_COUNT = 100

function shuffle(array: string[]): string[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

export function usePackagePool() {
  return useQuery<string[]>({
    queryKey: ['packagePool'],
    queryFn: async () => {
      const [popular, trending] = await Promise.all([
        fetchPopularPackages(POPULAR_PACKAGES_COUNT),
        fetchTrendingPackages(TRENDING_PACKAGES_COUNT),
      ])

      const uniquePackages = [...new Set([...popular, ...trending])]

      return shuffle(uniquePackages)
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
