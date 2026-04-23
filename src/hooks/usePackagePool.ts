import { useQuery } from '@tanstack/react-query'

async function fetchPackagePool(): Promise<string[]> {
  const response = await fetch('/api/packages?type=pool')
  if (!response.ok) {
    throw new Error('Failed to fetch package pool')
  }
  const data = await response.json()
  return data.packages
}

export function usePackagePool() {
  return useQuery<string[]>({
    queryKey: ['packagePool'],
    queryFn: fetchPackagePool,
    staleTime: 10 * 60 * 1000,
    gcTime: 30* 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}