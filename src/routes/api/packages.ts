import { createFileRoute } from '@tanstack/react-router'

import { fetchPopularPackages, fetchTrendingPackages } from '#/lib/npms-server'

export const Route = createFileRoute('/api/packages')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const type = url.searchParams.get('type')
        const limit = parseLimit(url.searchParams.get('limit'), 100, 1, 250)

        try {
          if (type === 'popular') {
            const packages = await fetchPopularPackages(limit)
            return Response.json({ packages })
          }
          
          if (type === 'trending') {
            const packages = await fetchTrendingPackages(limit)
            return Response.json({ packages })
          }
          
          if (type === 'pool') {
            const popularLimit = parseLimit(url.searchParams.get('popularLimit'), 200, 1, 250)
            const trendingLimit = parseLimit(url.searchParams.get('trendingLimit'), 100, 1, 250)
            
            const [popular, trending] = await Promise.all([
              fetchPopularPackages(popularLimit),
              fetchTrendingPackages(trendingLimit),
            ])
            
            const uniquePackages = [...new Set([...popular, ...trending])]
            const shuffled = shuffleArray(uniquePackages)
            
            return Response.json({ packages: shuffled })
          }
          
          return Response.json({ error: 'Invalid type. Use: popular, trending, or pool' }, { status: 400 })
        } catch (error) {
          console.error('Error fetching packages:', error)
          return Response.json({ error: 'Failed to fetch packages' }, { status: 500 })
        }
      },
    },
  },
})

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

export function parseLimit(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}
