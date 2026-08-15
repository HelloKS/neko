// @vitest-environment jsdom
/**
 * Unit test for the vue-context replacement: the menu must flip into the
 * viewport when opening near the bottom/right edge (emote menu in the
 * bottom control bar opens upward instead of below the click point).
 */
import { createApp, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import VueContext from '../vue-context.vue'

let app: ReturnType<typeof createApp> | null = null
let el: HTMLDivElement
let vm: any

beforeEach(() => {
  el = document.createElement('div')
  document.body.appendChild(el)
  app = createApp(VueContext)
  vm = app.mount(el)
})

afterEach(() => {
  app?.unmount()
  el.remove()
})

function stubRect(rect: Partial<DOMRect>) {
  const el = vm.$el as HTMLElement
  el.getBoundingClientRect = vi.fn(
    () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) }) as DOMRect,
  )
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ ...rect } as DOMRect)
}

describe('vue-context smart positioning', () => {
  it('opens at the click position when there is room', async () => {
    // jsdom innerHeight = 768, innerWidth = 1024
    stubRect({ height: 200, width: 220, bottom: 400, right: 500 })

    vm.open({ clientX: 300, clientY: 300 } as MouseEvent)
    await nextTick()
    await nextTick()

    expect(vm.visible).toBe(true)
    expect(vm.x).toBe(300)
    expect(vm.y).toBe(300)
  })

  it('flips upward when the menu would overflow the bottom of the viewport', async () => {
    stubRect({ height: 200, width: 220, bottom: 900, right: 500 })

    // button near the bottom of the screen (emote bar)
    vm.open({ clientX: 400, clientY: 700 } as MouseEvent)
    await nextTick()
    await nextTick()

    // flipped up: 700 - 200 = 500 (clamped to >= 0)
    expect(vm.y).toBe(500)
    expect(vm.x).toBe(400)
  })

  it('flips left when the menu would overflow the right edge', async () => {
    stubRect({ height: 200, width: 220, bottom: 300, right: 1100 })

    vm.open({ clientX: 1000, clientY: 200 } as MouseEvent)
    await nextTick()
    await nextTick()

    expect(vm.x).toBe(1000 - 220)
    expect(vm.y).toBe(200)
  })

  it('clamps to the top edge when the menu is taller than the available space', async () => {
    stubRect({ height: 800, width: 220, bottom: 1000, right: 500 })

    vm.open({ clientX: 100, clientY: 100 } as MouseEvent)
    await nextTick()
    await nextTick()

    expect(vm.y).toBe(0)
  })
})
