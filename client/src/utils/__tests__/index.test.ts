import { afterEach, describe, expect, it, vi } from 'vitest'

import { makeid } from '../index'

describe('makeid', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a string of the exact requested length', () => {
    expect(makeid(0)).toBe('')
    expect(makeid(1)).toHaveLength(1)
    expect(makeid(16)).toHaveLength(16)
    expect(makeid(64)).toHaveLength(64)
  })

  it('only uses alphanumeric characters', () => {
    const id = makeid(1000)
    expect(id).toMatch(/^[A-Za-z0-9]+$/)
  })

  it('is deterministic when Math.random is stubbed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    // charset index floor(0.5 * 62) = 31 -> 'f' (A-Z, then a-z, then 0-9)
    expect(makeid(4)).toBe('ffff')
    expect(makeid(8)).toBe('ffffffff')
  })
})
