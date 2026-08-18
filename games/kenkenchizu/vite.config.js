import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // bind to 0.0.0.0 — allows LAN / smartphone access
  },
  build: {
    // CIがここからビルド成果物を games/kenkenchizu/ 直下（本番の配信場所）へ
    // コピーする。'dist' はビルド時にのみ生成される一時フォルダで、
    // .gitignore によりリポジトリにはコミットされない。
    outDir: 'dist',
  },
})
