import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Minimal Map-backed localStorage fake so the utils can be tested in a
 * plain node environment (no jsdom/happy-dom dependency).
 */
class FakeStorage {
  private store = new Map<string, string>()

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  get length(): number {
    return this.store.size
  }
}

let set: typeof import('../localstorage').set
let get: typeof import('../localstorage').get

beforeAll(async () => {
  ;(globalThis as unknown as Record<string, unknown>).localStorage = new FakeStorage()
  ;({ set, get } = await import('../localstorage'))
})

describe('localstorage', () => {
  it('round-trips a string', () => {
    set('key', 'hello')
    expect(get('key', 'default')).toBe('hello')
  })

  it('round-trips a number', () => {
    set('num', 42)
    expect(get('num', 0)).toBe(42)
  })

  it('round-trips a boolean using 1/0 encoding', () => {
    set('flag', true)
    expect(get('flag', false)).toBe(true)
    expect((globalThis as unknown as { localStorage: FakeStorage }).localStorage.getItem('flag')).toBe('1')

    set('flag', false)
    expect(get('flag', true)).toBe(false)
    expect((globalThis as unknown as { localStorage: FakeStorage }).localStorage.getItem('flag')).toBe('0')
  })

  it('returns the default when the key is missing', () => {
    expect(get('missing', 'fallback')).toBe('fallback')
    expect(get('missing', 7)).toBe(7)
    expect(get('missing', true)).toBe(true)
  })
})
