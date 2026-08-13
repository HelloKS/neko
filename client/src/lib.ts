import { defineComponent } from 'vue'
import { accessor } from './store/accessor'

// Plugins (re-exported so host apps can register them on their Vue app)
import Logger from './plugins/log'
import Client from './plugins/neko'
import Axios from './plugins/axios'
import Swal from './plugins/swal'
import Anime from './plugins/anime'
import { i18n } from './plugins/i18n'

export { Logger, Client, Axios, Swal, Anime, i18n, plugini18n }
// Components
import Connect from '~/components/connect.vue'
import Video from '~/components/video.vue'
import Menu from '~/components/menu.vue'
import Side from '~/components/side.vue'
import Controls from '~/components/controls.vue'
import Members from '~/components/members.vue'
import Emotes from '~/components/emotes.vue'
import About from '~/components/about.vue'
import Header from '~/components/header.vue'
import Chat from '~/components/chat.vue'
import Clipboard from '~/components/clipboard.vue'
import Emoji from '~/components/emoji.vue'
import Emote from '~/components/emote.vue'
import Context from '~/components/context.vue'
import Markdown from '~/components/markdown'
import Avatar from '~/components/avatar.vue'

const exportMixin = {
  computed: {
    $accessor() {
      return accessor
    },
    $client() {
      return window.$client
    },
  },
}

const plugini18n = {
  install(app: any) {
    app.config.globalProperties.i18n = i18n.global
    app.config.globalProperties.$t = i18n.global.t.bind(i18n.global)
    app.config.globalProperties.$te = i18n.global.te.bind(i18n.global)
  },
}

function extend(component: any) {
  return defineComponent({
    ...component,
    computed: {
      // mixin first, component wins (Vue 2 mixin semantics)
      ...exportMixin.computed,
      ...(component.computed || {}),
    },
  })
}

export const NekoConnect = extend(Connect)
export const NekoVideo = extend(Video)
export const NekoMenu = extend(Menu)
export const NekoSide = extend(Side)
export const NekoControls = extend(Controls)
export const NekoMembers = extend(Members)
export const NekoEmotes = extend(Emotes)
export const NekoAbout = extend(About)
export const NekoHeader = extend(Header)
export const NekoChat = extend(Chat)
export const NekoClipboard = extend(Clipboard)
export const NekoEmoji = extend(Emoji)
export const NekoEmote = extend(Emote)
export const NekoMarkdown = extend(Markdown)
export const NekoContext = extend(Context)
export const NekoAvatar = extend(Avatar)

export default accessor
