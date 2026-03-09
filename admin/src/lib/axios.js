import axios from "axios";

const axiosInstance = axios.create({
    // Prioriza siempre la variable de entorno
    baseURL: import.meta.env.VITE_API_URL, 
    timeout: 10000, // Aumentamos un poco por la latencia de ngrok
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' 
    },
});

let getTokenFunction = null;
export const initializeAxiosAuth = (getToken) => {
    getTokenFunction = getToken;
};

axiosInstance.interceptors.request.use(
    async (config) => {
        if (!getTokenFunction) return config;
        try {
            const token = await getTokenFunction({ template: "app-jwt" });
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("❌ Error obteniendo token:", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🛡️ UNIFICADO: Interceptor de respuesta
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Caso 1: Error de red (ngrok caído o timeout)
        if (!error.response) {
            console.warn("📡 Problema de conexión. Verifica que ngrok esté corriendo.");
            return Promise.reject(error);
        }

        // Caso 2: Error 401 (Token expirado o inválido)
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log("🔄 Reintentando con token fresco...");
            
            try {
                const newToken = await getTokenFunction({ skipCache: true });
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (retryError) {
                return Promise.reject(retryError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;