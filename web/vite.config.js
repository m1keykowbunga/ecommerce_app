import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //  Define la base como './' para que los archivos 
  // se encuentren correctamente independientemente de la subcarpeta.
  base: '/', 
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
        // Como tu backend usa app.use('/api', ...), NO necesitamos rewrite.
      },
    },
    // Esto arregla el error de WebSocket en ngrok mientras desarrollas
    hmr: {
      protocol: 'wss',
      host: 'yaretzi-asbestous-jerrell.ngrok-free.dev',
      clientPort: 443,
    },
  },
  build: {
    outDir: 'dist',
    //  Generar sourcemap: false ayuda a proteger tu código de curiosos
    sourcemap: false,
    //  Limpieza automática de la carpeta dist antes de cada build
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Esto evita que los nombres de archivos sean predecibles por seguridad
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
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