import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['rainless-jeremiah-uncogged.ngrok-free.dev'],
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/uploads': 'http://127.0.0.1:8000',
    },
  },
  preview: {
    port: 5173,
    allowedHosts: ['rainless-jeremiah-uncogged.ngrok-free.dev'],
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/uploads': 'http://127.0.0.1:8000',
    },
  },
})
