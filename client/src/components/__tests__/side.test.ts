// @vitest-environment jsdom
/**
 * Regression test for side.vue's dropped watcher: when file transfer becomes
 * allowed (admin toggles / lock released), the files list must refresh.
 * The Vue 2 -> 3 conversion merged both @Watch('filetransferAllowed')
 * handlers into onTabChange and left onFileTransferAllowedChange() unwired.
 */
import { createPinia, setActivePinia } from 'pinia'
import { shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Side from '../side.vue'
import { accessor } from '../../store/accessor'
import { useFilesStore } from '../../store/files'
import { useRemoteStore } from '../../store/remote'
import { useRootStore } from '../../store/index'
import { useClientStore } from '../../store/client'

let wrapper: ReturnType<typeof shallowMount> | null = null
let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  ;(window as any).$client = { sendMessage: vi.fn() }
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  delete (window as any).$client
})

function mountSide() {
  wrapper = shallowMount(Side, {
    global: {
      plugins: [pinia],
      config: {
        globalProperties: { $accessor: accessor } as any,
      },
    },
  })
  return wrapper
}

describe('side.vue filetransferAllowed watcher', () => {
  it('refreshes the file list when file transfer becomes allowed', async () => {
    const root = useRootStore()
    const remote = useRemoteStore()
    const client = useClientStore()
    const files = useFilesStore()

    root.connected = true
    remote.fileTransfer = false
    client.tab = 'chat'

    mountSide()

    const refresh = vi.spyOn(files, 'refresh')
    expect(refresh).not.toHaveBeenCalled()

    // file transfer becomes allowed -> non-immediate watcher must fire
    remote.fileTransfer = true
    await new Promise((r) => setTimeout(r, 0))

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('does not refresh when file transfer is disabled', async () => {
    const root = useRootStore()
    const remote = useRemoteStore()
    const client = useClientStore()
    const files = useFilesStore()

    root.connected = true
    remote.fileTransfer = true
    client.tab = 'chat'

    mountSide()

    const refresh = vi.spyOn(files, 'refresh')

    // file transfer disabled again -> no refresh on disable
    remote.fileTransfer = false
    await new Promise((r) => setTimeout(r, 0))

    expect(refresh).not.toHaveBeenCalled()
  })
})
