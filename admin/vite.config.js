import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
//import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
   
  },
  server: {
    port: 5174, // Puerto del Admin
    host: true,
    strictPort: true,
    allowedHosts: [
      '.ngrok-free.app', 
      '.ngrok-free.dev', 
      'yaretzi-asbestous-jerrell.ngrok-free.dev'
    ],
    // 💡 Si quieres evitar CORS en el Admin como lo haces en la Web:
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      protocol: 'wss',
      host: 'yaretzi-asbestous-jerrell.ngrok-free.dev',
      clientPort: 444,
    },
  },
})