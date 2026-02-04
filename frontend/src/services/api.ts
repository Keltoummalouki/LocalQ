import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', 
});

// Intercepteur pour INJECTER le token 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour GÉRER L'EXPIRATION 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le backend répond "401 Unauthorized"
    if (error.response && error.response.status === 401) {
      // On supprime le token périmé
      localStorage.removeItem('token');
      // On redirige vers la page de connexion
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;