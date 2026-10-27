/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The new service worker takes over as soon as it is installed; src/pwa/updates.ts
      // registers it, keeps checking for new versions and picks when to reload.
      registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        // txt and webp bring in the Word Warrior dictionary and art, so it plays offline.
        globPatterns: ['**/*.{js,css,html,txt,webp}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Game Hub',
        short_name: 'Game Hub',
        description: 'A mobile-first collection of quick browser games.',
        theme_color: '#0b0b14',
        background_color: '#0b0b14',
        display: 'fullscreen',
        // The lobby rotates freely; each game locks its own orientation.
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
