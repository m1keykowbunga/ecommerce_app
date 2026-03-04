import axios from 'axios';
import { toast } from 'react-toastify';

// Log de depuración para verificar la URL
console.log("🔍 Mi URL de API es:", import.meta.env.VITE_API_URL);

const api = axios.create({
  // Priorizamos la URL de entorno, si no, usamos tu ngrok actual
  baseURL: import.meta.env.VITE_API_URL || "https://yaretzi-asbestous-jerrell.ngrok-free.dev/api",
  timeout: 10000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true' || '69420' // VITAL para evitar la pantalla de aviso de ngrok
  },
  withCredentials: true
});

// ─── Singleton para el getter del token ──────────────────────────────────────
let _getToken = null;

/**
 * Conecta la función getToken de Clerk con la instancia de Axios
 */
export const setTokenGetter = (fn) => {
  console.log("🔗 API: Token getter vinculado correctamente");
  _getToken = fn;
};

// ─── Interceptor de Peticiones (Request) ─────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    if (_getToken) {
      try {
        // Obtenemos el token de Clerk de forma asíncrona
        const token = await _getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
            console.log("🔑 Token adjuntado a la petición"); // Descomenta para debuggear
            // 🚨 LOG DE DEPURACIÓN CRÍTICO
            console.log("------- 🛑 ERROR DE API DETECTADO -------");
            console.log(`📡 Ruta: ${originalRequest?.url}`);
            console.log(`🔢 Status: ${error.response?.status}`);
            console.log(`📝 Mensaje:`, error.response?.data || error.message);
        }
      } catch (error) {
        console.error("❌ Error obteniendo el token de Clerk:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de Respuestas (Response) ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si no hay respuesta del servidor (Error de red / Ngrok caído)
    if (!error.response) {
      console.warn('📡 Sin conexión al servidor — el sistema podría usar datos locales.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // El backend rechazó el token. 
        console.warn("🚫 401: Token inválido o expirado");
        break;

      case 403:
        toast.error('Acceso denegado: No tienes permisos.');
        break;

      case 422:
        // Errores de validación
        const msg = data?.message || data?.error || 'Datos inválidos';
        toast.error(msg);
        break;

      case 500:
        // Si no es un error de "Producto no encontrado" manejado, mostrar toast
        if (!data?.error?.includes("Cast to ObjectId")) {
           toast.error('Error interno del servidor. Revisa la terminal del backend.');
        }
        break;

      default:
        // Errores generales
        if (status >= 500) {
          toast.error('Ocurrió un error inesperado en el servidor.');
        }
    }

    return Promise.reject(error);
  }
);

export default api;