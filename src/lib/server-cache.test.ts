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
})
