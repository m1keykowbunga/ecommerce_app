import axios from 'axios';
import { toast } from 'react-toastify';

console.log("🔍 Mi URL de API es:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://yaretzi-asbestous-jerrell.ngrok-free.dev/api",
  timeout: 10000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

let _getToken = null;

export const setTokenGetter = (fn) => {
  console.log("🔗 API: Token getter vinculado correctamente");
  _getToken = fn;
};

// ─── Interceptor de Peticiones (Request) ─────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    if (_getToken) {
      try {
        const token = await _getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // Eliminamos los logs de 'error' y 'originalRequest' de aquí porque no existen todavía
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
    // 🚨 LOG DE DEPURACIÓN CORREGIDO (Aquí es donde sí existen estas variables)
    console.log("------- 🛑 ERROR DE API DETECTADO -------");
    console.log(`📡 Ruta: ${error.config?.url}`);
    console.log(`🔢 Status: ${error.response?.status || 'N/A'}`);
    console.log(`📝 Mensaje:`, error.response?.data || error.message);

    if (!error.response) {
      console.warn('📡 Sin conexión al servidor — el sistema podría usar datos locales.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        console.warn("🚫 401: Token inválido o expirado");
        // Aquí podrías disparar un logout si es necesario
        break;
      case 403:
        toast.error('Acceso denegado: No tienes permisos.');
        break;
      case 422:
        toast.error(data?.message || data?.error || 'Datos inválidos');
        break;
      case 500:
        if (!data?.error?.includes("Cast to ObjectId")) {
           toast.error('Error interno del servidor.');
        }
        break;
      default:
        if (status >= 500) {
          toast.error('Ocurrió un error inesperado.');
        }
    }

    return Promise.reject(error);
  }
);

export default api;