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
        '/api/dogs': {
          target: 'https://dog.ceo/api',
          changeOrigin: true,
          // Adapts our own /api/dogs/* surface onto the upstream Dog CEO API's
          // differently-shaped routes so the frontend never depends on a
          // third-party URL scheme directly.
          rewrite: (path) => {
            if (path === '/api/dogs/breeds') return '/breeds/list/all'
            const match = path.match(/^\/api\/dogs\/breeds\/([^/]+)\/images$/)
            return match ? `/breed/${match[1]}/images` : path
          },
        },
        // TheDogAPI. The key is attached here, server-side, so it never ships
        // in the client bundle or shows up in the browser's network tab —
        // the frontend only ever calls our own same-origin /api/v1/* path.
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
