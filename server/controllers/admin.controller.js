import { dataStore } from '../repositories/dataStore.js';
import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { sendInvitationEmail, sendReminderEmail } from '../utils/email.js';

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
    let { fullName, employeeId, email, role, department, title, designation, workType, basicSalary, phone, address } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Work email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let cleanEmpId = (employeeId && employeeId.trim().toUpperCase()) || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check DB and dataStore for existing employee ID
    const existingEmp = dataStore.getEmployeeProfile(cleanEmpId);
    const dbEmpCheck = await query('SELECT employee_id FROM employees WHERE employee_id = $1 LIMIT 1;', [cleanEmpId]);
    if (existingEmp || dbEmpCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Employee ID ${cleanEmpId} is already in use. Please enter a different ID or use the auto-generate button.`
      });
    }

    // Check DB and dataStore for existing email
    const existingUser = dataStore.findUserByEmail(cleanEmail);
    const dbEmailCheck = await query('SELECT email FROM users WHERE email = $1 UNION SELECT email FROM employees WHERE email = $1 LIMIT 1;', [cleanEmail]);
    if (existingUser || dbEmailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `An account or invitation with email ${cleanEmail} already exists.`
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
      employeeId: cleanEmpId,
      userId: null,
      fullName: fullName.trim(),
      email: cleanEmail,
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
    try {
      await query(`
        INSERT INTO employees (employee_id, full_name, email, phone, address, emergency_contact, avatar, status, department, designation, job_title, work_type, join_date, reporting_manager, location, work_shift)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_DATE, $13, $14, $15)
        ON CONFLICT (employee_id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;
      `, [
        cleanEmpId, fullName.trim(), cleanEmail, newEmployee.phone, newEmployee.address,
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
      `, [cleanEmpId, basic, hra, transport, medical, gross, taxDeduction, pfDeduction, netSalary]);

      await query(`
        INSERT INTO leave_balances (employee_id, annual, monthly, daily, hourly, sick)
        VALUES ($1, 18, 2, 5, 16, 10)
        ON CONFLICT (employee_id) DO NOTHING;
      `, [cleanEmpId]);
    } catch (dbErr) {
      if (dbErr.code === '23505') {
        if (dbErr.message.includes('employees_email_key') || dbErr.detail?.includes('email')) {
          return res.status(409).json({
            success: false,
            message: `An account with email ${cleanEmail} already exists.`
          });
        }
        if (dbErr.message.includes('employees_employee_id_key') || dbErr.detail?.includes('employee_id')) {
          return res.status(409).json({
            success: false,
            message: `Employee ID ${cleanEmpId} is already in use. Please enter a different ID.`
          });
        }
      }
      throw dbErr;
    }

    // 2. Generate secure single-use invitation record with authoritative role
    const invitation = dataStore.createInvitation({
      employeeId: cleanEmpId,
      email: cleanEmail,
      fullName: fullName.trim(),
      role: assignedRole,
      createdBy: `${req.user?.fullName || 'HR Admin'} (${req.user?.role || 'Admin'})`
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationUrl = `${clientUrl}/activate?token=${invitation.token}`;

    // Send real invitation email via Nodemailer
    const emailResult = await sendInvitationEmail({
      to: cleanEmail,
      fullName: fullName.trim(),
      role: assignedRole,
      employeeId: cleanEmpId,
      activationUrl,
      createdBy: `${req.user?.fullName || 'HR Admin'}`
    });

    res.status(201).json({
      success: true,
      message: emailResult.success
        ? `Employee ${fullName.trim()} created. Invitation email sent to ${cleanEmail}.`
        : `Employee ${fullName.trim()} created. Secure invitation generated for ${cleanEmail}.`,
      data: {
        employee: newEmployee,
        invitation: {
          id: invitation.id,
          token: invitation.token,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          status: invitation.status
        },
        activationUrl,
        emailStatus: emailResult.success ? 'SENT' : 'FAILED',
        emailPreviewUrl: emailResult.previewUrl || null
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

    // Also update associated user account status in-memory
    const user = dataStore.findUserByEmployeeId(employee.employeeId);
    const dbUserStatus = newStatus === 'Active' ? 'ACTIVE' : 'DEACTIVATED';
    if (user) {
      user.status = dbUserStatus;
    }

    // Update Live Database to enforce login blocking
    await query('UPDATE employees SET status = $1 WHERE employee_id = $2;', [newStatus, employee.employeeId]);
    await query('UPDATE users SET status = $1 WHERE employee_id = $2;', [dbUserStatus, employee.employeeId]);

    res.status(200).json({
      success: true,
      message: `Employee ${employee.fullName} marked as ${newStatus}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = dataStore.getEmployeeProfile(id) || dataStore.employees.find(e => e.id === id || e.employeeId === id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    const targetEmpId = employee.employeeId;
    const targetEmail = employee.email;

    // Delete in database (Cascade handles salary_structures, leaves, attendance, payroll, reviews, etc.)
    await query('DELETE FROM invitations WHERE employee_id = $1 OR email = $2;', [targetEmpId, targetEmail]);
    await query('DELETE FROM users WHERE employee_id = $1 OR email = $2;', [targetEmpId, targetEmail]);
    await query('DELETE FROM employees WHERE employee_id = $1;', [targetEmpId]);

    // Delete in dataStore memory
    dataStore.deleteEmployee(targetEmpId, targetEmail);

    res.status(200).json({
      success: true,
      message: `Employee ${employee.fullName} (${targetEmpId}) has been permanently deleted.`
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

    // Send reminder email
    const emailResult = await sendReminderEmail({
      to: updated.email,
      fullName: updated.fullName,
      activationUrl
    });

    res.status(200).json({
      success: true,
      message: emailResult.success
        ? `Invitation refreshed. Reminder email sent to ${updated.email}.`
        : `Invitation refreshed. New link generated but email delivery failed.`,
      data: {
        invitation: updated,
        activationUrl,
        emailStatus: emailResult.success ? 'SENT' : 'FAILED',
        emailPreviewUrl: emailResult.previewUrl || null
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
    const allEmployees = dataStore.getAllEmployees();

    // MISSING 7 FIX: Filter to today's records only
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = allAttendance.filter(a => a.date === todayStr);

    const liveCheckInFeed = todayAttendance.map(a => {
      const emp = allEmployees.find(e => e.employeeId === a.employeeId);
      return {
        ...a,
        employeeName: emp ? emp.fullName : a.employeeId,
        avatar: emp?.avatar,
        department: emp?.jobDetails?.department || 'General'
      };
    }).sort((a, b) => (b.checkIn || '').localeCompare(a.checkIn || ''));

    const activeEmployees = allEmployees.filter(e => e.status === 'Active').length;
    const kpis = {
      presentToday: todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length,
      absentToday: Math.max(0, activeEmployees - todayAttendance.length),
      lateToday: todayAttendance.filter(a => a.status === 'Late').length,
      checkedOutCount: todayAttendance.filter(a => a.checkOut).length
    };

    res.status(200).json({
      success: true,
      data: {
        ...timeData,
        todayKpis: kpis,
        liveCheckInFeed
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

// MISSING 8: Update an existing review
export const updateAdminReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = dataStore.reviews.find(r => r.id === id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    Object.assign(review, req.body);
    if (req.body.score !== undefined) {
      review.rating = req.body.score >= 95 ? 'Exceptional' : req.body.score >= 85 ? 'Exceeds Expectations' : 'Meets Expectations';
    }

    query(`UPDATE reviews SET score=$1, feedback=$2, strengths=$3, improvements=$4, status=$5 WHERE id::text=$6;`,
      [review.score, review.feedback, review.strengths, review.improvements, review.status, id]).catch(console.error);

    res.status(200).json({ success: true, message: 'Review updated.', data: review });
  } catch (error) { next(error); }
};

// MISSING 8: Delete a review
export const deleteAdminReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idx = dataStore.reviews.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Review not found.' });
    dataStore.reviews.splice(idx, 1);
    query(`DELETE FROM reviews WHERE id::text=$1;`, [id]).catch(console.error);
    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) { next(error); }
};

// MISSING 2: Update employee salary structure
export const updateEmployeeSalary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = dataStore.getEmployeeProfile(id) || dataStore.employees.find(e => e.id === id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    const { basic, hra, transport, medical } = req.body;
    const gross = Number(basic) + Number(hra) + Number(transport) + Number(medical);
    const taxDeduction = Math.round(gross * 0.20);
    const pfDeduction = Math.round(Number(basic) * 0.12);
    const netSalary = gross - taxDeduction - pfDeduction;

    const salaryUpdate = {
      basic: Number(basic), hra: Number(hra), transport: Number(transport),
      medical: Number(medical), gross, taxDeduction, pfDeduction, netSalary
    };

    const emp = dataStore.getEmployeeProfile(employee.employeeId || id);
    if (emp) emp.salaryStructure = { ...emp.salaryStructure, ...salaryUpdate };

    await query(`UPDATE salary_structures SET basic=$1, hra=$2, transport=$3, medical=$4, gross=$5, tax_deduction=$6, pf_deduction=$7, net_salary=$8, updated_at=NOW() WHERE employee_id=$9;`,
      [basic, hra, transport, medical, gross, taxDeduction, pfDeduction, netSalary, employee.employeeId || id]);

    res.status(200).json({ success: true, message: 'Salary structure updated.', data: salaryUpdate });
  } catch (error) { next(error); }
};

// MISSING 6: Update employee leave balances
export const updateLeaveBalance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { annual, sick, monthly, daily, hourly } = req.body;
    const employee = dataStore.getEmployeeProfile(id) || dataStore.employees.find(e => e.id === id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    const emp = dataStore.getEmployeeProfile(employee.employeeId || id);
    if (emp && emp.leaveBalances) {
      if (annual !== undefined) emp.leaveBalances.annual = Number(annual);
      if (sick !== undefined) emp.leaveBalances.sick = Number(sick);
      if (monthly !== undefined) emp.leaveBalances.monthly = Number(monthly);
      if (daily !== undefined) emp.leaveBalances.daily = Number(daily);
      if (hourly !== undefined) emp.leaveBalances.hourly = Number(hourly);
    }

    await query(`UPDATE leave_balances SET annual=COALESCE($1,annual), sick=COALESCE($2,sick), monthly=COALESCE($3,monthly), daily=COALESCE($4,daily), hourly=COALESCE($5,hourly), updated_at=NOW() WHERE employee_id=$6;`,
      [annual ?? null, sick ?? null, monthly ?? null, daily ?? null, hourly ?? null, employee.employeeId || id]);

    res.status(200).json({ success: true, message: 'Leave balances updated.', data: emp?.leaveBalances });
  } catch (error) { next(error); }
};
