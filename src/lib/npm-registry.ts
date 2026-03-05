import { ofetch } from 'ofetch'

interface PackumentDist {
  unpackedSize?: number
  tarball: string
}

interface PackumentVersion {
  version: string
  dist?: PackumentDist
  repository?: {
    type?: string
    url?: string
  }
}

interface Packument {
  name: string
  'dist-tags': {
    latest?: string
    [key: string]: string | undefined
  }
  versions: Record<string, PackumentVersion>
  repository?: {
    type?: string
    url?: string
  }
}

export interface PackageInfo {
  name: string
  version: string
  repositoryUrl: string | null
  unpackedSize: number | null
}

function normalizeRepositoryUrl(url: string | undefined): string | null {
  if (!url) return null

  let normalized = url
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/\.git$/, '')
    .replace(/^github:/, 'https://github.com/')
    .replace(/^github\.com:/, 'https://github.com/')

  if (!normalized.startsWith('http')) {
    normalized = `https://${normalized}`
  }

  return normalized
}

export async function fetchPackageInfo(packageName: string): Promise<PackageInfo> {
  const encodedName = packageName.startsWith('@')
    ? `@${encodeURIComponent(packageName.slice(1))}`
    : encodeURIComponent(packageName)

  const packument = await ofetch<Packument>(
    `https://registry.npmjs.org/${encodedName}`,
  )

  const latestVersion = packument['dist-tags'].latest
  if (!latestVersion) {
    throw new Error(`No latest version found for ${packageName}`)
  }

  const versionData = packument.versions[latestVersion]
  if (!versionData) {
    throw new Error(`Version ${latestVersion} not found for ${packageName}`)
  }

  const repoUrl = normalizeRepositoryUrl(
    versionData.repository?.url || packument.repository?.url,
  )

  return {
    name: packument.name,
    version: latestVersion,
    repositoryUrl: repoUrl,
    unpackedSize: versionData.dist?.unpackedSize ?? null,
  }
}

export function formatSize(bytes: number | null): string {
  if (bytes === null) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
