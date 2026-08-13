import { defineStore } from 'pinia'
import { Member } from '~/neko/types'
import { EVENT } from '~/neko/events'
import { useRootStore } from './index'
import { useUserStore } from './user'
import { useSettingsStore } from './settings'

const keyboardModifierState = (capsLock: boolean, numLock: boolean, scrollLock: boolean) =>
  Number(capsLock) + 2 * Number(numLock) + 4 * Number(scrollLock)

export const useRemoteStore = defineStore('remote', {
  state: () => ({
    id: '',
    clipboard: '',
    locked: false,
    implicitHosting: true,
    fileTransfer: true,
    keyboardModifierState: -1,
  }),

  getters: {
    hosting: (state) => {
      return useUserStore().id === state.id || state.implicitHosting
    },
    hosted: (state) => {
      return state.id !== '' || state.implicitHosting
    },
    host: (state) => {
      return useUserStore().members[state.id] || (state.implicitHosting && useUserStore().id) || null
    },
  },

  actions: {
    setHost(host: string | Member) {
      if (typeof host === 'string') {
        this.id = host
      } else {
        this.id = host.id
      }
    },

    setClipboard(clipboard: string) {
      this.clipboard = clipboard
    },

    setKeyboardModifierState({
      capsLock,
      numLock,
      scrollLock,
    }: { capsLock: boolean; numLock: boolean; scrollLock: boolean }) {
      this.keyboardModifierState = keyboardModifierState(capsLock, numLock, scrollLock)
    },

    setLocked(locked: boolean) {
      this.locked = locked
    },

    setImplicitHosting(val: boolean) {
      this.implicitHosting = val
    },

    setFileTransfer(val: boolean) {
      this.fileTransfer = val
    },

    reset() {
      this.id = ''
      this.clipboard = ''
      this.locked = false
    },

    sendClipboard(clipboard: string) {
      if (!useRootStore().connected || !this.hosting) {
        return
      }

      $client.sendMessage(EVENT.CONTROL.CLIPBOARD, { text: clipboard })
    },

    toggle() {
      if (!useRootStore().connected) {
        return
      }

      if (!this.hosting) {
        $client.sendMessage(EVENT.CONTROL.REQUEST)
      } else {
        $client.sendMessage(EVENT.CONTROL.RELEASE)
      }
    },

    request() {
      if (!useRootStore().connected || this.hosting) {
        return
      }

      $client.sendMessage(EVENT.CONTROL.REQUEST)
    },

    release() {
      if (!useRootStore().connected || !this.hosting) {
        return
      }

      $client.sendMessage(EVENT.CONTROL.RELEASE)
    },

    give(member: string | Member) {
      if (!useRootStore().connected || !this.hosting) {
        return
      }

      if (typeof member === 'string') {
        member = useUserStore().members[member]
      }

      if (!member) {
        return
      }

      $client.sendMessage(EVENT.CONTROL.GIVE, { id: member.id })
    },

    adminControl() {
      if (!useRootStore().connected || !useUserStore().admin) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.CONTROL)
    },

    adminRelease() {
      if (!useRootStore().connected || !useUserStore().admin) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.RELEASE)
    },

    adminGive(member: string | Member) {
      if (!useRootStore().connected) {
        return
      }

      if (typeof member === 'string') {
        member = useUserStore().members[member]
      }

      if (!member) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.GIVE, { id: member.id })
    },

    changeKeyboard() {
      if (!useRootStore().connected || !this.hosting) {
        return
      }

      $client.sendMessage(EVENT.CONTROL.KEYBOARD, { layout: useSettingsStore().keyboard_layout })
    },

    syncKeyboardModifierState({
      capsLock,
      numLock,
      scrollLock,
    }: { capsLock: boolean; numLock: boolean; scrollLock: boolean }) {
      if (this.keyboardModifierState === keyboardModifierState(capsLock, numLock, scrollLock)) {
        return
      }

      this.setKeyboardModifierState({ capsLock, numLock, scrollLock })
      $client.sendMessage(EVENT.CONTROL.KEYBOARD, { capsLock, numLock, scrollLock })
    },
  },
})
