import axios from "axios";

// Log de depuración para verificar la URL
console.log("🔍 Mi URL de API es:", import.meta.env.VITE_API_URL);

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://yaretzi-asbestous-jerrell.ngrok-free.dev/api",
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' // VITAL para evitar la pantalla de aviso de ngrok
    },
});

let getTokenFunction = null;
export const initializeAxiosAuth = (getToken) => {
    getTokenFunction = getToken;
};

axiosInstance.interceptors.request.use(
    async (config) => {
        if (!getTokenFunction) {
            return config;
        }

        try {
            const skipCache = config.headers['X-Retry-Request'] === 'true';

            const token = await getTokenFunction({
                template: "app-jwt",
                skipCache,
            });

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;

                if (import.meta.env.DEV) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
                        const status = skipCache ? "Generado" : "Cargado desde caché";
                        console.log(`Token ${status} - expira en ${Math.floor(expiresIn / 60)}min`);
                    } catch (e) {
                        console.log("Error al decodificar token");
                    }
                }
            }

            if (config.data && !(config.data instanceof FormData)) {

                if (!config.headers['Content-Type']) {
                    config.headers['Content-Type'] = 'application/json';
                }
            }

        } catch (error) {
            console.error("Error obteniendo token:", error);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {

                originalRequest.headers['X-Retry-Request'] = 'true';

                return await axiosInstance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
