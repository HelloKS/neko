import { defineStore } from 'pinia'
import { get, set } from '~/utils/localstorage'
import { EVENT } from '~/neko/events'

interface KeyboardLayouts {
  [code: string]: string
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    return {
      scroll: get<number>('scroll', 10),
      scroll_invert: get<boolean>('scroll_invert', true),
      autoplay: get<boolean>('autoplay', true),
      ignore_emotes: get<boolean>('ignore_emotes', false),
      chat_sound: get<boolean>('chat_sound', true),
      keyboard_layout: get<string>('keyboard_layout', 'us'),

      keyboard_layouts_list: {} as KeyboardLayouts,

      broadcast_is_active: false,
      broadcast_url: '',
    }
  },

  getters: {},

  actions: {
    setScroll(scroll: number) {
      this.scroll = scroll
      set('scroll', scroll)
    },

    setInvert(value: boolean) {
      this.scroll_invert = value
      set('scroll_invert', value)
    },

    setAutoplay(value: boolean) {
      this.autoplay = value
      set('autoplay', value)
    },

    setIgnore(value: boolean) {
      this.ignore_emotes = value
      set('ignore_emotes', value)
    },

    setSound(value: boolean) {
      this.chat_sound = value
      set('chat_sound', value)
    },

    setKeyboardLayout(value: string) {
      this.keyboard_layout = value
      set('keyboard_layout', value)
    },

    setKeyboardLayoutsList(value: KeyboardLayouts) {
      this.keyboard_layouts_list = value
    },
    setBroadcastStatus({ url, isActive }: { url: string; isActive: boolean }) {
      this.broadcast_url = url
      this.broadcast_is_active = isActive
    },

    async initialise() {
      try {
        const req = await $http.get<KeyboardLayouts>('keyboard_layouts.json')
        this.setKeyboardLayoutsList(req.data)
      } catch (err: any) {
        console.error(err)
      }
    },

    broadcastStatus({ url, isActive }: { url: string; isActive: boolean }) {
      this.setBroadcastStatus({ url, isActive })
    },
    broadcastCreate(url: string) {
      $client.sendMessage(EVENT.BROADCAST.CREATE, { url })
    },
    broadcastDestroy() {
      $client.sendMessage(EVENT.BROADCAST.DESTROY)
    },
  },
})
