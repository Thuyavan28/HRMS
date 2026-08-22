import api from './api';

export const employeeService = {
  getDashboard: async () => {
    const response = await api.get('/employee/dashboard');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/employee/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/employee/profile', profileData);
    return response.data;
  }
};
