import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/lib/server-fetch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#/lib/server-fetch')>()

  return {
    ...actual,
    fetchJsonWithTimeout: vi.fn(),
  }
})

import { fetchJsonWithTimeout } from '#/lib/server-fetch'

import { fetchTrendingPackages } from './npms-server'

const mockedFetchJsonWithTimeout = vi.mocked(fetchJsonWithTimeout)

afterEach(() => {
  mockedFetchJsonWithTimeout.mockReset()
})

describe('fetchTrendingPackages', () => {
  it('skips failed mget batches and continues gracefully', async () => {
    mockedFetchJsonWithTimeout
      .mockResolvedValueOnce({
        total: 1,
        results: [
          {
            package: { name: 'react', version: '1.0.0' },
            score: { final: 1, detail: { quality: 1, popularity: 1, maintenance: 1 } },
            searchScore: 1,
          },
        ],
      })
      .mockRejectedValueOnce(new Error('mget failed'))

    await expect(fetchTrendingPackages(1)).resolves.toEqual([])
  })

  it('rejects invalid search payloads', async () => {
    mockedFetchJsonWithTimeout.mockResolvedValueOnce({ total: 1 })

    await expect(fetchTrendingPackages(1)).rejects.toEqual(
      expect.objectContaining({
        code: 'INVALID_PAYLOAD',
        retryable: false,
      }),
    )
  })
})
