import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockFetchPopularPackages = vi.fn()
const mockFetchTrendingPackages = vi.fn()

vi.mock('#/lib/npms-server', () => ({
  fetchPopularPackages: (...args: unknown[]) => mockFetchPopularPackages(...args),
  fetchTrendingPackages: (...args: unknown[]) => mockFetchTrendingPackages(...args),
}))

import { clearServerCache } from '#/lib/server-cache'

import { Route, parseLimit } from './packages'

type PackagesGetHandler = (args: { request: Request }) => Promise<Response>

const getPackagesHandler = Route.options.server?.handlers as { GET: PackagesGetHandler }

async function getPackagesResponse(search: string) {
  return getPackagesHandler.GET({
    request: new Request(`http://test/api/packages${search}`),
  })
}

beforeEach(() => {
  clearServerCache()
  mockFetchPopularPackages.mockReset()
  mockFetchTrendingPackages.mockReset()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
})

afterEach(() => {
  clearServerCache()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('parseLimit', () => {
  it('returns fallback for missing or invalid values', () => {
    expect(parseLimit(null, 100, 1, 250)).toBe(100)
    expect(parseLimit('nope', 100, 1, 250)).toBe(100)
  })

  it('clamps values into the allowed range', () => {
    expect(parseLimit('-5', 100, 1, 250)).toBe(1)
    expect(parseLimit('999', 100, 1, 250)).toBe(250)
    expect(parseLimit('42', 100, 1, 250)).toBe(42)
  })
})

describe('/api/packages GET', () => {
  it('returns a partial pool when one upstream source fails', async () => {
    mockFetchPopularPackages.mockResolvedValueOnce(['react', 'vite'])
    mockFetchTrendingPackages.mockRejectedValueOnce(new Error('npms unavailable'))
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const response = await getPackagesResponse('?type=pool&popularLimit=2&trendingLimit=2')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.packages.toSorted()).toEqual(['react', 'vite'])
  })

  it('serves stale pool data when both sources fail during refresh', async () => {
    mockFetchPopularPackages.mockResolvedValueOnce(['react'])
    mockFetchTrendingPackages.mockResolvedValueOnce(['vite'])
    vi.spyOn(Math, 'random').mockReturnValue(0)

    let response = await getPackagesResponse('?type=pool&popularLimit=1&trendingLimit=1')
    let data = await response.json()

    expect(response.status).toBe(200)
    expect(data.packages.toSorted()).toEqual(['react', 'vite'])

    vi.advanceTimersByTime(5 * 60 * 1000 + 1)
    mockFetchPopularPackages.mockRejectedValueOnce(new Error('popular down'))
    mockFetchTrendingPackages.mockRejectedValueOnce(new Error('trending down'))

    response = await getPackagesResponse('?type=pool&popularLimit=1&trendingLimit=1')
    data = await response.json()

    expect(response.status).toBe(200)
    expect(data.packages.toSorted()).toEqual(['react', 'vite'])
  })

  it('builds a partial pool from cached sources when pool cache is cold', async () => {
    mockFetchPopularPackages.mockResolvedValueOnce(['react'])

    let response = await getPackagesResponse('?type=popular&limit=1')
    let data = await response.json()

    expect(response.status).toBe(200)
    expect(data.packages).toEqual(['react'])

    mockFetchPopularPackages.mockRejectedValueOnce(new Error('popular down'))
    mockFetchTrendingPackages.mockRejectedValueOnce(new Error('trending down'))

    response = await getPackagesResponse('?type=pool&popularLimit=1&trendingLimit=1')
    data = await response.json()

    expect(response.status).toBe(200)
    expect(data.packages).toEqual(['react'])
  })

  it('returns a structured error when nothing could be fetched', async () => {
    mockFetchPopularPackages.mockRejectedValueOnce(new Error('popular down'))
    mockFetchTrendingPackages.mockRejectedValueOnce(new Error('trending down'))

    const response = await getPackagesResponse('?type=pool&popularLimit=1&trendingLimit=1')

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch packages',
      code: 'UPSTREAM_UNAVAILABLE',
      retryable: true,
    })
  })

  it('marks invalid query types as non-retryable request errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await getPackagesResponse('?type=unknown')

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid type. Use: popular, trending, or pool',
      code: 'INVALID_TYPE',
      retryable: false,
    })
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('maps timeout failures to a timeout error code', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const timeoutError = new Error('timed out')
    timeoutError.name = 'ServerFetchError'
    Object.assign(timeoutError, {
      code: 'TIMEOUT',
      retryable: true,
    })

    mockFetchPopularPackages.mockRejectedValueOnce(timeoutError)

    const response = await getPackagesResponse('?type=popular&limit=1')

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch packages',
      code: 'UPSTREAM_TIMEOUT',
      retryable: true,
    })
    expect(errorSpy).toHaveBeenCalledWith(
      'Package API error',
      expect.objectContaining({
        code: 'UPSTREAM_TIMEOUT',
        retryable: true,
        type: 'popular',
      }),
    )
  })

  it('maps invalid upstream payloads to a validation error code', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const payloadError = new Error('bad payload')
    payloadError.name = 'ServerFetchError'
    Object.assign(payloadError, {
      code: 'INVALID_PAYLOAD',
      retryable: false,
    })

    mockFetchTrendingPackages.mockRejectedValueOnce(payloadError)

    const response = await getPackagesResponse('?type=trending&limit=1')

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch packages',
      code: 'INVALID_UPSTREAM_PAYLOAD',
      retryable: false,
    })
    expect(errorSpy).toHaveBeenCalledWith(
      'Package API error',
      expect.objectContaining({
        code: 'INVALID_UPSTREAM_PAYLOAD',
        retryable: false,
        type: 'trending',
      }),
    )
  })
})
