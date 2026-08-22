import api from './api';

export const authService = {
  validateInvitation: async (token) => {
    const response = await api.get('/auth/invitation/validate', {
      params: { token }
    });
    return response.data;
  },

  activateAccount: async (activationData) => {
    const response = await api.post('/auth/activate', activationData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  }
};
