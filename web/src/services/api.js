import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Singleton para getToken de Clerk ────────────────────────────────────────
// Se inicializa en ClerkTokenSync.jsx, dentro del árbol de ClerkProvider
let _getToken = null;
export const setTokenGetter = (fn) => {
  _getToken = fn;
};

// ─── Request interceptor — adjunta token Clerk a cada petición ───────────────
api.interceptors.request.use(
  async (config) => {
    if (_getToken) {
      try {
        const token = await _getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Usuario no autenticado — la petición continúa sin token
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — manejo global de errores ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // No redirigir automáticamente — Clerk maneja la sesión
          break;

        case 403:
          if (data?.code === 'ACCOUNT_INACTIVE') {
            toast.error('Tu cuenta ha sido desactivada. Serás redirigido.');
            setTimeout(() => {
              window.location.href = '/cuenta-inactiva';
            }, 1500);
          } else {
            toast.error('No tienes permisos para realizar esta acción.');
          }
          break;

        case 404:
          // No mostrar toast para 404 — los hooks lo manejan con fallback a mock
          break;

        case 422:
          if (data?.error?.details) {
            Object.values(data.error.details).forEach((msg) => {
              toast.error(msg);
            });
          }
          break;

        case 429:
          toast.error('Demasiadas solicitudes. Por favor espera un momento.');
          break;

        case 500:
          toast.error('Error del servidor. Por favor intenta más tarde.');
          break;

        default:
          if (status >= 500) {
            toast.error(
              data?.message ||
                data?.error?.message ||
                'Ocurrió un error. Por favor intenta nuevamente.'
            );
          }
      }
    } else if (error.request) {
      // No mostrar toast aquí — los hooks hacen fallback a datos mock
      console.warn('Sin conexión al servidor — usando datos locales');
    }

    return Promise.reject(error);
  }
);

export default api;
