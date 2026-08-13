import { defineStore } from 'pinia'
import { get, set } from '~/utils/localstorage'

export const useClientStore = defineStore('client', {
  state: () => ({
    side: get<boolean>('side', false),
    tab: get<string>('tab', 'chat'),
    about: false,
    about_page: '',
  }),

  getters: {},

  actions: {
    setTab(tab: string) {
      this.tab = tab
      set('tab', tab)
    },
    setAbout(page: string) {
      this.about_page = page
    },
    toggleAbout() {
      this.about = !this.about
    },
    toggleSide() {
      this.side = !this.side
      set('side', this.side)
    },
  },
})
