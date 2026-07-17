import { fileURLToPath, URL } from 'node:url'

import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
        '@packages': fileURLToPath(new URL('./packages', import.meta.url)),
        '@hooks': fileURLToPath(new URL('./hooks', import.meta.url)),
        // Browser shim so `process` isn't a bare ReferenceError at runtime;
        // only the specific env var below is actually inlined into the bundle.
        process: 'process/browser',
      },
    },
    define: {
      'process.env.NEXT_PUBLIC_API_BASE_URL': JSON.stringify(env.NEXT_PUBLIC_API_BASE_URL ?? ''),
    },
    server: {
      proxy: {
        '/api/v1': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          headers: {
            'x-api-key': env.API_KEY,
          },
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
