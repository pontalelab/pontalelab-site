import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/games/pokopokosea/',
  server: {
    host: true,   // LAN上の他端末（スマホ等）からアクセス可能にする
    port: 5173,
  },
  build: {
    // CIがここからビルド成果物を games/pokopokosea/ 直下（本番の配信場所）へ
    // コピーする。'dist' はビルド時にのみ生成される一時フォルダで、
    // .gitignore によりリポジトリにはコミットされない。
    outDir: 'dist',
  },
})
