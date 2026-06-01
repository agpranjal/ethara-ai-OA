import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/products': 'http://localhost:8000',
      '/customers': 'http://localhost:8000',
      '/orders': 'http://localhost:8000',
      '/dashboard': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
