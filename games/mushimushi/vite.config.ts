import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // bind to 0.0.0.0 — allows LAN / smartphone access
  },
  build: {
    outDir: 'docs',
    chunkSizeWarningLimit: 600,
  },
})
