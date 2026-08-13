import { defineConfig } from 'vite'
import baseConfig from './vite.config'

// Library build for the externally consumed `neko-lib` (was
// `vue-cli-service build --target lib --name neko-lib 'src/lib.ts'`).
export default defineConfig({
  ...baseConfig,
  build: {
    lib: {
      entry: 'src/lib.ts',
      name: 'neko-lib',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'neko-lib.mjs' : 'neko-lib.umd.js'),
    },
    cssCodeSplit: false,
    rollupOptions: {
      // lib.ts mixes named exports (NekoConnect, ...) with a default export;
      // keep them accessible as named exports on the UMD global (same shape as
      // the previous vue-cli lib build).
      output: {
        exports: 'named',
      },
    },
  },
})
