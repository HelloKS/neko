import { defineStore } from 'pinia'
import { makeid } from '~/utils'
import { EVENT } from '~/neko/events'
import { useRootStore } from './index'
import { useSettingsStore } from './settings'
import { useUserStore } from './user'

interface Emote {
  type: string
}

interface Emotes {
  [id: string]: Emote
}

interface Message {
  id: string
  content: string
  created: Date
  type: 'text' | 'event'
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    history: [] as Message[],
    emotes: {} as Emotes,
    texts: 0,
  }),

  getters: {
    //
  },

  actions: {
    addMessage(message: Message) {
      if (message.type == 'text') {
        this.texts++
      }

      this.history = this.history.concat([message])
    },

    addEmote({ id, emote }: { id: string; emote: Emote }) {
      this.emotes = {
        ...this.emotes,
        [id]: emote,
      }
    },

    delEmote(id: string) {
      const emotes = {
        ...this.emotes,
      }
      delete emotes[id]
      this.emotes = emotes
    },

    reset() {
      this.emotes = {}
      this.history = []
      this.texts = 0
    },

    newEmote(emote: Emote) {
      if (useSettingsStore().ignore_emotes || document.visibilityState === 'hidden') {
        return
      }

      const id = makeid(10)
      this.addEmote({ id, emote })
    },

    newMessage(message: Message) {
      if (useSettingsStore().chat_sound) {
        new Audio('chat.mp3').play().catch(console.error)
      }
      this.addMessage(message)
    },

    sendMessage(content: string) {
      if (!useRootStore().connected || useUserStore().muted) {
        return
      }
      $client.sendMessage(EVENT.CHAT.MESSAGE, { content })
    },

    sendEmote(emote: string) {
      if (!useRootStore().connected || useUserStore().muted) {
        return
      }
      $client.sendMessage(EVENT.CHAT.EMOTE, { emote })
    },
  },
})
