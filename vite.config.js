import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const REQUIRED_ENV = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

function requireSupabaseEnv(mode) {
  const env = loadEnv(mode, process.cwd(), '')
  const missing = REQUIRED_ENV.filter((key) => !env[key]?.trim())

  if (missing.length > 0) {
    throw new Error(
      `Missing required env for build: ${missing.join(', ')}. ` +
        'Add them to .env locally or as GitHub Actions secrets (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).'
    )
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  if (command === 'build') {
    requireSupabaseEnv(mode)
  }

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'favicon.ico',
          'favicon-32.png',
          'icons.svg',
          'apple-touch-icon-180x180.png',
        ],
        manifest: {
        name: 'KitPOP de Facilitación',
        short_name: 'KitPOP',
        description:
          'Kit de actividades para facilitación grupal — dinámicas, talleres y bitácora.',
        theme_color: '#3b1e8e',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@paypal')) {
              return 'paypal'
            }
            if (id.includes('node_modules/@supabase')) {
              return 'supabase'
            }
          },
        },
      },
    },
  }
})
