type CacheState = 'fresh' | 'stale'

interface CacheEntry<T> {
  data: T
  expiresAt: number
  staleUntil: number
}

interface GetOrRefreshServerCacheOptions<T> {
  key: string
  loader: () => Promise<T>
  ttlMs: number
  staleTtlMs: number
}

interface GetOrRefreshServerCacheResult<T> {
  data: T
  state: CacheState
}

const serverCache = new Map<string, CacheEntry<unknown>>()

export async function getOrRefreshServerCache<T>({
  key,
  loader,
  ttlMs,
  staleTtlMs,
}: GetOrRefreshServerCacheOptions<T>): Promise<GetOrRefreshServerCacheResult<T>> {
  const now = Date.now()
  const cached = serverCache.get(key) as CacheEntry<T> | undefined

  if (cached && cached.expiresAt > now) {
    return {
      data: cached.data,
      state: 'fresh',
    }
  }

  try {
    const data = await loader()
    serverCache.set(key, {
      data,
      expiresAt: now + ttlMs,
      staleUntil: now + ttlMs + staleTtlMs,
    })

    return {
      data,
      state: 'fresh',
    }
  } catch (error) {
    if (cached && cached.staleUntil > now) {
      return {
        data: cached.data,
        state: 'stale',
      }
    }

    throw error
  }
}

export function clearServerCache() {
  serverCache.clear()
}
