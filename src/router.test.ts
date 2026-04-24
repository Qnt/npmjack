import { describe, expect, it } from 'vitest'

import { getRouter } from './router'

describe('getRouter', () => {
  it('creates an isolated query client per router instance', () => {
    const firstRouter = getRouter()
    const secondRouter = getRouter()
    const firstContext = firstRouter.options.context as {
      queryClient: unknown
    }
    const secondContext = secondRouter.options.context as {
      queryClient: unknown
    }

    expect(firstContext.queryClient).not.toBe(secondContext.queryClient)
  })
})
