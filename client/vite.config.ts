import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  // The client is served from an arbitrary subpath (nginx in Docker), so all
  // generated asset URLs must be relative to index.html.
  base: './',
  resolve: {
    alias: [
      // vue must resolve to the full build (includes the runtime template
      // compiler): src/components/markdown.ts renders a runtime string template
      // via h({ template: ... }), which is unavailable in the runtime-only
      // build. This preserves the previous vue$ webpack alias from vue.config.js.
      {
        find: /^vue$/,
        replacement: fileURLToPath(new URL('./node_modules/vue/dist/vue.esm-bundler.js', import.meta.url)),
      },
      { find: '~', replacement: srcDir },
      { find: '@', replacement: srcDir },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Same global injection as the previous vue.config.js sass-loader
        // option; all scss files depend on these variables/mixins.
        additionalData: `@import "@/assets/styles/_variables.scss";`,
      },
    },
  },
  server: {
    // host: true is required for the docker-based dev workflow
    // (.docker/serve-client maps CLIENT_PORT:8080 into the container).
    port: 8080,
    host: true,
    allowedHosts: true,
  },
})
