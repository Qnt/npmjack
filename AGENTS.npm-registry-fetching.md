# NPM Registry Fetching - Research from npmx.dev

Reference: https://github.com/npmx-dev/npmx.dev

## Key Libraries

### 1. fast-npm-meta (Primary)
- Package: `fast-npm-meta@1.3.0`
- GitHub: https://github.com/antfu/fast-npm-meta
- API: `https://npm.antfu.dev`
- Purpose: Lightweight metadata fetching without full packument download

**Functions:**
```typescript
import { 
  getLatestVersion,      // Single package latest version
  getLatestVersionBatch, // Batch latest versions
  getVersions,           // All versions with metadata
  getVersionsBatch       // Batch version lookups
} from 'fast-npm-meta'

// Usage examples
const meta = await getLatestVersion('vue')
// meta.version = '3.5.27'

const versions = await getVersions('vue', { metadata: true })
// versions.versionsMeta = { '3.5.27': { time, deprecated, provenance } }
```

### 2. @npm/types (TypeScript Types)
- Package: `@npm/types@2.1.0` (devDependency)
- Provides official types: `Packument`, `PackumentVersion`, `Manifest`, `PackageJSON`

### 3. semver
- Package: `semver@7.7.4`
- Functions: `maxSatisfying()`, `prerelease()`, `compare()`

### 4. validate-npm-package-name
- Package: `validate-npm-package-name@7.0.2`
- Validates package names against npm rules

## NPM API Endpoints

### Registry API
- Base: `https://registry.npmjs.org`
- Packument: `GET /{packageName}` (full metadata, can be MBs)
- Search: `GET /-/v1/search?text=maintainer:{username}&size=20`

### Downloads API
- Base: `https://api.npmjs.org`
- Weekly: `GET /downloads/point/last-week/{packageName}`
- Range: `GET /downloads/range/{start}:{end}/{packageName}`

## Fetching Strategy (from npmx.dev)

### Client-Side (Lightweight)
```typescript
// Use fast-npm-meta for version lookups only
import { getVersions, getLatestVersion } from 'fast-npm-meta'

// Cached version fetching
const data = await getVersions(packageName, { metadata: true })
const versions = Object.entries(data.versionsMeta)
  .map(([version, meta]) => ({
    version,
    time: meta.time,
    hasProvenance: meta.provenance === 'trustedPublisher' || meta.provenance === true,
    deprecated: meta.deprecated,
  }))
```

### Server-Side (Full Data)
```typescript
// Use ofetch/$fetch for full packument
const packument = await $fetch<Packument>(`https://registry.npmjs.org/${encodedName}`)

// Combine with downloads
const downloads = await $fetch(`${NPM_API}/downloads/point/last-week/${encodedName}`)
```

### Encoding Package Names
```typescript
// Scoped packages need special URL encoding
function encodePackageName(name: string): string {
  if (name.startsWith('@')) {
    return `@${encodeURIComponent(name.slice(1))}`
  }
  return encodeURIComponent(name)
}
// Example: @vue/core -> @vue%2Fcore
```

## Caching Strategy

### Server (Nuxt)
```typescript
export const fetchNpmPackage = defineCachedFunction(
  async (name: string): Promise<Packument> => {
    return await $fetch<Packument>(`${NPM_REGISTRY}/${encodePackageName(name)}`)
  },
  {
    maxAge: 60 * 5,  // 5 minutes
    swr: true,       // Stale-while-revalidate
    name: 'npm-package',
    getKey: (name) => name,
  },
)
```

### Client (In-Memory)
```typescript
const cache = new Map<string, Promise<VersionInfo[]>>()

export async function fetchVersions(name: string) {
  const cached = cache.get(name)
  if (cached) return cached
  
  const promise = getVersions(name, { metadata: true })
  cache.set(name, promise)
  return promise
}
```

## Optimization Patterns

1. **Use fast-npm-meta for:**
   - Version lookups (latest, all versions)
   - Batch operations (multiple packages)
   - Client-side requests

2. **Use full packument for:**
   - Detailed package info
   - All version metadata
   - Server-side only (reduce client payload)

3. **Slim Packument Pattern:**
   - Strip unnecessary fields server-side
   - Only return dist-tag versions
   - Separate README fetching

## Key Types (from npmx.dev)

```typescript
// Slim packument for client (reduced payload)
interface SlimPackument {
  name: string
  description?: string
  'dist-tags': { latest?: string } & Record<string, string>
  time: { modified?: string; created?: string } & Record<string, string>
  maintainers?: NpmPerson[]
  versions: Record<string, SlimVersion>
}

interface PackageVersionInfo {
  version: string
  time?: string
  hasProvenance: boolean
  deprecated?: string
}

interface NpmPerson {
  name?: string
  email?: string
  url?: string
  username?: string
}
```

## Dependencies to Add

```json
{
  "dependencies": {
    "fast-npm-meta": "^1.3.0",
    "semver": "^7.7.4",
    "validate-npm-package-name": "^7.0.2",
    "ofetch": "^1.5.1"
  },
  "devDependencies": {
    "@npm/types": "^2.1.0"
  }
}
```
