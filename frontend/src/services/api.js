import axios from "axios";
import { getAccessToken } from "./supabase";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL,
});

// Interceptor para enviar o token do Supabase em todas requisições
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para respostas (opcional, útil para 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 Unauthorized! Verifique a sessão do Supabase.");
    }
    return Promise.reject(error);
  }
);
