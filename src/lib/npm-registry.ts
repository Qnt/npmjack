import { fetchJsonWithTimeout } from '#/lib/server-fetch'
import { ServerFetchError } from '#/lib/server-fetch'

interface PackumentDist {
  unpackedSize?: number
  tarball: string
}

interface PackumentVersion {
  version: string
  dist?: PackumentDist
}

interface Packument {
  name: string
  'dist-tags': {
    latest?: string
    [key: string]: string | undefined
  }
  versions: Record<string, PackumentVersion>
}

export interface PackageInfo {
  name: string
  version: string
  unpackedSize: number | null
}

export async function fetchPackageInfo(packageName: string): Promise<PackageInfo> {
  const encodedName = packageName.startsWith('@')
    ? `@${encodeURIComponent(packageName.slice(1))}`
    : encodeURIComponent(packageName)

  const packument = await fetchJsonWithTimeout<Packument>(
    `https://registry.npmjs.org/${encodedName}`,
  )

  assertPackument(packument)

  const latestVersion = packument['dist-tags'].latest
  if (!latestVersion) {
    throw new ServerFetchError(
      `No latest version found for ${packageName}`,
      'INVALID_PAYLOAD',
      false,
    )
  }

  const versionData = packument.versions[latestVersion]
  if (!versionData) {
    throw new ServerFetchError(
      `Version ${latestVersion} not found for ${packageName}`,
      'INVALID_PAYLOAD',
      false,
    )
  }

  return {
    name: packument.name,
    version: latestVersion,
    unpackedSize: versionData.dist?.unpackedSize ?? null,
  }
}

export function formatSize(bytes: number | null): string {
  if (bytes === null) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function assertPackument(value: unknown): asserts value is Packument {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('name' in value) ||
    !('dist-tags' in value) ||
    !('versions' in value)
  ) {
    throw new ServerFetchError('Invalid npm registry payload', 'INVALID_PAYLOAD', false)
  }
}
