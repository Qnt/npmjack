import { createFileRoute } from '@tanstack/react-router'

import { createApiErrorResponse } from '#/lib/api-error'
import { getOrRefreshServerCache } from '#/lib/server-cache'
import { ServerFetchError } from '#/lib/server-fetch'
import { logPackagesRouteError } from '#/lib/server-log'
import { fetchPopularPackages, fetchTrendingPackages } from '#/lib/npms-server'

const PACKAGES_CACHE_TTL_MS = 5 * 60 * 1000
const PACKAGES_CACHE_STALE_TTL_MS = 30 * 60 * 1000

type PackageSource = 'popular' | 'trending'

export const Route = createFileRoute('/api/packages')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const type = url.searchParams.get('type')
        const limit = parseLimit(url.searchParams.get('limit'), 100, 1, 250)

        try {
          if (type === 'popular') {
            const { data: packages } = await getCachedPackageSource('popular', limit)
            return Response.json({ packages })
          }
           
          if (type === 'trending') {
            const { data: packages } = await getCachedPackageSource('trending', limit)
            return Response.json({ packages })
          }
          
          if (type === 'pool') {
            const popularLimit = parseLimit(url.searchParams.get('popularLimit'), 200, 1, 250)
            const trendingLimit = parseLimit(url.searchParams.get('trendingLimit'), 100, 1, 250)

            const { data: packages } = await getCachedPackagePool(popularLimit, trendingLimit)

            return Response.json({ packages })
          }

          return Response.json(
            createApiErrorResponse('INVALID_TYPE'),
            { status: 400 }
          )
        } catch (error) {
          const code = mapPackagesErrorCode(error)
          logPackagesRouteError({
            code,
            retryable: createApiErrorResponse(code).retryable,
            type,
          })
          return Response.json(
            createApiErrorResponse(code),
            { status: 500 }
          )
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

function getPackagesFetcher(source: PackageSource) {
  return source === 'popular' ? fetchPopularPackages : fetchTrendingPackages
}

function getPackagesCacheKey(source: PackageSource, limit: number) {
  return `packages:${source}:${limit}`
}

async function getCachedPackageSource(source: PackageSource, limit: number) {
  return getOrRefreshServerCache({
    key: getPackagesCacheKey(source, limit),
    loader: () => getPackagesFetcher(source)(limit),
    ttlMs: PACKAGES_CACHE_TTL_MS,
    staleTtlMs: PACKAGES_CACHE_STALE_TTL_MS,
  })
}

async function getCachedPackagePool(popularLimit: number, trendingLimit: number) {
  return getOrRefreshServerCache({
    key: `packages:pool:${popularLimit}:${trendingLimit}`,
    loader: async () => {
      const [popularResult, trendingResult] = await Promise.allSettled([
        getCachedPackageSource('popular', popularLimit),
        getCachedPackageSource('trending', trendingLimit),
      ])

      const popular = popularResult.status === 'fulfilled' ? popularResult.value.data : []
      const trending = trendingResult.status === 'fulfilled' ? trendingResult.value.data : []

      if (popular.length === 0 && trending.length === 0) {
        throw new Error('No package sources available')
      }

      const uniquePackages = [...new Set([...popular, ...trending])]
      return shuffleArray(uniquePackages)
    },
    ttlMs: PACKAGES_CACHE_TTL_MS,
    staleTtlMs: PACKAGES_CACHE_STALE_TTL_MS,
  })
}

function mapPackagesErrorCode(error: unknown) {
  const serverError =
    error instanceof ServerFetchError || isServerFetchLikeError(error)
      ? error
      : null

  if (serverError) {
    if (serverError.code === 'TIMEOUT') {
      return 'UPSTREAM_TIMEOUT'
    }

    if (serverError.code === 'INVALID_PAYLOAD') {
      return 'INVALID_UPSTREAM_PAYLOAD'
    }
  }

  return 'UPSTREAM_UNAVAILABLE'
}

function isServerFetchLikeError(
  error: unknown,
): error is Pick<ServerFetchError, 'code' | 'retryable'> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'retryable' in error
  )
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
