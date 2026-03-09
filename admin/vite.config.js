import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // Re-habilita esto para los alias

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Es vital mantener los alias sincronizados con tu estructura de software engineering
      '@': path.resolve( './src'),
    },
  },
  server: {
    port: 5174, 
    host: true,
    strictPort: true,
    allowedHosts: [
      '.ngrok-free.app', 
      '.ngrok-free.dev', 
      'yaretzi-asbestous-jerrell.ngrok-free.dev'
    ],
    // Mantenemos el proxy solo si NO usas la URL completa en Axios
    proxy: {
      '/api/dashboard': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      protocol: 'wss',
      host: 'yaretzi-asbestous-jerrell.ngrok-free.dev',
      clientPort: 443, // 🚨 CORREGIDO: ngrok siempre usa 443 para HTTPS
    },
  },
})