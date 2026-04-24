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
})
