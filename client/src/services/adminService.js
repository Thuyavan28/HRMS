import api from './api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getEmployees: async (params) => {
    const response = await api.get('/admin/employees', { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/admin/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (id, employeeData) => {
    const response = await api.patch(`/admin/employees/${id}`, employeeData);
    return response.data;
  },

  toggleEmployeeStatus: async (id) => {
    const response = await api.patch(`/admin/employees/${id}/status`);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data;
  },

  getInvitations: async () => {
    const response = await api.get('/admin/invitations');
    return response.data;
  },

  resendInvitation: async (id) => {
    const response = await api.post(`/admin/invitations/${id}/resend`);
    return response.data;
  },

  revokeInvitation: async (id) => {
    const response = await api.delete(`/admin/invitations/${id}`);
    return response.data;
  },

  getAttendance: async (params) => {
    const response = await api.get('/admin/attendance', { params });
    return response.data;
  },

  getLeaves: async (params) => {
    const response = await api.get('/admin/leaves', { params });
    return response.data;
  },

  approveLeave: async (id, comment) => {
    const response = await api.patch(`/admin/leave/${id}/approve`, { comment });
    return response.data;
  },

  rejectLeave: async (id, comment) => {
    const response = await api.patch(`/admin/leave/${id}/reject`, { comment });
    return response.data;
  },

  getPayroll: async (params) => {
    const response = await api.get('/admin/payroll', { params });
    return response.data;
  },

  updatePayroll: async (id, payrollData) => {
    const response = await api.patch(`/admin/payroll/${id}`, payrollData);
    return response.data;
  },

  runBulkPayroll: async (payload) => {
    const response = await api.post('/admin/payroll/run', payload);
    return response.data;
  },

  getFinanceDashboard: async () => {
    const response = await api.get('/admin/finance');
    return response.data;
  },

  getTimeManagementDashboard: async () => {
    const response = await api.get('/admin/timemanagement');
    return response.data;
  },

  getReviews: async (params) => {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },

  createReview: async (reviewData) => {
    const response = await api.post('/admin/reviews', reviewData);
    return response.data;
  }
};
