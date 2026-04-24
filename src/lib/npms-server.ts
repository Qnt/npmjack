import { fetchJsonWithTimeout } from '#/lib/server-fetch'
import { ServerFetchError } from '#/lib/server-fetch'

interface NpmsSearchResult {
  package: {
    name: string
    version: string
  }
  score: {
    final: number
    detail: {
      quality: number
      popularity: number
      maintenance: number
    }
  }
  searchScore: number
}

interface NpmsSearchResponse {
  total: number
  results: NpmsSearchResult[]
}

interface NpmsPackageScore {
  package: {
    name: string
  }
  evaluation: {
    popularity: {
      downloadsCount: number
      downloadsAcceleration: number
    }
  }
}

const NPMS_API = 'https://api.npms.io/v2'

export async function fetchPopularPackages(limit: number): Promise<string[]> {
  const response = await fetchJsonWithTimeout<NpmsSearchResponse>(`${NPMS_API}/search`, {
    query: {
      q: 'not:unstable',
      size: Math.min(limit, 250),
      from: 0,
    },
  })

  assertNpmsSearchResponse(response)

  return response.results.map((r) => r.package.name)
}

export async function fetchTrendingPackages(limit: number): Promise<string[]> {
  const batchSize = 250
  const allPackages: { name: string; acceleration: number }[] = []

  let from = 0
  let hasMore = true

  while (hasMore && allPackages.length < limit * 3) {
    const response = await fetchJsonWithTimeout<NpmsSearchResponse>(`${NPMS_API}/search`, {
      query: {
        q: 'not:unstable',
        size: batchSize,
        from,
      },
    })

    assertNpmsSearchResponse(response)

    if (response.results.length === 0) {
      hasMore = false
      break
    }

    const packageNames = response.results.map((r) => r.package.name)

    const scoresData = await fetchJsonWithTimeout<Record<string, NpmsPackageScore>>(
      `${NPMS_API}/package/mget`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: packageNames,
      },
    ).catch(() => null)

    if (!scoresData) {
      break
    }

    assertNpmsScoresResponse(scoresData)

    for (const [name, data] of Object.entries(scoresData)) {
      const acceleration = data?.evaluation?.popularity?.downloadsAcceleration ?? 0
      if (acceleration > 0) {
        allPackages.push({
          name,
          acceleration,
        })
      }
    }

    from += batchSize
    hasMore = response.results.length === batchSize
  }

  const sorted = allPackages
    .sort((a, b) => b.acceleration - a.acceleration)
    .slice(0, limit)
    .map((p) => p.name)

  return sorted
}

function assertNpmsSearchResponse(value: unknown): asserts value is NpmsSearchResponse {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('results' in value) ||
    !Array.isArray(value.results)
  ) {
    throw new ServerFetchError('Invalid NPMS search payload', 'INVALID_PAYLOAD', false)
  }
}

function assertNpmsScoresResponse(
  value: unknown,
): asserts value is Record<string, NpmsPackageScore> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ServerFetchError('Invalid NPMS scores payload', 'INVALID_PAYLOAD', false)
  }
}
