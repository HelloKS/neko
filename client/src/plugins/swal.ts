import type { App } from 'vue'

import { SweetAlertOptions } from 'sweetalert2'
import Swal from 'sweetalert2/dist/sweetalert2.js'

type VueSwalInstance = typeof Swal.fire

declare global {
  interface Window {
    $swal: VueSwalInstance
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $swal: VueSwalInstance
  }
}

interface VueSweetalert2Options extends SweetAlertOptions {
  // includeCss?: boolean;
}

const VueSweetalert2 = {
  install(app: App, options?: VueSweetalert2Options): void {
    const swalFunction = (...args: [SweetAlertOptions]) => {
      if (options) {
        const mixed = Swal.mixin(options)

        return mixed.fire(...args)
      }

      return Swal.fire(...args)
    }

    let methodName: string | number | symbol

    for (methodName in Swal) {
      // @ts-ignore
      if (Object.prototype.hasOwnProperty.call(Swal, methodName) && typeof Swal[methodName] === 'function') {
        // @ts-ignore
        swalFunction[methodName] = ((method) => {
          return (...args: any[]) => {
            // @ts-ignore
            return Swal[method](...args)
          }
        })(methodName)
      }
    }

    // window global so library components can use it without a host plugin
    window.$swal = swalFunction as VueSwalInstance

    // add the instance method
    if (!Object.prototype.hasOwnProperty.call(app.config.globalProperties, '$swal')) {
      app.config.globalProperties.$swal = swalFunction as VueSwalInstance
    }
  },
}

export default VueSweetalert2
