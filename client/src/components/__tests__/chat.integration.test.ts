// @vitest-environment jsdom
/**
 * Integration test: mount the real chat.vue with the real plugin stack
 * (Pinia + accessor + vue-i18n + floating-vue), feed a chat message into
 * the store the same way neko/index.ts does on EVENT.CHAT.MESSAGE, and
 * assert the message text renders in the DOM.
 */
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { VTooltip } from 'floating-vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Chat from '../../components/chat.vue'
import { i18n } from '../../plugins/i18n'
import { accessor } from '../../store/accessor'
import { useChatStore } from '../../store/chat'
import { useUserStore } from '../../store/user'

let app: ReturnType<typeof createApp> | null = null
let el: HTMLDivElement

beforeEach(() => {
  // jsdom has no Audio constructor; the chat store plays a sound on newMessage.
  // @ts-ignore
  window.Audio = class {
    play() {
      return Promise.resolve()
    }
    catch() {
      return this
    }
  } as any

  // neko/index.ts uses the $client global for outgoing messages.
  ;(window as any).$client = { sendMessage: vi.fn() }

  el = document.createElement('div')
  document.body.appendChild(el)

  app = createApp(Chat)
  app.use(createPinia())
  app.use(i18n)
  app.directive('tooltip', VTooltip)
  app.config.globalProperties.$accessor = accessor
  app.mount(el)
})

afterEach(() => {
  app?.unmount()
  el.remove()
  delete (window as any).$client
})

describe('chat message rendering', () => {
  it('renders a text message from another member', async () => {
    const chat = useChatStore()
    const user = useUserStore()

    // simulate server member list + incoming chat/message (as neko/index.ts does)
    user.setMembers([
      { id: 'a', displayname: 'Alice', admin: false, muted: false, connected: true },
    ])
    chat.newMessage({ id: 'a', content: 'hello world', type: 'text', created: new Date() })

    await nextTick()
    await nextTick()
    await new Promise((r) => setTimeout(r, 150)) // chat.vue watcher uses setTimeout

    expect(el.textContent).toContain('hello world')
  })

  it('renders multiple messages including markdown formatting', async () => {
    const chat = useChatStore()
    const user = useUserStore()
    user.setMembers([
      { id: 'a', displayname: 'Alice', admin: false, muted: false, connected: true },
    ])

    chat.newMessage({ id: 'a', content: '**bold** and `code`', type: 'text', created: new Date() })
    chat.newMessage({ id: 'a', content: 'second message', type: 'text', created: new Date() })

    await nextTick()
    await nextTick()
    await new Promise((r) => setTimeout(r, 150))

    expect(el.textContent).toContain('bold')
    expect(el.textContent).toContain('code')
    expect(el.textContent).toContain('second message')
  })
})
