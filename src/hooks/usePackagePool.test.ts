import { describe, expect, it, vi } from 'vitest'

import { createPackagePoolRetryPolicy, fetchPackagePool, PackagePoolError } from './usePackagePool'

describe('fetchPackagePool', () => {
  it('parses retryable structured server errors', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: 'Failed to fetch packages',
          code: 'UPSTREAM_TIMEOUT',
          retryable: true,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(fetchPackagePool()).rejects.toEqual(
      expect.objectContaining<Partial<PackagePoolError>>({
        code: 'UPSTREAM_TIMEOUT',
        retryable: true,
      }),
    )

    fetchMock.mockRestore()
  })
})

describe('createPackagePoolRetryPolicy', () => {
  it('stops retrying non-retryable API errors', () => {
    const retry = createPackagePoolRetryPolicy()

    expect(retry(1, new PackagePoolError('bad request', 'INVALID_TYPE', false))).toBe(false)
  })

  it('retries retryable API errors up to the cap', () => {
    const retry = createPackagePoolRetryPolicy()

    expect(retry(1, new PackagePoolError('timed out', 'UPSTREAM_TIMEOUT', true))).toBe(true)
    expect(retry(3, new PackagePoolError('timed out', 'UPSTREAM_TIMEOUT', true))).toBe(false)
  })
})
