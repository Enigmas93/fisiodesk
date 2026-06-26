import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa/icon-192.png', 'pwa/icon-512.png', 'pwa/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'FisioDesk',
        short_name: 'FisioDesk',
        description: 'Sistema de gestao para fisioterapeutas com agenda, pacientes, financeiro e prontuario.',
        theme_color: '#0ea5e9',
        background_color: '#f8fafc',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['medical', 'health', 'productivity', 'business'],
        lang: 'pt-BR',
        icons: [
          {
            src: '/pwa/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('@fullcalendar')) return 'fullcalendar'
          if (id.includes('recharts')) return 'charts'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('@tanstack/react-query') || id.includes('zustand')) return 'state'
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) return 'react'
          if (id.includes('lucide-react')) return 'icons'
        },
      },
    },
  },
})
