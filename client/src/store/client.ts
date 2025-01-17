import { getterTree, mutationTree, actionTree } from 'typed-vuex'
import { get, set } from '~/utils/localstorage'

export const namespaced = true

export const state = () => ({
  side: get<boolean>('side', false),
  bottom: get<boolean>('bottom', true),
  side_to_bottom: get<boolean>('side-to-bottom', false),
  tab: get<string>('tab', 'chat'),
  about: false,
  about_page: '',
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setTab(state, tab: string) {
    state.tab = tab
    set('tab', tab)
  },
  setAbout(state, page: string) {
    state.about_page = page
  },
  toggleAbout(state) {
    state.about = !state.about
  },
  toggleSide(state) {
    state.side = !state.side
    set('side', state.side)
  },
  toggleBottom(state) {
    state.bottom = !state.bottom
    set('bottom', state.bottom)
  },
  toggleSideToBottom(state) {
    state.side_to_bottom = !state.side_to_bottom
    set('side-to-bottom', state.side_to_bottom)
  }
})

export const actions = actionTree({ state, getters, mutations }, {})
