import axios from 'axios';

// URL base del backend
const axiosClient = axios.create({
    baseURL: 'http://192.168.1.55:8080',
    // ← usa tu IP local en vez de localhost
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor de request
// Agrega el token automáticamente en cada petición
// No tienes que ponerlo manualmente en cada llamada
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response
// Si el token expira redirige al login automáticamente
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.response?.config?.url;

        // Solo cierra sesión si es 401 (token expirado)
        // NO en 403 (sin permisos) ni en otros errores
        if (status === 401 && !url?.includes('/auth/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);
export default axiosClient;