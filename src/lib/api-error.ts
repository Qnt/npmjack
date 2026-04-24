export type ApiErrorCode =
  | 'INVALID_TYPE'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_TIMEOUT'
  | 'INVALID_UPSTREAM_PAYLOAD'

export interface ApiErrorResponse {
  error: string
  code: ApiErrorCode
  retryable: boolean
}

export function createApiErrorResponse(
  code: ApiErrorCode,
  options: Partial<Pick<ApiErrorResponse, 'error' | 'retryable'>> = {},
): ApiErrorResponse {
  return {
    error: options.error ?? defaultErrorMessage(code),
    code,
    retryable: options.retryable ?? defaultRetryable(code),
  }
}

function defaultErrorMessage(code: ApiErrorCode): string {
  switch (code) {
    case 'INVALID_TYPE':
      return 'Invalid type. Use: popular, trending, or pool'
    default:
      return 'Failed to fetch packages'
  }
}

function defaultRetryable(code: ApiErrorCode): boolean {
  return code !== 'INVALID_TYPE' && code !== 'INVALID_UPSTREAM_PAYLOAD'
}
