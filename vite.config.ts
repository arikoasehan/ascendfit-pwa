import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// AscendFit — Vite config.
// The VitePWA plugin generates the service worker (via Workbox) and injects
// the manifest link automatically; manifest content itself lives below so
// it's one source of truth instead of also hand-maintaining public/manifest.json.
export default defineConfig({
  server: {
    // Bind to 0.0.0.0 (not just localhost) so the dev server is reachable
    // from other devices on the same WiFi — e.g. your iPhone, via the
    // "Network:" URL Vite prints on startup. See README.md "Testing on iPhone"
    // for the HTTP-vs-HTTPS caveat that affects service worker/install behavior
    // on a plain http:// LAN address.
    host: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'AscendFit',
        short_name: 'AscendFit',
        description: 'An offline-first RPG fitness system — turn training into progression.',
        theme_color: '#06070B',
        background_color: '#06070B',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache-first for the app shell so it loads instantly offline;
        // Dexie/IndexedDB handles actual data, this just caches the JS/CSS/HTML.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
      devOptions: {
        enabled: true, // lets you test the service worker during `vite dev`, not just in a production build
      },
    }),
  ],
});
