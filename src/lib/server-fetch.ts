import { ofetch, type FetchOptions } from 'ofetch'

const DEFAULT_TIMEOUT_MS = 5_000

export class ServerFetchError extends Error {
  code: 'TIMEOUT' | 'UPSTREAM_ERROR'
  retryable: boolean

  constructor(message: string, code: 'TIMEOUT' | 'UPSTREAM_ERROR', retryable = true) {
    super(message)
    this.name = 'ServerFetchError'
    this.code = code
    this.retryable = retryable
  }
}

export async function fetchJsonWithTimeout<T>(
  url: string,
  options: FetchOptions<'json'> = {},
): Promise<T> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS

  try {
    return await ofetch<T>(url, {
      ...options,
      timeout,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ServerFetchError(`Timed out fetching ${url}`, 'TIMEOUT')
    }

    throw new ServerFetchError(`Failed to fetch ${url}`, 'UPSTREAM_ERROR')
  }
}
