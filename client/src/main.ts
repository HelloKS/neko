import './assets/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Notifications from '@kyvg/vue3-notification'
import VTooltip from 'floating-vue'
import 'floating-vue/dist/style.css'
import Logger from './plugins/log'
import Client from './plugins/neko'
import Axios from './plugins/axios'
import Swal from './plugins/swal'
import Anime from './plugins/anime'

import { i18n } from './plugins/i18n'
import { accessor } from './store/accessor'
import app from './app.vue'

const pinia = createPinia()

const instance = createApp(app)

instance.config.globalProperties.$accessor = accessor

instance.use(pinia)
instance.use(i18n)
instance.use(Logger)
instance.use(Notifications)
instance.use(VTooltip)
instance.use(Axios)
instance.use(Swal)
instance.use(Anime)
instance.use(Client)

instance.mount('#neko')
