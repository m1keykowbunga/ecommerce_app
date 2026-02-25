import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect, useRef } from "react";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useRouter } from "expo-router";

const getApiUrl = () => {
  if (!__DEV__) {
    return "https://tu-dominio-produccion.com/api";
  }

  const debuggerHost = Constants.expoConfig?.hostUri?.split(":").shift();

  if (debuggerHost) {
    console.log("📱 Usando IP detectada por Expo:", debuggerHost);
    return `http://${debuggerHost}:3000/api`;
  }

  if (Platform.OS === "android") {
    console.log("🤖 Fallback emulador Android");
    return "http://10.0.2.2:3000/api";
  }

  const MANUAL_IP = "192.168.40.137";
  console.log("💻 Usando IP manual:", MANUAL_IP);
  return `http://${MANUAL_IP}:3000/api`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  }
});

export const useApi = () => {
  const { getToken, isSignedIn, signOut } = useAuth();
  const router = useRouter();

  const requestInterceptorRef = useRef<number | null>(null);
  const responseInterceptorRef = useRef<number | null>(null);

  useEffect(() => {
    if (requestInterceptorRef.current !== null) {
      api.interceptors.request.eject(requestInterceptorRef.current);
    }
    if (responseInterceptorRef.current !== null) {
      api.interceptors.response.eject(responseInterceptorRef.current);
    }

    requestInterceptorRef.current = api.interceptors.request.use(
      async (config) => {
        try {
          const skipCache = config.headers['X-Retry-Request'] === 'true';

          const token = await getToken({
            template: "app-jwt",
            skipCache
          });

          

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`URL: ${config.baseURL}${config.url}`);
            console.log("Token:", token);
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

    responseInterceptorRef.current = api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 403 &&
          error.response?.data?.code === "ACCOUNT_INACTIVE"
        ) {
          await signOut();
          router.replace("/account-inactive");
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

          originalRequest._retry = true;

          try {
            originalRequest.headers['X-Retry-Request'] = 'true';
            return await api(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      if (requestInterceptorRef.current !== null) {
        api.interceptors.request.eject(requestInterceptorRef.current);
      }
      if (responseInterceptorRef.current !== null) {
        api.interceptors.response.eject(responseInterceptorRef.current);
      }
    };
  }, [getToken, isSignedIn, router, signOut]);

  return api;
};

export const userApi = {
  getProfile: async () => {
    const { data } = await api.get("/users/profile");
    return data;
  },

  updateProfile: async (profileData: {
    documentType?: "cedula_ciudadania" | "cedula_extranjeria" | null;
    documentNumber?: string;
    gender?: "masculino" | "femenino" | "otro" | null;
    dateOfBirth?: string | null; // "YYYY-MM-DD"
  }) => {
    const { data } = await api.put("/users/profile", profileData);
    return data;
  },
};

export default api;