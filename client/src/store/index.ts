import { defineStore } from 'pinia'
import { EVENT } from '~/neko/events'
import { AdminLockResource } from '~/neko/messages'
import { get, set } from '~/utils/localstorage'

import { useEmojiStore } from './emoji'
import { useSettingsStore } from './settings'
import { useUserStore } from './user'

export const useRootStore = defineStore('root', {
  state: () => ({
    displayname: get<string>('displayname', ''),
    password: get<string>('password', ''),
    active: false,
    connecting: false,
    connected: false,
    locked: {} as Record<string, boolean>,
  }),

  getters: {
    isLocked: (state) => (resource: AdminLockResource) => resource in state.locked && state.locked[resource],
  },

  actions: {
    setActive() {
      this.active = true
    },

    setLogin({ displayname, password }: { displayname: string; password: string }) {
      this.displayname = displayname
      this.password = password
    },

    setLocked(resource: string) {
      this.locked[resource] = true
    },

    setUnlocked(resource: string) {
      this.locked[resource] = false
    },

    setConnnecting() {
      this.connected = false
      this.connecting = true
    },

    setConnected(connected: boolean) {
      this.connected = connected
      this.connecting = false
      if (connected) {
        set('displayname', this.displayname)
        set('password', this.password)
      }
    },

    initialise() {
      useEmojiStore().initialise()
      useSettingsStore().initialise()
    },

    lock(resource: AdminLockResource) {
      if (!this.connected || !useUserStore().admin) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.LOCK, { resource })
    },

    unlock(resource: AdminLockResource) {
      if (!this.connected || !useUserStore().admin) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.UNLOCK, { resource })
    },

    toggleLock(resource: AdminLockResource) {
      if (this.isLocked(resource)) {
        this.unlock(resource)
      } else {
        this.lock(resource)
      }
    },

    login({ displayname, password }: { displayname: string; password: string }) {
      this.setLogin({ displayname, password })
      $client.login(password, displayname)
    },

    logout() {
      this.setLogin({ displayname: '', password: '' })
      set('displayname', '')
      set('password', '')
      $client.logout()
    },
  },
})
