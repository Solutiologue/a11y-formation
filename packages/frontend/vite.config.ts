import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'yjs': path.resolve(__dirname, '../../node_modules/yjs'),
      'y-webrtc': path.resolve(__dirname, '../../node_modules/y-webrtc'),
      'y-protocols': path.resolve(__dirname, '../../node_modules/y-protocols'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    strictPort: true,
    allowedHosts: ['a11y-frontend', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://a11y-backend:3005',
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
    hmr: {
      clientPort: 5175,
    },
  },
})
