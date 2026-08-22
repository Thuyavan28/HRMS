import api from './api';

export const attendanceService = {
  getMyAttendance: async () => {
    const response = await api.get('/attendance/me');
    return response.data;
  },

  checkIn: async () => {
    const response = await api.post('/attendance/checkin');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/attendance/checkout');
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  }
};
