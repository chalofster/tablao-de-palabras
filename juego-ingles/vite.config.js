import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono-180.png'],
      manifest: {
        name: 'Tablao de Palabras',
        short_name: 'Tablao',
        lang: 'es',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#fdf0d5',
        theme_color: '#d62828',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png}'],
        // Phaser supera el límite por defecto de 2 MB.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: { environment: 'node' },
});
