import { dataStore } from '../repositories/dataStore.js';
import { query } from '../config/db.js';
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
      employeeSatisfaction: 94.6
    };

    const teamKpiTrend = [
      { month: 'Mar', productivity: 88, attendanceRate: 95, satisfaction: 91 },
      { month: 'Apr', productivity: 90, attendanceRate: 94, satisfaction: 92 },
      { month: 'May', productivity: 92, attendanceRate: 96, satisfaction: 93 },
      { month: 'Jun', productivity: 91, attendanceRate: 95, satisfaction: 93 },
      { month: 'Jul', productivity: 94, attendanceRate: 97, satisfaction: 94 },
      { month: 'Aug', productivity: 95, attendanceRate: 96, satisfaction: 95 }
    ];

    const employmentStatusData = [
      { type: 'Full-Time (Remote)', count: allEmployees.filter(e => e.jobDetails?.workType?.includes('Remote')).length || 3 },
      { type: 'Full-Time (Hybrid)', count: allEmployees.filter(e => e.jobDetails?.workType?.includes('Hybrid')).length || 3 },
      { type: 'On-site', count: allEmployees.filter(e => e.jobDetails?.workType?.includes('On-site')).length || 1 },
      { type: 'Contractor', count: 1 }
    ];

    const departmentDistribution = [
      { name: 'Engineering', value: 3, color: '#00C896' },
      { name: 'Design & UX', value: 1, color: '#38BDF8' },
      { name: 'Product', value: 1, color: '#F59E0B' },
      { name: 'Human Resources', value: 2, color: '#A855F7' },
      { name: 'Infrastructure', value: 1, color: '#EC4899' }
    ];

    const leaveSummary = {
      pendingApprovals: pendingLeaves.length,
      onLeaveToday: 1,
      upcomingLeaves: allLeaves.filter(l => l.status === 'Approved' && new Date(l.fromDate) > new Date()).length
    };

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

/**
 * HR / Admin creates employee and assigns authoritative role.
 * Generates secure invitation token.
 */
export const createEmployee = async (req, res, next) => {
  try {
    const { fullName, employeeId, email, role, department, title, designation, workType, basicSalary, phone, address } = req.body;

    const existingEmp = dataStore.getEmployeeProfile(employeeId);
    if (existingEmp) {
      return res.status(409).json({
        success: false,
        message: `Employee ID ${employeeId} is already in use.`
      });
    }

    const existingUser = dataStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `An account or invitation with email ${email} already exists.`
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'employee';

    const basic = Number(basicSalary) || 85000;
    const hra = Math.round(basic * 0.4);
    const transport = 8000;
    const medical = 5000;
    const gross = basic + hra + transport + medical;
    const taxDeduction = Math.round(gross * 0.20);
    const pfDeduction = Math.round(basic * 0.12);
    const netSalary = gross - taxDeduction - pfDeduction;

    // 1. Create employee profile in pending 'Invited' state
    const newEmployee = {
      id: `emp-${Date.now()}`,
      employeeId,
      userId: null,
      fullName,
      email,
      phone: phone || '+91 98765 43210',
      address: address || 'Chennai HQ / Bengaluru',
      emergencyContact: 'Not specified',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
      status: 'Invited', // Will become 'Active' upon invitation setup
      jobDetails: {
        title: title || 'Software Engineer',
        department: department || 'Engineering',
        designation: designation || 'Staff IC',
        workType: workType || 'Full-Time (Remote)',
        joinDate: new Date().toISOString().split('T')[0],
        reportingManager: req.user?.fullName || 'Ananya Krishnan',
        location: 'HQ / Remote',
        workShift: '09:00 AM - 05:30 PM (IST)'
      },
      salaryStructure: {
        currency: 'INR',
        basic,
        hra,
        transport,
        medical,
        gross,
        taxDeduction,
        pfDeduction,
        netSalary
      },
      leaveBalances: {
        annual: 18,
        monthly: 2,
        daily: 5,
        hourly: 16,
        sick: 10
      },
      documents: []
    };

    dataStore.employees.unshift(newEmployee);

    // Persist new employee, salary structure, and leave balances directly into Neon DB
    await query(`
      INSERT INTO employees (employee_id, full_name, email, phone, address, emergency_contact, avatar, status, department, designation, job_title, work_type, join_date, reporting_manager, location, work_shift)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_DATE, $13, $14, $15)
      ON CONFLICT (employee_id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;
    `, [
      employeeId, fullName, email, newEmployee.phone, newEmployee.address,
      newEmployee.emergencyContact, newEmployee.avatar, 'Invited',
      newEmployee.jobDetails.department, newEmployee.jobDetails.designation,
      newEmployee.jobDetails.title, newEmployee.jobDetails.workType,
      newEmployee.jobDetails.reportingManager, newEmployee.jobDetails.location,
      newEmployee.jobDetails.workShift
    ]);

    await query(`
      INSERT INTO salary_structures (employee_id, currency, basic, hra, transport, medical, gross, tax_deduction, pf_deduction, net_salary)
      VALUES ($1, 'INR', $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (employee_id) DO NOTHING;
    `, [employeeId, basic, hra, transport, medical, gross, taxDeduction, pfDeduction, netSalary]);

    await query(`
      INSERT INTO leave_balances (employee_id, annual, monthly, daily, hourly, sick)
      VALUES ($1, 18, 2, 5, 16, 10)
      ON CONFLICT (employee_id) DO NOTHING;
    `, [employeeId]);

    // 2. Generate secure single-use invitation record with authoritative role
    const invitation = dataStore.createInvitation({
      employeeId,
      email,
      fullName,
      role: assignedRole,
      createdBy: `${req.user?.fullName || 'HR Admin'} (${req.user?.role || 'Admin'})`
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationUrl = `${clientUrl}/activate?token=${invitation.token}`;

    res.status(201).json({
      success: true,
      message: `Employee ${fullName} created. Secure invitation generated for ${email}.`,
      data: {
        employee: newEmployee,
        invitation: {
          id: invitation.id,
          token: invitation.token,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          status: invitation.status
        },
        activationUrl
      }
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

    // Also update associated user account status
    const user = dataStore.findUserByEmployeeId(employee.employeeId);
    if (user) {
      user.status = newStatus === 'Active' ? 'ACTIVE' : 'DEACTIVATED';
    }

    res.status(200).json({
      success: true,
      message: `Employee ${employee.fullName} marked as ${newStatus}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 3. INVITATIONS MANAGEMENT (HR / Admin)
export const getInvitations = async (req, res, next) => {
  try {
    const invitations = dataStore.getAllInvitations();
    res.status(200).json({
      success: true,
      data: {
        invitations,
        summary: {
          total: invitations.length,
          pending: invitations.filter(i => i.status === 'INVITED').length,
          accepted: invitations.filter(i => i.status === 'ACCEPTED').length,
          expired: invitations.filter(i => i.status === 'EXPIRED').length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resendInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = dataStore.resendInvitation(id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.'
      });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationUrl = `${clientUrl}/activate?token=${updated.token}`;

    res.status(200).json({
      success: true,
      message: `Invitation refreshed. New activation link generated for ${updated.email}.`,
      data: {
        invitation: updated,
        activationUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const revokeInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = dataStore.revokeInvitation(id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation revoked successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// 4. ATTENDANCE MANAGEMENT
export const getAdminAttendance = async (req, res, next) => {
  try {
    const { employeeId, status, date } = req.query;
    const records = dataStore.getAllAttendance({ employeeId, status, date });
    const allEmployees = dataStore.getAllEmployees();

    const enrichedRecords = records.map(r => {
      const emp = allEmployees.find(e => e.employeeId === r.employeeId);
      return {
        ...r,
        employeeName: emp ? emp.fullName : r.employeeId,
        department: emp?.jobDetails?.department || 'General',
        avatar: emp?.avatar
      };
    });

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

// 5. LEAVE MANAGEMENT
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
    const adminName = req.user.fullName || 'Ananya Krishnan';

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
    const adminName = req.user.fullName || 'Ananya Krishnan';

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

// 6. PAYROLL MANAGEMENT & BULK RUN
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

// 7. FINANCE DASHBOARD
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

// 8. TIME MANAGEMENT DASHBOARD
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

// 9. ADMIN REVIEWS
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
      reviewer: req.user.fullName || 'Ananya Krishnan',
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
