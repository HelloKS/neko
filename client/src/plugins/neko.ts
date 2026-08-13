import type { App } from 'vue'
import { NekoClient } from '~/neko'

declare global {
  const $client: NekoClient

  interface Window {
    $client: NekoClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $client: NekoClient
  }
}

const plugin = {
  install(app: App) {
    window.$client = new NekoClient()
      .on('error', window.$log.error)
      .on('warn', window.$log.warn)
      .on('info', window.$log.info)
      .on('debug', window.$log.debug)

    app.config.globalProperties.$client = window.$client
  },
}

export default plugin
