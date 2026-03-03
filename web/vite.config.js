import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    // Eliminamos 'open: true' para que no abra mil pestañas al usar ngrok
    allowedHosts: [
      '.ngrok-free.app', 
      '.ngrok-free.dev', 
      'yaretzi-asbestous-jerrell.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // 🛡️ CORRECCIÓN: Si tu backend en Node ya espera las rutas con "/api" 
        // (ej: app.use('/api', routes)), NO debes usar rewrite.
        // Si tu backend NO usa el prefijo /api, deja el rewrite.
        // Lo normal es quitarlo para que coincida con tu .env
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
    // 🚀 CORRECCIÓN HMR: Esto arregla el error "failed to connect to websocket"
    hmr: {
      protocol: 'wss',
      host: 'yaretzi-asbestous-jerrell.ngrok-free.dev',
      clientPort: 443,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-forms': ['react-hook-form', 'yup', '@hookform/resolvers'],
          'vendor-ui': ['react-icons', 'react-toastify'],
          'vendor-utils': ['axios', 'moment'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})