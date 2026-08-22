import { dataStore } from '../repositories/dataStore.js';
import bcrypt from 'bcryptjs';

// 1. ADMIN DASHBOARD
export const getAdminDashboard = async (req, res, next) => {
  try {
    const allEmployees = dataStore.getAllEmployees();
    const activeEmployees = allEmployees.filter(e => e.status === 'Active');
    const allPayroll = dataStore.getAllPayroll({ monthCode: '2026-08' });
    const allLeaves = dataStore.getAllLeaves();
    const pendingLeaves = allLeaves.filter(l => l.status === 'Pending');

    const totalPayrollAmount = allPayroll.reduce((acc, p) => acc + p.netSalary, 0);

    // KPI Summary
    const kpis = {
      totalEmployees: allEmployees.length,
      activeEmployees: activeEmployees.length,
      employeeChange: 8.5,
      totalPayrolls: totalPayrollAmount,
      payrollChange: 4.2,
      turnoverRate: 2.1,
      turnoverChange: -0.8,
      jobApplicants: 48,
      applicantsChange: 19.5,
      employeeSatisfaction: 94.6 // Satisfaction gauge (out of 100)
    };

    // Team KPI Line Chart Trend (Past 6 months)
    const teamKpiTrend = [
      { month: 'Mar', productivity: 88, attendanceRate: 95, satisfaction: 91 },
      { month: 'Apr', productivity: 90, attendanceRate: 94, satisfaction: 92 },
      { month: 'May', productivity: 92, attendanceRate: 96, satisfaction: 93 },
      { month: 'Jun', productivity: 91, attendanceRate: 95, satisfaction: 93 },
      { month: 'Jul', productivity: 94, attendanceRate: 97, satisfaction: 94 },
      { month: 'Aug', productivity: 95, attendanceRate: 96, satisfaction: 95 }
    ];

    // Employment Status Breakdown Bar Chart
    const employmentStatusData = [
      { type: 'Full-Time (Remote)', count: allEmployees.filter(e => e.jobDetails?.workType?.includes('Remote')).length || 3 },
      { type: 'Full-Time (Hybrid)', count: allEmployees.filter(e => e.jobDetails?.workType?.includes('Hybrid')).length || 3 },
      { type: 'On-site', count: allEmployees.filter(e => e.jobDetails?.workType?.includes('On-site')).length || 1 },
      { type: 'Contractor', count: 1 }
    ];

    // Department Distribution
    const departmentDistribution = [
      { name: 'Engineering', value: 3, color: '#00C896' },
      { name: 'Design & UX', value: 1, color: '#38BDF8' },
      { name: 'Product', value: 1, color: '#F59E0B' },
      { name: 'Human Resources', value: 2, color: '#A855F7' },
      { name: 'Infrastructure', value: 1, color: '#EC4899' }
    ];

    // Leave Summary
    const leaveSummary = {
      pendingApprovals: pendingLeaves.length,
      onLeaveToday: 1,
      upcomingLeaves: allLeaves.filter(l => l.status === 'Approved' && new Date(l.fromDate) > new Date()).length
    };

    // Recent Employees Table
    const recentEmployees = allEmployees.slice(0, 5).map(e => ({
      id: e.id,
      employeeId: e.employeeId,
      fullName: e.fullName,
      email: e.email,
      department: e.jobDetails?.department || 'General',
      designation: e.jobDetails?.designation || 'Staff',
      workType: e.jobDetails?.workType || 'Full-Time',
      status: e.status,
      avatar: e.avatar,
      joinDate: e.jobDetails?.joinDate
    }));

    res.status(200).json({
      success: true,
      data: {
        kpis,
        teamKpiTrend,
        employmentStatusData,
        departmentDistribution,
        leaveSummary,
        recentEmployees
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. EMPLOYEE DIRECTORY & MANAGEMENT
export const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const all = dataStore.getAllEmployees({ search, department, status });

    const total = all.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = all.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      data: {
        employees: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let employee = dataStore.getEmployeeProfile(id) || dataStore.employees.find(e => e.id === id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { fullName, employeeId, email, password, role, department, title, designation, workType, basicSalary } = req.body;

    const existing = dataStore.findUserByEmail(email) || dataStore.getEmployeeProfile(employeeId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email or ID already exists.'
      });
    }

    const defaultPass = password || 'Employee@1234';
    const passwordHash = await bcrypt.hash(defaultPass, 12);

    const newUser = dataStore.createUser({
      fullName,
      employeeId,
      email,
      passwordHash,
      role: role || 'employee',
      isVerified: true
    });

    const basic = Number(basicSalary) || 6000;
    const hra = Math.round(basic * 0.3);
    const transport = 500;
    const medical = 500;
    const gross = basic + hra + transport + medical;
    const taxDeduction = Math.round(gross * 0.15);
    const pfDeduction = Math.round(basic * 0.12);
    const netSalary = gross - taxDeduction - pfDeduction;

    const updatedProfile = dataStore.updateEmployeeProfile(employeeId, {
      fullName,
      jobDetails: {
        title: title || 'Software Engineer',
        department: department || 'Engineering',
        designation: designation || 'Staff IC',
        workType: workType || 'Full-Time (Remote)',
        joinDate: new Date().toISOString().split('T')[0],
        reportingManager: 'Eleanor Vance',
        location: 'HQ / Remote',
        workShift: '09:00 AM - 05:30 PM'
      },
      salaryStructure: {
        currency: 'USD',
        basic,
        hra,
        transport,
        medical,
        gross,
        taxDeduction,
        pfDeduction,
        netSalary
      }
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = dataStore.getEmployeeProfile(id) || dataStore.employees.find(e => e.id === id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    const updated = dataStore.updateEmployeeProfile(employee.employeeId, req.body);

    res.status(200).json({
      success: true,
      message: 'Employee details updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = dataStore.getEmployeeProfile(id) || dataStore.employees.find(e => e.id === id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    const newStatus = employee.status === 'Active' ? 'Deactivated' : 'Active';
    const updated = dataStore.updateEmployeeProfile(employee.employeeId, { status: newStatus });

    res.status(200).json({
      success: true,
      message: `Employee ${employee.fullName} marked as ${newStatus}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 3. ATTENDANCE MANAGEMENT
export const getAdminAttendance = async (req, res, next) => {
  try {
    const { employeeId, status, date } = req.query;
    const records = dataStore.getAllAttendance({ employeeId, status, date });
    const allEmployees = dataStore.getAllEmployees();

    // Attach employee details to records
    const enrichedRecords = records.map(r => {
      const emp = allEmployees.find(e => e.employeeId === r.employeeId);
      return {
        ...r,
        employeeName: emp ? emp.fullName : r.employeeId,
        department: emp?.jobDetails?.department || 'General',
        avatar: emp?.avatar
      };
    });

    // Summary counts
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === todayStr);

    res.status(200).json({
      success: true,
      data: {
        records: enrichedRecords,
        summary: {
          totalTracked: records.length,
          presentToday: todayRecords.filter(r => r.status === 'Present').length,
          lateToday: todayRecords.filter(r => r.status === 'Late').length,
          absentToday: todayRecords.filter(r => r.status === 'Absent').length,
          onTimeRate: 94.5
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. LEAVE MANAGEMENT
export const getAdminLeaves = async (req, res, next) => {
  try {
    const { status, employeeId } = req.query;
    const leaves = dataStore.getAllLeaves({ status, employeeId });

    res.status(200).json({
      success: true,
      data: {
        leaves,
        summary: {
          total: leaves.length,
          pending: leaves.filter(l => l.status === 'Pending').length,
          approved: leaves.filter(l => l.status === 'Approved').length,
          rejected: leaves.filter(l => l.status === 'Rejected').length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const adminName = req.user.fullName || 'Eleanor Vance';

    const updated = dataStore.updateLeaveStatus(id, 'Approved', comment, adminName);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Leave request for ${updated.employeeName} approved.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const adminName = req.user.fullName || 'Eleanor Vance';

    const updated = dataStore.updateLeaveStatus(id, 'Rejected', comment, adminName);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Leave request for ${updated.employeeName} rejected.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 5. PAYROLL MANAGEMENT & BULK RUN
export const getAdminPayroll = async (req, res, next) => {
  try {
    const { monthCode, status } = req.query;
    const payrollRecords = dataStore.getAllPayroll({ monthCode, status });

    const totalNet = payrollRecords.reduce((acc, p) => acc + p.netSalary, 0);
    const totalGross = payrollRecords.reduce((acc, p) => acc + p.gross, 0);
    const totalTax = payrollRecords.reduce((acc, p) => acc + p.taxDeduction, 0);

    res.status(200).json({
      success: true,
      data: {
        records: payrollRecords,
        summary: {
          totalDisbursed: totalNet,
          totalGross,
          totalTaxesWithheld: totalTax,
          totalEmployeesProcessed: payrollRecords.filter(p => p.status === 'Processed' || p.status === 'Paid').length,
          pendingProcessingCount: payrollRecords.filter(p => p.status === 'Pending').length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = dataStore.updatePayrollRecord(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payroll record updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const runBulkPayroll = async (req, res, next) => {
  try {
    const { monthName = 'August 2026', monthCode = '2026-08' } = req.body;
    const result = dataStore.runBulkPayroll(monthName, monthCode);

    res.status(200).json({
      success: true,
      message: `Bulk payroll run completed. ${result.count} new payslips generated for ${monthName}.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 6. FINANCE DASHBOARD
export const getFinanceDashboard = async (req, res, next) => {
  try {
    const financeData = dataStore.getFinanceDashboardData();
    res.status(200).json({
      success: true,
      data: financeData
    });
  } catch (error) {
    next(error);
  }
};

// 7. TIME MANAGEMENT DASHBOARD
export const getTimeManagementDashboard = async (req, res, next) => {
  try {
    const timeData = dataStore.getTimeManagementData();
    const allAttendance = dataStore.getAllAttendance();
    const livePunches = allAttendance.slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        ...timeData,
        liveCheckInFeed: livePunches
      }
    });
  } catch (error) {
    next(error);
  }
};

// 8. ADMIN REVIEWS
export const getAdminReviews = async (req, res, next) => {
  try {
    const { department, period } = req.query;
    const reviews = dataStore.getAllReviews({ department, period });

    const avgScore = reviews.length
      ? Math.round(reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        summary: {
          totalReviews: reviews.length,
          averageCompanyScore: avgScore,
          exceptionalCount: reviews.filter(r => r.score >= 95).length,
          exceedsCount: reviews.filter(r => r.score >= 85 && r.score < 95).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminReview = async (req, res, next) => {
  try {
    const newRev = dataStore.createReview({
      ...req.body,
      reviewer: req.user.fullName || 'Eleanor Vance',
      reviewerRole: 'VP of HR'
    });

    res.status(201).json({
      success: true,
      message: 'Performance review published successfully.',
      data: newRev
    });
  } catch (error) {
    next(error);
  }
};
