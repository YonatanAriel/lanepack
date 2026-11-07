import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 43123,
    host: '127.0.0.1',
  },
  preview: {
    port: 43123,
    host: '127.0.0.1',
    strictPort: true,
  },
})
