// @vitest-environment jsdom
/**
 * Regression test: emote.vue must drive the anime.js animation with the
 * original parameters (top flight, rotation, elasticity, random duration,
 * easing). These were accidentally dropped during the Vue 2 -> 3 migration
 * which made the emote animation "weird" (no upward flight, no spin).
 */
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Emote from '../emote.vue'
import { accessor } from '../../store/accessor'
import { useChatStore } from '../../store/chat'

interface AnimeCall {
  params: any
  finished: Promise<void>
}

let app: ReturnType<typeof createApp> | null = null
let el: HTMLDivElement
let calls: AnimeCall[]

beforeEach(() => {
  calls = []

  const fakeAnime = (params: any) => {
    const call: AnimeCall = { params, finished: Promise.resolve() }
    calls.push(call)
    return call
  }
  fakeAnime.random = (min: number, max: number) => min + (max - min) / 2

  el = document.createElement('div')
  document.body.appendChild(el)

  // emote must be in the store before the component mounts (the parent
  // only renders <neko-emote> once the store entry exists)
  const pinia = createPinia()
  setActivePinia(pinia)
  useChatStore().emotes = { abc: { type: 'anger' } }

  app = createApp(Emote, { id: 'abc' })
  app.use(pinia)
  app.config.globalProperties.$accessor = accessor
  app.config.globalProperties.$anime = fakeAnime as any
  app.mount(el)
})

afterEach(() => {
  app?.unmount()
  el.remove()
})

describe('emote animation parameters', () => {
  it('uses the original animation config for every emote child', async () => {
    const chat = useChatStore()

    // allow the mounted() Promise.all chain to run
    await nextTick()
    await new Promise((r) => setTimeout(r, 10))

    expect(calls.length).toBe(7) // one animation per emote div

    for (const { params } of calls) {
      // upward flight: top is animated to a negative percentage
      expect(params.top).toMatch(/^-\d+%$/)
      // spin
      expect(typeof params.rotate).toBe('number')
      // original springiness + easing
      expect(params.elasticity).toBe(600)
      expect(params.easing).toBe('easeInOutQuad')
      // random duration within the original range
      expect(params.duration).toBeGreaterThanOrEqual(1000)
      expect(params.duration).toBeLessThanOrEqual(2000)
      // 3-step fade/sway keyframes
      expect(Array.isArray(params.keyframes)).toBe(true)
      expect(params.keyframes).toHaveLength(3)
    }

    // cleanup ran: emote removed from the store after all animations finish
    expect(chat.emotes).toEqual({})
  })
})
