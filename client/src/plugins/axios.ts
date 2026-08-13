import type { App } from 'vue'
import axios, { AxiosStatic } from 'axios'

declare global {
  const $http: AxiosStatic

  interface Window {
    $http: AxiosStatic
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $http: AxiosStatic
  }
}

const plugin = {
  install(app: App) {
    window.$http = axios
    app.config.globalProperties.$http = window.$http
  },
}

export default plugin
