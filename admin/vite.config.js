import { defineConfig, loadEnv } from 'vite' // 1. Agregamos loadEnv
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url' // 2. Necesario para resolver rutas en ESM

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  // Cargamos variables (para usar VITE_API_URL si es necesario)
const env = loadEnv(mode, path.resolve(__dirname, '../../'), 'VITE_')

  return {
    plugins: [react(), tailwindcss()],
    
    // 🚨 OJO AQUÍ: Si tu backend sirve el admin en una ruta específica, está bien.
    // Pero si Render lo sirve como estático independiente, suele ser '/'
    base: '/admin/', 

    resolve: {
      alias: {
        // 🚨 CORRECCIÓN: Usamos __dirname para que Render sepa exactamente dónde está 'src'
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 5174, 
      host: true,
      strictPort: true,
      // Solo habilitamos ngrok en desarrollo
      allowedHosts: mode === 'development' ? [
        '.ngrok-free.app', 
        '.ngrok-free.dev', 
        'yaretzi-asbestous-jerrell.ngrok-free.dev'
      ] : [],
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
      // 🚨 CORRECCIÓN: Solo activamos HMR en desarrollo
      hmr: mode === 'development' ? {
        protocol: 'wss',
        host: 'yaretzi-asbestous-jerrell.ngrok-free.dev',
        clientPort: 443,
      } : false,
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },

    // Inyectamos la variable para que Axios la lea en el frontend
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/api'),
    }
  }
})