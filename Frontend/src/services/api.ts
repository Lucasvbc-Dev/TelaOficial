import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { useAuth } from '@/contexts/AuthContext';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Requisição
 * Adiciona token JWT ao header Authorization
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@tela:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Resposta
 * Trata erros globalmente
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Se token expirou, redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('@tela:token');
      localStorage.removeItem('@tela:usuario');
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    // Log de erros em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
