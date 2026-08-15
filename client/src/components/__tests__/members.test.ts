// @vitest-environment jsdom
/**
 * Members list renders as vertical rows: avatar + display name for the
 * current user and every connected member (disconnected excluded).
 */
import { createPinia, setActivePinia } from 'pinia'
import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import Members from '../members.vue'
import { accessor } from '../../store/accessor'
import { useUserStore } from '../../store/user'
import { useRemoteStore } from '../../store/remote'

function mountMembers() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return shallowMount(Members, {
    global: {
      plugins: [pinia],
      config: {
        globalProperties: { $accessor: accessor } as any,
      },
    },
  })
}

describe('members vertical list', () => {
  it('renders self + connected members as rows with names', async () => {
    const wrapper = mountMembers()
    const user = useUserStore()
    const remote = useRemoteStore()

    user.id = 'me'
    remote.id = 'host1'
    user.setMembers([
      { id: 'me', displayname: 'Myself', admin: true, muted: false, connected: true },
      { id: 'host1', displayname: 'Host', admin: true, muted: false, connected: true },
      { id: 'gone', displayname: 'Gone', admin: false, muted: false, connected: false },
    ])

    await nextTick()

    const names = wrapper.findAll('.name').map((n) => n.text())
    expect(names).toEqual(['Myself', 'Host'])
    expect(wrapper.findAll('.member-row')).toHaveLength(2)
  })

  it('marks the host row with the host class', async () => {
    const wrapper = mountMembers()
    const user = useUserStore()
    const remote = useRemoteStore()

    user.id = 'me'
    remote.id = 'host1'
    user.setMembers([
      { id: 'me', displayname: 'Myself', admin: false, muted: false, connected: true },
      { id: 'host1', displayname: 'Host', admin: false, muted: false, connected: true },
    ])

    await nextTick()

    const rows = wrapper.findAll('.member-row')
    const hostRow = rows.find((r) => r.find('.host').exists())
    expect(hostRow?.find('.name').text()).toBe('Host')
  })
})
