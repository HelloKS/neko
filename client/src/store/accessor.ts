import { AdminLockResource } from '~/neko/messages'
import { useRootStore } from './index'
import { useVideoStore } from './video'
import { useChatStore } from './chat'
import { useFilesStore } from './files'
import { useRemoteStore } from './remote'
import { useUserStore } from './user'
import { useSettingsStore } from './settings'
import { useClientStore } from './client'
import { useEmojiStore } from './emoji'

/**
 * Compatibility accessor that mirrors the previous typed-vuex `accessor` shape
 * so existing `$accessor.*` call sites (templates + scripts) keep working
 * unchanged. Every property delegates to the corresponding Pinia store.
 */
export const accessor = {
  // root store state
  get displayname() {
    return useRootStore().displayname
  },
  get password() {
    return useRootStore().password
  },
  get active() {
    return useRootStore().active
  },
  get connecting() {
    return useRootStore().connecting
  },
  get connected() {
    return useRootStore().connected
  },
  get locked() {
    return useRootStore().locked
  },

  // root store getter
  isLocked: (resource: AdminLockResource) => useRootStore().isLocked(resource),

  // root store actions (and former mutations)
  setActive: () => useRootStore().setActive(),
  setLogin: (login: { displayname: string; password: string }) => useRootStore().setLogin(login),
  setLocked: (resource: string) => useRootStore().setLocked(resource),
  setUnlocked: (resource: string) => useRootStore().setUnlocked(resource),
  setConnnecting: () => useRootStore().setConnnecting(),
  setConnected: (connected: boolean) => useRootStore().setConnected(connected),
  initialise: () => useRootStore().initialise(),
  lock: (resource: AdminLockResource) => useRootStore().lock(resource),
  unlock: (resource: AdminLockResource) => useRootStore().unlock(resource),
  toggleLock: (resource: AdminLockResource) => useRootStore().toggleLock(resource),
  login: (login: { displayname: string; password: string }) => useRootStore().login(login),
  logout: () => useRootStore().logout(),

  // namespaced modules
  get video() {
    return useVideoStore()
  },
  get chat() {
    return useChatStore()
  },
  get files() {
    return useFilesStore()
  },
  get remote() {
    return useRemoteStore()
  },
  get user() {
    return useUserStore()
  },
  get settings() {
    return useSettingsStore()
  },
  get client() {
    return useClientStore()
  },
  get emoji() {
    return useEmojiStore()
  },
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $accessor: typeof accessor
  }
}
