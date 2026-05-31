import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // './' makes all assets relative — works at any GitHub Pages subdirectory path
  base: './',
  build: {
    // Increase chunk size warning threshold for emoji-heavy bundles
    chunkSizeWarningLimit: 600,
  },
})
