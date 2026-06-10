import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',          // папка с исходниками
  build: {
    outDir: '../dist',   // сборка в dist
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.html'
    }
  },
  server: {
    port: 3000,
    open: true
  }
})