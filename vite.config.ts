import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: true,
    }),
    AutoImport({
      // global imports to register
      imports: [
        // presets
        'vue',
        'vue-router',
      ],
      dts: true,
    }),
  ],
  server: {
    // Vite 3 now defaults to 5173, but you can override it with the port option.
    port: 5174,
    // proxy: {
    //     '/front': {
    //         target: 'http://127.0.0.1:3002',
    //         changeOrigin: true,
    //         secure: false,
    //     },
    // },
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
