import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // './' makes all assets relative — works at any GitHub Pages subdirectory path
  base: './',
  build: {
    outDir: 'docs',
    chunkSizeWarningLimit: 600,
  },
})
