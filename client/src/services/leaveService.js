import api from './api';

export const leaveService = {
  getMyLeaves: async () => {
    const response = await api.get('/leave/me');
    return response.data;
  },

  applyLeave: async (leaveData) => {
    const response = await api.post('/leave/apply', leaveData);
    return response.data;
  },

  cancelLeave: async (leaveId) => {
    const response = await api.delete(`/leave/${leaveId}`);
    return response.data;
  }
};
