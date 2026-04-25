import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchPackageInfo } from './npm-registry'

vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}))

import { ofetch } from 'ofetch'

const mockedOfetch = vi.mocked(ofetch)

afterEach(() => {
  mockedOfetch.mockReset()
})

describe('fetchPackageInfo', () => {
  it('returns only core package fields needed by gameplay', async () => {
    mockedOfetch.mockResolvedValueOnce({
      name: 'react',
      'dist-tags': { latest: '19.0.0' },
      versions: {
        '19.0.0': {
          version: '19.0.0',
          description: 'unused description',
          repository: { url: 'https://github.com/facebook/react' },
          author: { name: 'Meta' },
          dist: { tarball: 'https://example.test/react.tgz', unpackedSize: 123 },
        },
      },
      description: 'root description',
      repository: { url: 'https://github.com/facebook/react' },
      author: { name: 'Meta' },
    })

    await expect(fetchPackageInfo('react')).resolves.toEqual({
      name: 'react',
      version: '19.0.0',
      unpackedSize: 123,
    })
  })

  it('preserves scoped package slash encoding in registry requests', async () => {
    mockedOfetch.mockResolvedValueOnce({
      name: '@scope/pkg',
      'dist-tags': { latest: '1.0.0' },
      versions: {
        '1.0.0': {
          version: '1.0.0',
          dist: { tarball: 'https://example.test/pkg.tgz', unpackedSize: 123 },
        },
      },
    })

    await fetchPackageInfo('@scope/pkg')

    expect(mockedOfetch).toHaveBeenCalledWith('https://registry.npmjs.org/@scope%2Fpkg', {
      timeout: 5000,
    })
  })

  it('rejects packuments without a latest dist-tag', async () => {
    mockedOfetch.mockResolvedValueOnce({
      name: 'react',
      'dist-tags': {},
      versions: {},
    })

    await expect(fetchPackageInfo('react')).rejects.toEqual(
      expect.objectContaining({
        code: 'INVALID_PAYLOAD',
        retryable: false,
      }),
    )
  })

  it('rejects packuments missing the latest version payload', async () => {
    mockedOfetch.mockResolvedValueOnce({
      name: 'react',
      'dist-tags': { latest: '1.0.0' },
      versions: {},
    })

    await expect(fetchPackageInfo('react')).rejects.toEqual(
      expect.objectContaining({
        code: 'INVALID_PAYLOAD',
        retryable: false,
      }),
    )
  })
})
