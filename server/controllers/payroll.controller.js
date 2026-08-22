import { dataStore } from '../repositories/dataStore.js';
import { generatePayslipPdf } from '../utils/pdfGenerator.js';

export const getMyPayroll = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const records = dataStore.getPayrollForEmployee(employeeId);
    const profile = dataStore.getEmployeeProfile(employeeId);

    // Selected / latest record
    const monthCode = req.query.monthCode;
    let selectedRecord = records[0] || null;

    if (monthCode && monthCode !== 'latest') {
      const found = records.find(r => r.monthCode === monthCode);
      if (found) selectedRecord = found;
    }

    res.status(200).json({
      success: true,
      data: {
        records,
        currentRecord: selectedRecord,
        salaryStructure: profile ? profile.salaryStructure : null,
        availableMonths: records.map(r => ({ label: r.month, code: r.monthCode }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadPayslip = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const { month } = req.params;

    const records = dataStore.getPayrollForEmployee(employeeId);
    const profile = dataStore.getEmployeeProfile(employeeId);

    let targetRecord = records.find(r => r.monthCode === month || r.month.toLowerCase().includes(month.toLowerCase()));
    if (!targetRecord && records.length > 0) {
      targetRecord = records[0];
    }

    if (!targetRecord) {
      return res.status(404).json({
        success: false,
        message: 'No payroll record found for the specified period.'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Dayflow_Payslip_${targetRecord.monthCode || 'current'}_${employeeId}.pdf`);

    generatePayslipPdf(targetRecord, profile || {}, res);
  } catch (error) {
    next(error);
  }
};
