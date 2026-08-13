# neko-client

Browser client for the [neko](https://github.com/m1k1o/neko) self-hosted virtual
browser. It connects over WebSocket + WebRTC to the neko server and renders the
remote desktop in the browser with audio, chat, file transfer and multi-user
control.

## Stack

- [Vue 3](https://vuejs.org/) (Options API) + [Vite 5](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) for state
- [vue-i18n](https://vue-i18n.intlify.dev/) v10 (composition mode, `legacy: false`)
- TypeScript 5
- WebRTC layer in `src/neko` (framework-agnostic, built on `eventemitter3`)

## Commands

```bash
npm install          # install dependencies
npm run serve        # Vite dev server on port 8080 (VITE_SERVER_PORT in .env.development)
npm run build        # production build -> dist/
npm run build:lib    # library build (neko-lib, es + umd) -> dist/
npm test             # vitest unit tests
npm run lint         # eslint (ts + vue)
npm run build:emoji  # regenerate emoji assets from emoji-datasource
```

## Architecture notes

- `$accessor` (templates and `this.$accessor` in scripts) is a compatibility
  shim over the Pinia stores, defined in `src/store/accessor.ts`. Every property
  delegates to the corresponding Pinia store, so existing call sites keep
  working unchanged.
- Window globals `$client`, `$log`, `$http`, `$swal`, `$anime` are set by the
  plugins in `src/plugins/*`; the same values are exposed on
  `app.config.globalProperties`. Plugins are plain `install(app)` functions.
- `v-tooltip` is provided by [floating-vue](https://floating-vue.starpad.dev/)
  (registered with `app.use(VTooltip)`).
- Notifications use `@kyvg/vue3-notification` (`<notifications>` component and
  `$notify`).
- The Vue 2 only `vue-context` package was replaced by a local component
  (`src/components/vue-context.vue`) with the same imperative API
  (`$refs.context.open(event, data?)`).
- The Vue 2 only `vue-clickaway` directive was replaced by a local directive
  (`src/utils/clickaway.ts`).

## Library usage (neko-lib)

The library build (`npm run build:lib`) exports the components
(`NekoConnect`, `NekoVideo`, `NekoMenu`, `NekoSide`, `NekoControls`,
`NekoMembers`, `NekoEmotes`, `NekoAbout`, `NekoHeader`, `NekoChat`,
`NekoClipboard`, `NekoEmoji`, `NekoEmote`, `NekoMarkdown`, `NekoContext`,
`NekoAvatar`), the plugins (`Logger`, `Client`, `Axios`, `Swal`, `Anime`,
`i18n`, `plugini18n`) and the `$accessor` shim as the default export.

Host applications must:

1. Install Pinia (`app.use(createPinia())`).
2. Register the exported plugins, plus `floating-vue` and
   `@kyvg/vue3-notification`, on the host app.
3. Call `accessor.initialise()` once (the old module-scope initialisation side
   effect was intentionally removed).

## Known notes

- `dist/` is shared by the app build and the library build — they overwrite
  each other's output. Build the artifact you need last.
- `package.json` intentionally has no `"type": "module"` — the emoji build
  script (`tools/emoji.ts`) runs through CommonJS `ts-node`.
- `vue` is bundled into `neko-lib` (the full build including the runtime
  template compiler, required by `src/components/markdown.ts` which renders a
  runtime string template). No `types` entry is published yet (no `.d.ts`
  generation step).
