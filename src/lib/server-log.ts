interface PackagesRouteLogEvent {
  code?: string
  retryable?: boolean
  type?: string | null
}

export function logPackagesRouteError(event: PackagesRouteLogEvent) {
  console.error('Package API error', event)
}
