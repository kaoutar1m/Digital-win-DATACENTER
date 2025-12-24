import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002, // Modifié pour correspondre à l'URL que vous utilisez (http://localhost:3002/)
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend sur le port 3001
        changeOrigin: true,
        // J'ai retiré le rewrite pour conserver le préfixe /api dans les requêtes
        // Cela évite les problèmes de routage avec le backend
      },
    },
  },
})
