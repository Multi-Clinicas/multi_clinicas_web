import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // 1. Pega o ID numérico que salvamos no LocalStorage
      const tenantId = localStorage.getItem('@multiclinicas:tenantId');
      const isAdminLoginRoute = window.location.pathname.includes('/admin-login');

      if (tenantId && !isAdminLoginRoute) {
        config.headers['X-Clinic-ID'] = tenantId;
      }

      // 2. Auth: Injetar JWT Token
      const token = localStorage.getItem('@multiclinicas:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // GAP 3 — Tratamento global de erros 401 (token expirado) e 403 (clínica inativa via TenantInterceptor)
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        // O Super-Admin no painel /admin não deve ser deslogado por um 403 de clínica
        const isMasterAdmin =
          window.location.pathname.startsWith('/admin') &&
          !window.location.pathname.startsWith('/admin-login');

        if (!isMasterAdmin) {
          // Limpar token corrompido, expirado ou de clínica inativada
          localStorage.removeItem('@multiclinicas:token');

          // Se for 403 (clínica inativada em tempo real), avisar o usuário antes de redirecionar
          if (error.response?.status === 403 && window.location.pathname !== '/login') {
            alert('Sua sessão foi encerrada ou a clínica encontra-se inativa.');
          }

          // Evitar loop de redirecionamento caso já esteja na tela de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
