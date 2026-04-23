import { ofetch } from 'ofetch'

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
  const response = await ofetch<NpmsSearchResponse>(`${NPMS_API}/search`, {
    query: {
      q: 'not:unstable',
      size: Math.min(limit, 250),
      from: 0,
    },
  })

  return response.results.map(r => r.package.name)
}

export async function fetchTrendingPackages(limit: number): Promise<string[]> {
  const batchSize = 250
  const allPackages: { name: string; acceleration: number }[] = []
  
  let from = 0
  let hasMore = true
  
  while (hasMore && allPackages.length < limit * 3) {
    const response = await ofetch<NpmsSearchResponse>(`${NPMS_API}/search`, {
      query: {
        q: 'not:unstable',
        size: batchSize,
        from,
      },
    })

    if (response.results.length === 0) {
      hasMore = false
      break
    }

    const packageNames = response.results.map(r => r.package.name)
    
    const mgetResponse = await fetch(`${NPMS_API}/package/mget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packageNames),
    })

    if (!mgetResponse.ok) {
      from += batchSize
      continue
    }

    const scoresData: Record<string, NpmsPackageScore> = await mgetResponse.json()

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
    .map(p => p.name)

  return sorted
}