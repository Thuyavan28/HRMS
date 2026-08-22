import api from './api';

export const payrollService = {
  getMyPayroll: async (monthCode) => {
    const params = monthCode ? { monthCode } : {};
    const response = await api.get('/payroll/me', { params });
    return response.data;
  },

  downloadPayslip: async (monthCode) => {
    const response = await api.get(`/payroll/me/slip/${monthCode || 'latest'}`, {
      responseType: 'blob'
    });

    // Create a blob URL and trigger browser download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dayflow_Payslip_${monthCode || 'current'}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  }
};
