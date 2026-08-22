import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../config/db.js';

// Pre-hashed passwords using bcrypt (12 rounds)
const DEFAULT_ADMIN_PASS_HASH = bcrypt.hashSync('Admin@1234', 12);
const DEFAULT_EMP_PASS_HASH = bcrypt.hashSync('Employee@1234', 12);

class DataStoreService {
  constructor() {
    this.initLocalFallback();
  }

  initLocalFallback() {
    // Initial local cache structures
    this.users = [];
    this.invitations = [];
    this.employees = [];
    this.attendance = [];
    this.leaves = [];
    this.payroll = [];
    this.reviews = [];
    this.notifications = [];
    this.finance = {
      summary: {
        totalRevenue: 23700000,
        revenueChange: 14.8,
        totalExpenses: 14030000,
        expenseChange: -3.2,
        netProfit: 9670000,
        profitChange: 22.4,
        pendingInvoices: 3525000,
        invoicesCount: 8,
        payrollSpending: 6070000,
        payrollChange: 5.1,
        cashRunwayMonths: 18.5
      },
      cashFlow: [
        { month: 'Jan', revenue: 17500000, expenses: 12090000, net: 5410000 },
        { month: 'Feb', revenue: 18750000, expenses: 12340000, net: 6410000 },
        { month: 'Mar', revenue: 20000000, expenses: 12670000, net: 7330000 },
        { month: 'Apr', revenue: 21250000, expenses: 13170000, net: 8080000 },
        { month: 'May', revenue: 22500000, expenses: 13500000, net: 9000000 },
        { month: 'Jun', revenue: 23170000, expenses: 13750000, net: 9420000 },
        { month: 'Jul', revenue: 23700000, expenses: 14030000, net: 9670000 }
      ],
      expenseCategories: [
        { name: 'Engineering & Tech', value: 4830000, color: '#00C896' },
        { name: 'Payroll & Benefits', value: 6070000, color: '#38BDF8' },
        { name: 'Marketing & Growth', value: 1792000, color: '#F59E0B' },
        { name: 'Office & Facilities', value:  767000, color: '#A855F7' },
        { name: 'Legal & Compliance',  value:  567000, color: '#EC4899' }
      ],
      departmentSpending: [
        { department: 'Engineering',     budget: 7500000, actual: 6866000, utilization: 91.5 },
        { department: 'Design & UX',     budget: 2920000, actual: 2600000, utilization: 89.1 },
        { department: 'Product',         budget: 3330000, actual: 3067000, utilization: 92.0 },
        { department: 'Human Resources', budget: 2500000, actual: 2209000, utilization: 88.3 },
        { department: 'Infrastructure',  budget: 2080000, actual: 1925000, utilization: 92.4 }
      ],
      recentTransactions: [
        { id: 'TX-8801', title: 'AWS Cloud Hosting & Kubernetes',      category: 'Infrastructure', amount: 704000,   date: '2026-08-20', status: 'Completed', type: 'Expense' },
        { id: 'TX-8802', title: 'Enterprise SaaS Subscription (TCS)',  category: 'Sales',          amount: 2850000,  date: '2026-08-19', status: 'Completed', type: 'Income'  },
        { id: 'TX-8803', title: 'Figma Organization Annual License',   category: 'Software',       amount: 350000,   date: '2026-08-18', status: 'Completed', type: 'Expense' },
        { id: 'TX-8804', title: 'NEFT Payroll Disbursement Batch',     category: 'Payroll',        amount: 6070000,  date: '2026-08-15', status: 'Completed', type: 'Expense' }
      ]
    };
    this.timeManagement = {
      summary: {
        totalTrackedHours: 1420,
        averageWorkHours: 8.2,
        overtimeHours: 64.5,
        productivityScore: 92.8,
        onTimeArrivalRate: 94.2,
        activeClockedInNow: 5
      },
      weeklyHeatmap: [
        { day: 'Mon', '08:00': 12, '10:00': 35, '12:00': 28, '14:00': 38, '16:00': 34, '18:00': 10 },
        { day: 'Tue', '08:00': 15, '10:00': 38, '12:00': 30, '14:00': 40, '16:00': 37, '18:00': 14 },
        { day: 'Wed', '08:00': 14, '10:00': 39, '12:00': 29, '14:00': 41, '16:00': 38, '18:00': 15 },
        { day: 'Thu', '08:00': 16, '10:00': 37, '12:00': 27, '14:00': 39, '16:00': 36, '18:00': 12 },
        { day: 'Fri', '08:00': 11, '10:00': 32, '12:00': 25, '14:00': 34, '16:00': 28, '18:00': 6 }
      ],
      shiftSchedules: [
        { shiftName: 'General Shift (IST)',   timing: '09:00 AM - 05:30 PM', assignedEmployees: 4, compliance: 96 },
        { shiftName: 'Flexible Shift (IST)',  timing: '08:30 AM - 05:00 PM', assignedEmployees: 2, compliance: 94 },
        { shiftName: 'Executive Shift (IST)', timing: '09:00 AM - 06:00 PM', assignedEmployees: 1, compliance: 98 }
      ]
    };
  }

  /**
   * Sync and populate in-memory state directly from Neon DB on server launch and mutations
   */
  async syncFromPostgres() {
    try {
      // 1. Fetch Users
      const uRes = await query('SELECT * FROM users ORDER BY created_at ASC;');
      this.users = uRes.rows.map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        email: r.email,
        fullName: r.full_name,
        passwordHash: r.password_hash,
        role: r.role,
        status: r.status,
        isVerified: r.is_verified,
        avatar: r.avatar,
        createdAt: r.created_at,
        lastLoginAt: r.last_login_at
      }));

      // 2. Fetch Invitations
      const iRes = await query('SELECT * FROM invitations ORDER BY created_at DESC;');
      this.invitations = iRes.rows.map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        email: r.email,
        fullName: r.full_name,
        role: r.role,
        token: r.token,
        expiresAt: r.expires_at,
        status: r.status,
        createdBy: r.created_by,
        createdAt: r.created_at,
        usedAt: r.used_at
      }));

      // 3. Fetch Employees with Salary & Leave Balances
      const eRes = await query('SELECT * FROM employees ORDER BY created_at ASC;');
      const sRes = await query('SELECT * FROM salary_structures;');
      const lRes = await query('SELECT * FROM leave_balances;');
      const dRes = await query('SELECT * FROM employee_documents;');

      const salariesMap = new Map(sRes.rows.map(s => [s.employee_id, s]));
      const balancesMap = new Map(lRes.rows.map(l => [l.employee_id, l]));

      this.employees = eRes.rows.map(e => {
        const sal = salariesMap.get(e.employee_id);
        const bal = balancesMap.get(e.employee_id);
        const docs = dRes.rows.filter(d => d.employee_id === e.employee_id);

        return {
          id: e.id,
          employeeId: e.employee_id,
          userId: e.user_id,
          fullName: e.full_name,
          email: e.email,
          phone: e.phone,
          address: e.address,
          emergencyContact: e.emergency_contact,
          avatar: e.avatar,
          status: e.status,
          jobDetails: {
            title: e.job_title,
            department: e.department,
            designation: e.designation,
            workType: e.work_type,
            joinDate: e.join_date ? e.join_date.toISOString().split('T')[0] : '2023-01-01',
            reportingManager: e.reporting_manager,
            location: e.location,
            workShift: e.work_shift
          },
          salaryStructure: sal ? {
            currency: sal.currency,
            basic: Number(sal.basic),
            hra: Number(sal.hra),
            transport: Number(sal.transport),
            medical: Number(sal.medical),
            gross: Number(sal.gross),
            taxDeduction: Number(sal.tax_deduction),
            pfDeduction: Number(sal.pf_deduction),
            netSalary: Number(sal.net_salary)
          } : {
            currency: 'INR',
            basic: 95000,
            hra: 38000,
            transport: 8000,
            medical: 5000,
            gross: 146000,
            taxDeduction: 29200,
            pfDeduction: 11400,
            netSalary: 105400
          },
          leaveBalances: bal ? {
            annual: bal.annual,
            monthly: bal.monthly,
            daily: bal.daily,
            hourly: bal.hourly,
            sick: bal.sick
          } : {
            annual: 18,
            monthly: 2,
            daily: 5,
            hourly: 16,
            sick: 10
          },
          documents: docs.map(d => ({
            name: d.name,
            size: d.file_size,
            type: d.document_type,
            fileUrl: d.file_url,
            uploadedAt: d.uploaded_at
          }))
        };
      });

      // 4. Fetch Attendance
      const aRes = await query('SELECT * FROM attendance ORDER BY date DESC;');
      this.attendance = aRes.rows.map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
        checkIn: r.check_in,
        checkOut: r.check_out,
        workHours: r.work_hours,
        status: r.status,
        device: r.device,
        location: r.location
      }));

      // 5. Fetch Leaves
      const lvRes = await query('SELECT * FROM leaves ORDER BY applied_at DESC;');
      this.leaves = lvRes.rows.map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        department: r.department,
        leaveType: r.leave_type,
        fromDate: r.from_date instanceof Date ? r.from_date.toISOString().split('T')[0] : r.from_date,
        toDate: r.to_date instanceof Date ? r.to_date.toISOString().split('T')[0] : r.to_date,
        duration: r.duration,
        remarks: r.remarks,
        status: r.status,
        adminComment: r.admin_comment,
        appliedAt: r.applied_at,
        reviewedAt: r.reviewed_at,
        reviewedBy: r.reviewed_by
      }));

      // 6. Fetch Payroll
      const pRes = await query('SELECT * FROM payroll ORDER BY month_code DESC;');
      this.payroll = pRes.rows.map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        department: r.department,
        designation: r.designation,
        month: r.month,
        monthCode: r.month_code,
        basic: Number(r.basic),
        hra: Number(r.hra),
        transport: Number(r.transport),
        medical: Number(r.medical),
        gross: Number(r.gross),
        taxDeduction: Number(r.tax_deduction),
        pfDeduction: Number(r.pf_deduction),
        netSalary: Number(r.net_salary),
        status: r.status,
        paymentMethod: r.payment_method,
        paymentDate: r.payment_date instanceof Date ? r.payment_date.toISOString().split('T')[0] : r.payment_date,
        slipUrl: r.slip_url
      }));

      // 7. Fetch Reviews
      const revRes = await query('SELECT * FROM reviews ORDER BY review_date DESC;');
      this.reviews = revRes.rows.map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        department: r.department,
        period: r.period,
        reviewer: r.reviewer,
        reviewerRole: r.reviewer_role,
        score: r.score,
        rating: r.rating,
        strengths: r.strengths,
        improvements: r.improvements,
        feedback: r.feedback,
        reviewDate: r.review_date instanceof Date ? r.review_date.toISOString().split('T')[0] : r.review_date,
        status: r.status
      }));

      // 8. Fetch Notifications
      const nRes = await query('SELECT * FROM notifications ORDER BY created_at DESC;');
      this.notifications = nRes.rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        title: r.title,
        message: r.message,
        type: r.type,
        isRead: r.is_read,
        createdAt: r.created_at
      }));

      // 9. Fetch Finance Data
      const finSumRes = await query('SELECT * FROM finance_summary LIMIT 1;');
      if (finSumRes.rows.length > 0) {
        const fs = finSumRes.rows[0];
        this.finance.summary = {
          totalRevenue: Number(fs.total_revenue),
          revenueChange: Number(fs.revenue_change),
          totalExpenses: Number(fs.total_expenses),
          expenseChange: Number(fs.expense_change),
          netProfit: Number(fs.net_profit),
          profitChange: Number(fs.profit_change),
          pendingInvoices: Number(fs.pending_invoices),
          invoicesCount: fs.invoices_count,
          payrollSpending: Number(fs.payroll_spending),
          payrollChange: Number(fs.payroll_change),
          cashRunwayMonths: Number(fs.cash_runway_months)
        };
      }

      const cfRes = await query('SELECT * FROM cash_flow ORDER BY sort_order ASC;');
      if (cfRes.rows.length > 0) {
        this.finance.cashFlow = cfRes.rows.map(r => ({
          month: r.month,
          revenue: Number(r.revenue),
          expenses: Number(r.expenses),
          net: Number(r.net)
        }));
      }

      const ecRes = await query('SELECT * FROM expense_categories;');
      if (ecRes.rows.length > 0) {
        this.finance.expenseCategories = ecRes.rows.map(r => ({
          name: r.name,
          value: Number(r.value),
          color: r.color
        }));
      }

      const dsRes = await query('SELECT * FROM department_spending;');
      if (dsRes.rows.length > 0) {
        this.finance.departmentSpending = dsRes.rows.map(r => ({
          department: r.department,
          budget: Number(r.budget),
          actual: Number(r.actual),
          utilization: Number(r.utilization)
        }));
      }

      const txRes = await query('SELECT * FROM ledger_transactions ORDER BY date DESC LIMIT 10;');
      if (txRes.rows.length > 0) {
        this.finance.recentTransactions = txRes.rows.map(r => ({
          id: r.transaction_code,
          title: r.title,
          category: r.category,
          amount: Number(r.amount),
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
          status: r.status,
          type: r.type
        }));
      }

      // 10. Fetch Time Management Data
      const tmRes = await query('SELECT * FROM time_management_summary LIMIT 1;');
      if (tmRes.rows.length > 0) {
        const tm = tmRes.rows[0];
        this.timeManagement.summary = {
          totalTrackedHours: Number(tm.total_tracked_hours),
          averageWorkHours: Number(tm.average_work_hours),
          overtimeHours: Number(tm.overtime_hours),
          productivityScore: Number(tm.productivity_score),
          onTimeArrivalRate: Number(tm.on_time_arrival_rate),
          activeClockedInNow: tm.active_clocked_in_now
        };
      }

      const hmRes = await query('SELECT * FROM weekly_heatmap ORDER BY sort_order ASC;');
      if (hmRes.rows.length > 0) {
        this.timeManagement.weeklyHeatmap = hmRes.rows.map(r => ({
          day: r.day,
          '08:00': r.hour_08,
          '10:00': r.hour_10,
          '12:00': r.hour_12,
          '14:00': r.hour_14,
          '16:00': r.hour_16,
          '18:00': r.hour_18
        }));
      }

      const schRes = await query('SELECT * FROM shift_schedules;');
      if (schRes.rows.length > 0) {
        this.timeManagement.shiftSchedules = schRes.rows.map(r => ({
          shiftName: r.shift_name,
          timing: r.timing,
          assignedEmployees: r.assigned_employees,
          compliance: Number(r.compliance)
        }));
      }

      console.log(`📡 [Neon DB Sync] Synchronized ${this.users.length} users, ${this.employees.length} employees, ${this.invitations.length} invitations, ${this.attendance.length} attendance records.`);
    } catch (err) {
      console.error('[Neon DB Sync Error]:', err.message);
    }
  }

  // ==========================================
  // INVITATION OPERATIONS (Source of Truth)
  // ==========================================
  createInvitation({ employeeId, email, fullName, role = 'employee', createdBy = 'HR Admin', expiresInDays = 7 }) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    const sanitizedRole = role === 'admin' ? 'admin' : 'employee';

    const invitation = {
      id: `inv-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      employeeId,
      email: email.toLowerCase(),
      fullName,
      role: sanitizedRole,
      token,
      expiresAt,
      status: 'INVITED',
      createdBy,
      createdAt: new Date().toISOString(),
      usedAt: null
    };

    this.invitations.unshift(invitation);

    // Persist to Neon DB asynchronously
    query(`
      INSERT INTO invitations (employee_id, email, full_name, role, token, expires_at, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (token) DO UPDATE SET status = EXCLUDED.status;
    `, [employeeId, email.toLowerCase(), fullName, sanitizedRole, token, expiresAt, 'INVITED', createdBy]).catch(console.error);

    return invitation;
  }

  findInvitationByToken(token) {
    if (!token) return null;
    return this.invitations.find(i => i.token === token);
  }

  findInvitationByEmail(email) {
    if (!email) return null;
    return this.invitations.find(i => i.email.toLowerCase() === email.toLowerCase());
  }

  findInvitationByEmployeeId(empId) {
    if (!empId) return null;
    return this.invitations.find(i => i.employeeId.toUpperCase() === empId.toUpperCase());
  }

  getAllInvitations() {
    return this.invitations;
  }

  acceptInvitation(token) {
    const invitation = this.findInvitationByToken(token);
    if (!invitation) return null;

    invitation.status = 'ACCEPTED';
    invitation.usedAt = new Date().toISOString();

    query(`
      UPDATE invitations SET status = 'ACCEPTED', used_at = NOW() WHERE token = $1;
    `, [token]).catch(console.error);

    return invitation;
  }

  revokeInvitation(invitationId) {
    const index = this.invitations.findIndex(i => i.id === invitationId || i.token === invitationId);
    if (index === -1) return false;

    this.invitations[index].status = 'REVOKED';

    query(`
      UPDATE invitations SET status = 'REVOKED' WHERE id::text = $1 OR token = $1;
    `, [invitationId]).catch(console.error);

    return true;
  }

  resendInvitation(invitationId) {
    const inv = this.invitations.find(i => i.id === invitationId);
    if (!inv) return null;

    inv.token = crypto.randomBytes(32).toString('hex');
    inv.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    inv.status = 'INVITED';
    inv.createdAt = new Date().toISOString();

    query(`
      UPDATE invitations SET token = $1, expires_at = $2, status = 'INVITED' WHERE id::text = $3;
    `, [inv.token, inv.expiresAt, invitationId]).catch(console.error);

    return inv;
  }

  // ==========================================
  // USER / ACCOUNT OPERATIONS
  // ==========================================
  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  findUserByEmployeeId(empId) {
    if (!empId) return null;
    return this.users.find(u => u.employeeId.toUpperCase() === empId.toUpperCase());
  }

  /**
   * Activate user from invitation with STRICT backend role enforcement
   */
  activateUserFromInvitation({ invitation, passwordHash, fullName }) {
    const finalFullName = (fullName && fullName.trim()) || invitation.fullName;
    let existingUser = this.findUserByEmail(invitation.email);

    if (existingUser) {
      existingUser.fullName = finalFullName;
      existingUser.passwordHash = passwordHash;
      existingUser.status = 'ACTIVE';
      existingUser.isVerified = true;
      existingUser.role = invitation.role;
      existingUser.lastLoginAt = new Date().toISOString();

      query(`
        UPDATE users SET full_name = $1, password_hash = $2, status = 'ACTIVE', is_verified = TRUE, role = $3, last_login_at = NOW()
        WHERE email = $4;
      `, [finalFullName, passwordHash, invitation.role, invitation.email]).catch(console.error);
    } else {
      existingUser = {
        id: `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        employeeId: invitation.employeeId,
        email: invitation.email,
        fullName: finalFullName,
        passwordHash,
        role: invitation.role,
        status: 'ACTIVE',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      this.users.push(existingUser);

      query(`
        INSERT INTO users (employee_id, email, full_name, password_hash, role, status, is_verified, avatar)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE', TRUE, $6)
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, status = 'ACTIVE';
      `, [invitation.employeeId, invitation.email, finalFullName, passwordHash, invitation.role, existingUser.avatar]).catch(console.error);
    }

    this.acceptInvitation(invitation.token);

    const empProfile = this.getEmployeeProfile(invitation.employeeId);
    if (empProfile) {
      empProfile.fullName = finalFullName;
      empProfile.status = 'Active';
      empProfile.userId = existingUser.id;

      query(`
        UPDATE employees SET full_name = $1, status = 'Active' WHERE employee_id = $2;
      `, [finalFullName, invitation.employeeId]).catch(console.error);
    }

    return existingUser;
  }

  getEmployeeProfile(employeeId) {
    if (!employeeId) return null;
    return this.employees.find(e => e.employeeId.toUpperCase() === employeeId.toUpperCase());
  }

  getEmployeeProfileByUserId(userId) {
    return this.employees.find(e => e.userId === userId);
  }

  updateEmployeeProfile(employeeId, updates) {
    const empIndex = this.employees.findIndex(e => e.employeeId.toUpperCase() === employeeId.toUpperCase());
    if (empIndex === -1) return null;

    const current = this.employees[empIndex];
    const updated = {
      ...current,
      ...updates,
      jobDetails: updates.jobDetails ? { ...current.jobDetails, ...updates.jobDetails } : current.jobDetails,
      salaryStructure: updates.salaryStructure ? { ...current.salaryStructure, ...updates.salaryStructure } : current.salaryStructure
    };

    const user = this.users.find(u => u.employeeId === employeeId);
    if (user) {
      if (updates.fullName) user.fullName = updates.fullName;
      if (updates.avatar) user.avatar = updates.avatar;
    }

    this.employees[empIndex] = updated;

    // Persist to Neon DB
    query(`
      UPDATE employees
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          address = COALESCE($3, address),
          emergency_contact = COALESCE($4, emergency_contact),
          avatar = COALESCE($5, avatar),
          status = COALESCE($6, status),
          updated_at = NOW()
      WHERE employee_id = $7;
    `, [
      updates.fullName || null,
      updates.phone || null,
      updates.address || null,
      updates.emergencyContact || null,
      updates.avatar || null,
      updates.status || null,
      employeeId
    ]).catch(console.error);

    return updated;
  }

  deleteEmployee(employeeId, email) {
    const targetEmpId = employeeId ? employeeId.toUpperCase() : '';
    const targetEmail = email ? email.toLowerCase() : '';

    // Remove from employees array
    this.employees = this.employees.filter(e => 
      e.employeeId.toUpperCase() !== targetEmpId && 
      (!targetEmail || e.email.toLowerCase() !== targetEmail)
    );

    // Remove associated user
    this.users = this.users.filter(u => 
      (u.employeeId && u.employeeId.toUpperCase() === targetEmpId ? false : true) &&
      (!targetEmail || u.email.toLowerCase() !== targetEmail)
    );

    // Remove associated invitations
    this.invitations = this.invitations.filter(i => 
      (i.employeeId && i.employeeId.toUpperCase() === targetEmpId ? false : true) &&
      (!targetEmail || i.email.toLowerCase() !== targetEmail)
    );

    // Remove associated attendance, leaves, payroll, reviews
    this.attendance = this.attendance.filter(a => a.employeeId && a.employeeId.toUpperCase() !== targetEmpId);
    this.leaves = this.leaves.filter(l => l.employeeId && l.employeeId.toUpperCase() !== targetEmpId);
    this.payroll = this.payroll.filter(p => p.employeeId && p.employeeId.toUpperCase() !== targetEmpId);
    this.reviews = this.reviews.filter(r => r.employeeId && r.employeeId.toUpperCase() !== targetEmpId);

    return true;
  }

  getAllEmployees(queryFilter = {}) {
    let list = [...this.employees];

    if (queryFilter.search) {
      const s = queryFilter.search.toLowerCase();
      list = list.filter(e =>
        e.fullName.toLowerCase().includes(s) ||
        e.email.toLowerCase().includes(s) ||
        e.employeeId.toLowerCase().includes(s) ||
        (e.jobDetails && e.jobDetails.department.toLowerCase().includes(s)) ||
        (e.jobDetails && e.jobDetails.title.toLowerCase().includes(s))
      );
    }

    if (queryFilter.department && queryFilter.department !== 'All') {
      list = list.filter(e => e.jobDetails && e.jobDetails.department === queryFilter.department);
    }

    if (queryFilter.status && queryFilter.status !== 'All') {
      list = list.filter(e => e.status === queryFilter.status);
    }

    return list;
  }

  getAttendanceForEmployee(employeeId) {
    return this.attendance
      .filter(a => a.employeeId === employeeId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getTodayAttendance(employeeId) {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);
  }

  checkIn(employeeId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let record = this.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);

    if (record && record.checkIn) {
      return { record, alreadyCheckedIn: true };
    }

    if (!record) {
      record = {
        id: `att-${employeeId}-${todayStr}`,
        employeeId,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null,
        workHours: 'In Progress',
        status: 'Present',
        device: 'Web App Portal',
        location: 'Current Workstation'
      };
      this.attendance.unshift(record);
    } else {
      record.checkIn = timeStr;
      record.status = 'Present';
      record.workHours = 'In Progress';
    }

    query(`
      INSERT INTO attendance (employee_id, date, check_in, check_out, work_hours, status)
      VALUES ($1, $2, $3, NULL, 'In Progress', 'Present')
      ON CONFLICT (employee_id, date) DO UPDATE SET check_in = EXCLUDED.check_in, status = 'Present';
    `, [employeeId, todayStr, timeStr]).catch(console.error);

    return { record, alreadyCheckedIn: false };
  }

  checkOut(employeeId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let record = this.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);

    if (!record || !record.checkIn) {
      return { record: null, notCheckedIn: true };
    }

    record.checkOut = timeStr;
    record.workHours = '8.5 hrs';

    query(`
      UPDATE attendance
      SET check_out = $1, work_hours = '8.5 hrs'
      WHERE employee_id = $2 AND date = $3;
    `, [timeStr, employeeId, todayStr]).catch(console.error);

    return { record, notCheckedIn: false };
  }

  getAllAttendance(queryFilter = {}) {
    let list = [...this.attendance];

    if (queryFilter.employeeId && queryFilter.employeeId !== 'All') {
      list = list.filter(a => a.employeeId === queryFilter.employeeId);
    }
    if (queryFilter.status && queryFilter.status !== 'All') {
      list = list.filter(a => a.status === queryFilter.status);
    }
    if (queryFilter.date) {
      list = list.filter(a => a.date === queryFilter.date);
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getLeavesForEmployee(employeeId) {
    return this.leaves
      .filter(l => l.employeeId === employeeId)
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }

  getAllLeaves(queryFilter = {}) {
    let list = [...this.leaves];

    if (queryFilter.status && queryFilter.status !== 'All') {
      list = list.filter(l => l.status.toLowerCase() === queryFilter.status.toLowerCase());
    }
    if (queryFilter.employeeId) {
      list = list.filter(l => l.employeeId === queryFilter.employeeId);
    }

    return list.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }

  applyLeave(employeeId, leaveData) {
    const emp = this.getEmployeeProfile(employeeId);
    const newLeave = {
      id: `lv-${Date.now()}`,
      employeeId,
      employeeName: emp ? emp.fullName : 'Employee',
      department: emp && emp.jobDetails ? emp.jobDetails.department : 'General',
      leaveType: leaveData.leaveType,
      fromDate: leaveData.fromDate,
      toDate: leaveData.toDate,
      duration: leaveData.duration || 1,
      remarks: leaveData.remarks,
      status: 'Pending',
      adminComment: null,
      appliedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };

    this.leaves.unshift(newLeave);

    query(`
      INSERT INTO leaves (employee_id, employee_name, department, leave_type, from_date, to_date, duration, remarks, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending');
    `, [employeeId, newLeave.employeeName, newLeave.department, newLeave.leaveType, newLeave.fromDate, newLeave.toDate, newLeave.duration, newLeave.remarks]).catch(console.error);

    return newLeave;
  }

  cancelLeave(leaveId, employeeId) {
    const index = this.leaves.findIndex(l => l.id === leaveId);
    if (index === -1) return { notFound: true };

    const leave = this.leaves[index];
    if (leave.employeeId !== employeeId) return { unauthorized: true };
    if (leave.status !== 'Pending') return { notPending: true };

    this.leaves.splice(index, 1);

    query(`
      DELETE FROM leaves WHERE id::text = $1 AND employee_id = $2;
    `, [leaveId, employeeId]).catch(console.error);

    return { success: true };
  }

  updateLeaveStatus(leaveId, status, adminComment, adminName = 'Eleanor Vance') {
    const leave = this.leaves.find(l => l.id === leaveId);
    if (!leave) return null;

    leave.status = status;
    leave.adminComment = adminComment || (status === 'Approved' ? 'Approved by HR management.' : 'Rejected.');
    leave.reviewedAt = new Date().toISOString();
    leave.reviewedBy = adminName;

    if (status === 'Approved') {
      const emp = this.getEmployeeProfile(leave.employeeId);
      if (emp && emp.leaveBalances) {
        const typeKey = leave.leaveType.toLowerCase();
        if (emp.leaveBalances[typeKey] !== undefined) {
          emp.leaveBalances[typeKey] = Math.max(0, emp.leaveBalances[typeKey] - leave.duration);
        } else if (emp.leaveBalances.annual !== undefined) {
          emp.leaveBalances.annual = Math.max(0, emp.leaveBalances.annual - leave.duration);
        }
      }
    }

    query(`
      UPDATE leaves
      SET status = $1, admin_comment = $2, reviewed_at = NOW(), reviewed_by = $3
      WHERE id::text = $4 OR id::text = $4;
    `, [status, leave.adminComment, adminName, leaveId]).catch(console.error);

    return leave;
  }

  getPayrollForEmployee(employeeId) {
    return this.payroll
      .filter(p => p.employeeId === employeeId)
      .sort((a, b) => b.monthCode.localeCompare(a.monthCode));
  }

  getAllPayroll(queryFilter = {}) {
    let list = [...this.payroll];

    if (queryFilter.monthCode && queryFilter.monthCode !== 'All') {
      list = list.filter(p => p.monthCode === queryFilter.monthCode);
    }
    if (queryFilter.status && queryFilter.status !== 'All') {
      list = list.filter(p => p.status === queryFilter.status);
    }

    return list.sort((a, b) => b.monthCode.localeCompare(a.monthCode));
  }

  updatePayrollRecord(payrollId, updates) {
    const index = this.payroll.findIndex(p => p.id === payrollId);
    if (index === -1) return null;

    this.payroll[index] = { ...this.payroll[index], ...updates };

    query(`
      UPDATE payroll
      SET basic = COALESCE($1, basic),
          hra = COALESCE($2, hra),
          transport = COALESCE($3, transport),
          medical = COALESCE($4, medical),
          gross = COALESCE($5, gross),
          tax_deduction = COALESCE($6, tax_deduction),
          pf_deduction = COALESCE($7, pf_deduction),
          net_salary = COALESCE($8, net_salary),
          status = COALESCE($9, status)
      WHERE id::text = $10;
    `, [
      updates.basic || null,
      updates.hra || null,
      updates.transport || null,
      updates.medical || null,
      updates.gross || null,
      updates.taxDeduction || null,
      updates.pfDeduction || null,
      updates.netSalary || null,
      updates.status || null,
      payrollId
    ]).catch(console.error);

    return this.payroll[index];
  }

  runBulkPayroll(monthName, monthCode) {
    const generated = [];
    const targetEmployees = this.employees.filter(e => e.status === 'Active');

    targetEmployees.forEach(emp => {
      const existing = this.payroll.find(p => p.employeeId === emp.employeeId && p.monthCode === monthCode);
      if (!existing) {
        const sal = emp.salaryStructure;
        const newRecord = {
          id: `pay-${monthCode}-${emp.employeeId}`,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          department: emp.jobDetails ? emp.jobDetails.department : 'General',
          designation: emp.jobDetails ? emp.jobDetails.designation : 'Staff',
          month: monthName,
          monthCode: monthCode,
          basic: sal.basic,
          hra: sal.hra,
          transport: sal.transport,
          medical: sal.medical,
          gross: sal.gross,
          taxDeduction: sal.taxDeduction,
          pfDeduction: sal.pfDeduction,
          netSalary: sal.netSalary,
          status: 'Processed',
          paymentMethod: 'Direct Deposit (ACH)',
          paymentDate: new Date().toISOString().split('T')[0],
          slipUrl: `/api/payroll/me/slip/${monthCode}`
        };
        this.payroll.unshift(newRecord);
        generated.push(newRecord);

        query(`
          INSERT INTO payroll (employee_id, employee_name, department, designation, month, month_code, basic, hra, transport, medical, gross, tax_deduction, pf_deduction, net_salary, status, payment_method, payment_date, slip_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Processed', 'Direct Deposit (ACH)', CURRENT_DATE, $15)
          ON CONFLICT (employee_id, month_code) DO NOTHING;
        `, [
          emp.employeeId, emp.fullName, newRecord.department, newRecord.designation,
          monthName, monthCode, sal.basic, sal.hra, sal.transport, sal.medical,
          sal.gross, sal.taxDeduction, sal.pfDeduction, sal.netSalary, newRecord.slipUrl
        ]).catch(console.error);
      }
    });

    return { count: generated.length, records: generated };
  }

  getReviewsForEmployee(employeeId) {
    return this.reviews
      .filter(r => r.employeeId === employeeId)
      .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
  }

  getAllReviews(queryFilter = {}) {
    let list = [...this.reviews];

    if (queryFilter.department && queryFilter.department !== 'All') {
      list = list.filter(r => r.department === queryFilter.department);
    }
    if (queryFilter.period && queryFilter.period !== 'All') {
      list = list.filter(r => r.period === queryFilter.period);
    }

    return list.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
  }

  createReview(reviewData) {
    const emp = this.getEmployeeProfile(reviewData.employeeId);
    const newRev = {
      id: `rev-${Date.now()}`,
      employeeId: reviewData.employeeId,
      employeeName: emp ? emp.fullName : 'Employee',
      department: emp && emp.jobDetails ? emp.jobDetails.department : 'Engineering',
      period: reviewData.period,
      reviewer: reviewData.reviewer || 'Eleanor Vance',
      reviewerRole: reviewData.reviewerRole || 'VP of HR',
      score: reviewData.score,
      rating: reviewData.score >= 95 ? 'Exceptional' : reviewData.score >= 85 ? 'Exceeds Expectations' : 'Meets Expectations',
      strengths: reviewData.strengths || 'Strong technical excellence and team synergy.',
      improvements: reviewData.improvements || 'Continue expanding cross-departmental impact.',
      feedback: reviewData.feedback,
      reviewDate: new Date().toISOString().split('T')[0],
      status: 'Published'
    };

    this.reviews.unshift(newRev);

    query(`
      INSERT INTO reviews (employee_id, employee_name, department, period, reviewer, reviewer_role, score, rating, strengths, improvements, feedback, review_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE, 'Published');
    `, [
      newRev.employeeId, newRev.employeeName, newRev.department, newRev.period,
      newRev.reviewer, newRev.reviewerRole, newRev.score, newRev.rating,
      newRev.strengths, newRev.improvements, newRev.feedback
    ]).catch(console.error);

    return newRev;
  }

  getNotificationsForUser(userId) {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  markNotificationAsRead(id, userId) {
    const ntf = this.notifications.find(n => n.id === id && n.userId === userId);
    if (ntf) {
      ntf.isRead = true;
      query(`UPDATE notifications SET is_read = TRUE WHERE id::text = $1;`, [id]).catch(console.error);
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId) {
    this.notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    query(`UPDATE notifications SET is_read = TRUE WHERE user_id::text = $1;`, [userId]).catch(console.error);
    return true;
  }

  getFinanceDashboardData() {
    return this.finance;
  }

  getTimeManagementData() {
    return this.timeManagement;
  }
}

export const dataStore = new DataStoreService();
