import { defineConfig, loadEnv } from 'vite' // Añadimos loadEnv
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  // Cargamos las variables de entorno según el modo (production/development)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Base '/' es perfecta para Render
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
      // Solo aplicamos estas reglas si NO estamos en producción
      allowedHosts: mode === 'development' ? [
        '.ngrok-free.app', 
        '.ngrok-free.dev', 
        'yaretzi-asbestous-jerrell.ngrok-free.dev'
      ] : [],
      proxy: {
        '/api': {
          // Usamos la variable de entorno que definiste en Render o localhost por defecto
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
      // HMR solo necesario para ngrok en desarrollo
      hmr: mode === 'development' ? {
        protocol: 'wss',
        host: 'yaretzi-asbestous-jerrell.ngrok-free.dev',
        clientPort: 443,
      } : false,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
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
    
    // Define variables globales que el código usará en producción
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/api'),
    }
  }
})