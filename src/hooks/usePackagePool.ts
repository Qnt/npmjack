import { useQuery } from '@tanstack/react-query'

import type { ApiErrorCode, ApiErrorResponse } from '#/lib/api-error'

export class PackagePoolError extends Error {
  code: ApiErrorCode | 'UNKNOWN'
  retryable: boolean

  constructor(message: string, code: ApiErrorCode | 'UNKNOWN', retryable: boolean) {
    super(message)
    this.name = 'PackagePoolError'
    this.code = code
    this.retryable = retryable
  }
}

export async function fetchPackagePool(): Promise<string[]> {
  const response = await fetch('/api/packages?type=pool')
  if (!response.ok) {
    throw await createPackagePoolError(response)
  }

  const data = await response.json() as { packages: string[] }
  return data.packages
}

export function createPackagePoolRetryPolicy(maxFailures = 3) {
  return (failureCount: number, error: unknown) => {
    if (error instanceof PackagePoolError && !error.retryable) {
      return false
    }

    return failureCount < maxFailures
  }
}

export function usePackagePool() {
  return useQuery<string[]>({
    queryKey: ['packagePool'],
    queryFn: fetchPackagePool,
    staleTime: 10 * 60 * 1000,
    gcTime: 30* 60 * 1000,
    refetchOnWindowFocus: false,
    retry: createPackagePoolRetryPolicy(),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

async function createPackagePoolError(response: Response) {
  const fallback = new PackagePoolError('Failed to fetch package pool', 'UNKNOWN', true)

  try {
    const data = await response.json() as Partial<ApiErrorResponse>
    if (
      typeof data.error === 'string' &&
      typeof data.code === 'string' &&
      typeof data.retryable === 'boolean'
    ) {
      return new PackagePoolError(data.error, data.code, data.retryable)
    }
  } catch {
    return fallback
  }

  return fallback
}
