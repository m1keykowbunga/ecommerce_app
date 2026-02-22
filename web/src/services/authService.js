import api from './api';

export const authService = {
  // Registro de usuario
  register: async (userData) => {
    const response = await api.post('/user/register', userData);
    return response.data;
  },

  // Inicio de sesión
  login: async (credentials) => {
    const response = await api.post('/user/login', credentials);
    return response.data;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  // Obtener perfil
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },

  // Eliminar cuenta
  deleteAccount: async () => {
    const response = await api.delete('/user/profile');
    return response.data;
  },
};
