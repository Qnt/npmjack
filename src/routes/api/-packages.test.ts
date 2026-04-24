import { describe, expect, it } from 'vitest'

import { parseLimit } from './packages'

describe('parseLimit', () => {
  it('returns fallback for missing or invalid values', () => {
    expect(parseLimit(null, 100, 1, 250)).toBe(100)
    expect(parseLimit('nope', 100, 1, 250)).toBe(100)
  })

  it('clamps values into the allowed range', () => {
    expect(parseLimit('-5', 100, 1, 250)).toBe(1)
    expect(parseLimit('999', 100, 1, 250)).toBe(250)
    expect(parseLimit('42', 100, 1, 250)).toBe(42)
  })
})
