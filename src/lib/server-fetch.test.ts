import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}))

import { ofetch } from 'ofetch'

import { fetchJsonWithTimeout, ServerFetchError } from './server-fetch'

const mockedOfetch = vi.mocked(ofetch)

afterEach(() => {
  mockedOfetch.mockReset()
})

describe('fetchJsonWithTimeout', () => {
  it('maps aborted requests to timeout errors', async () => {
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    mockedOfetch.mockRejectedValueOnce(abortError)

    await expect(fetchJsonWithTimeout('https://api.example.test')).rejects.toEqual(
      expect.objectContaining<Partial<ServerFetchError>>({
        code: 'TIMEOUT',
        retryable: true,
      })
    )
  })
})
