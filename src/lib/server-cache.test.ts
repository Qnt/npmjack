import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearServerCache, getOrRefreshServerCache } from './server-cache'

beforeEach(() => {
  clearServerCache()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
})

afterEach(() => {
  clearServerCache()
  vi.useRealTimers()
})

describe('getOrRefreshServerCache', () => {
  it('returns stale data when refresh fails inside stale window', async () => {
    const loader = vi.fn().mockResolvedValueOnce(['react'])

    await expect(getOrRefreshServerCache({
      key: 'pool:1:1',
      loader,
      ttlMs: 1_000,
      staleTtlMs: 10_000,
    })).resolves.toEqual({
      data: ['react'],
      state: 'fresh',
    })

    vi.advanceTimersByTime(1_001)
    loader.mockRejectedValueOnce(new Error('npms down'))

    await expect(getOrRefreshServerCache({
      key: 'pool:1:1',
      loader,
      ttlMs: 1_000,
      staleTtlMs: 10_000,
    })).resolves.toEqual({
      data: ['react'],
      state: 'stale',
    })
  })

  it('deduplicates concurrent refreshes for the same key', async () => {
    let resolveLoader: ((value: string[]) => void) | undefined
    const loader = vi.fn().mockImplementation(
      () => new Promise<string[]>(resolve => {
        resolveLoader = resolve
      })
    )

    const firstRequest = getOrRefreshServerCache({
      key: 'pool:2:2',
      loader,
      ttlMs: 1_000,
      staleTtlMs: 10_000,
    })

    const secondRequest = getOrRefreshServerCache({
      key: 'pool:2:2',
      loader,
      ttlMs: 1_000,
      staleTtlMs: 10_000,
    })

    expect(loader).toHaveBeenCalledTimes(1)

    resolveLoader?.(['react'])

    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([
      { data: ['react'], state: 'fresh' },
      { data: ['react'], state: 'fresh' },
    ])
  })

  it('returns stale data to all concurrent callers when refresh fails', async () => {
    const seedLoader = vi.fn().mockResolvedValueOnce(['react'])

    await getOrRefreshServerCache({
      key: 'pool:3:3',
      loader: seedLoader,
      ttlMs: 1_000,
      staleTtlMs: 10_000,
    })

    vi.advanceTimersByTime(1_001)

    let rejectLoader: ((error: Error) => void) | undefined
    const failingLoader = vi.fn().mockImplementation(
      () => new Promise<string[]>((_, reject) => {
        rejectLoader = reject
      })
    )

    const firstRequest = getOrRefreshServerCache({
      key: 'pool:3:3',
      loader: failingLoader,
      ttlMs: 1_000,
      staleTtlMs: 10_000,
    })

    const secondRequest = getOrRefreshServerCache({
      key: 'pool:3:3',
      loader: failingLoader,
      ttlMs: 1_000,
      staleTtlMs: 10_000,
    })

    expect(failingLoader).toHaveBeenCalledTimes(1)

    rejectLoader?.(new Error('npms down'))

    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([
      { data: ['react'], state: 'stale' },
      { data: ['react'], state: 'stale' },
    ])
  })
})
