import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const initializeDatabase = async () => {
  try {
    console.log('🔄 [Neon DB] Checking and initializing database schema...');

    // 1. Extensions
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 2. Enum Types
    await query(`
      DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('admin', 'employee');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE account_status AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'DEACTIVATED');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE employment_status AS ENUM ('Active', 'Invited', 'On Leave', 'Deactivated');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE leave_type AS ENUM ('Paid', 'Sick', 'Unpaid', 'Casual', 'Maternity/Paternity');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE payroll_status AS ENUM ('Pending', 'Processed', 'Paid');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE invitation_status AS ENUM ('INVITED', 'ACCEPTED', 'EXPIRED', 'REVOKED');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE transaction_type AS ENUM ('Income', 'Expense');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE review_rating AS ENUM ('Exceptional', 'Exceeds Expectations', 'Meets Expectations', 'Needs Improvement');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Tables
    await query(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          full_name VARCHAR(150) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role user_role NOT NULL DEFAULT 'employee',
          status account_status NOT NULL DEFAULT 'ACTIVE',
          is_verified BOOLEAN NOT NULL DEFAULT FALSE,
          avatar TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS employees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) UNIQUE NOT NULL,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          full_name VARCHAR(150) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50),
          address TEXT,
          emergency_contact TEXT,
          avatar TEXT,
          status employment_status NOT NULL DEFAULT 'Active',
          department VARCHAR(100) NOT NULL,
          designation VARCHAR(100) NOT NULL,
          job_title VARCHAR(150) NOT NULL,
          work_type VARCHAR(100) NOT NULL DEFAULT 'Full-Time (Remote)',
          join_date DATE NOT NULL DEFAULT CURRENT_DATE,
          reporting_manager VARCHAR(150),
          location VARCHAR(150) DEFAULT 'HQ / Remote',
          work_shift VARCHAR(100) DEFAULT '09:00 AM - 05:30 PM (PST)',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invitations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL,
          full_name VARCHAR(150) NOT NULL,
          role user_role NOT NULL DEFAULT 'employee',
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          status invitation_status NOT NULL DEFAULT 'INVITED',
          created_by VARCHAR(150) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          used_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS salary_structures (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) UNIQUE NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
          currency VARCHAR(10) NOT NULL DEFAULT 'USD',
          basic NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          hra NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          transport NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          medical NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          gross NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          tax_deduction NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          pf_deduction NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          net_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS leave_balances (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) UNIQUE NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
          annual INT NOT NULL DEFAULT 18,
          monthly INT NOT NULL DEFAULT 2,
          daily INT NOT NULL DEFAULT 5,
          hourly INT NOT NULL DEFAULT 16,
          sick INT NOT NULL DEFAULT 10,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS employee_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          file_size VARCHAR(50) NOT NULL,
          document_type VARCHAR(50) DEFAULT 'PDF',
          file_url TEXT,
          uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS attendance (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
          date DATE NOT NULL,
          check_in VARCHAR(20),
          check_out VARCHAR(20),
          work_hours VARCHAR(20) DEFAULT 'In Progress',
          status VARCHAR(50) NOT NULL DEFAULT 'Present',
          device VARCHAR(100) DEFAULT 'Web App Portal',
          location VARCHAR(150) DEFAULT 'Standard IP / VPN',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT uq_attendance_emp_date UNIQUE (employee_id, date)
      );

      CREATE TABLE IF NOT EXISTS leaves (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
          employee_name VARCHAR(150) NOT NULL,
          department VARCHAR(100) NOT NULL,
          leave_type leave_type NOT NULL,
          from_date DATE NOT NULL,
          to_date DATE NOT NULL,
          duration INT NOT NULL DEFAULT 1,
          remarks TEXT NOT NULL,
          status leave_status NOT NULL DEFAULT 'Pending',
          admin_comment TEXT,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          reviewed_at TIMESTAMPTZ,
          reviewed_by VARCHAR(150)
      );

      CREATE TABLE IF NOT EXISTS payroll (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
          employee_name VARCHAR(150) NOT NULL,
          department VARCHAR(100) NOT NULL,
          designation VARCHAR(100) NOT NULL,
          month VARCHAR(50) NOT NULL,
          month_code VARCHAR(20) NOT NULL,
          basic NUMERIC(12, 2) NOT NULL,
          hra NUMERIC(12, 2) NOT NULL,
          transport NUMERIC(12, 2) NOT NULL,
          medical NUMERIC(12, 2) NOT NULL,
          gross NUMERIC(12, 2) NOT NULL,
          tax_deduction NUMERIC(12, 2) NOT NULL,
          pf_deduction NUMERIC(12, 2) NOT NULL,
          net_salary NUMERIC(12, 2) NOT NULL,
          status payroll_status NOT NULL DEFAULT 'Processed',
          payment_method VARCHAR(100) DEFAULT 'Direct Deposit (ACH)',
          payment_date DATE,
          slip_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT uq_payroll_emp_month UNIQUE (employee_id, month_code)
      );

      CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
          employee_name VARCHAR(150) NOT NULL,
          department VARCHAR(100) NOT NULL,
          period VARCHAR(100) NOT NULL,
          reviewer VARCHAR(150) NOT NULL,
          reviewer_role VARCHAR(100) DEFAULT 'VP of HR',
          score INT NOT NULL CHECK (score >= 0 AND score <= 100),
          rating review_rating NOT NULL,
          strengths TEXT,
          improvements TEXT,
          feedback TEXT NOT NULL,
          review_date DATE NOT NULL DEFAULT CURRENT_DATE,
          status VARCHAR(50) NOT NULL DEFAULT 'Published',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT 'system',
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS finance_summary (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          total_revenue NUMERIC(15, 2) NOT NULL,
          revenue_change NUMERIC(5, 2) NOT NULL,
          total_expenses NUMERIC(15, 2) NOT NULL,
          expense_change NUMERIC(5, 2) NOT NULL,
          net_profit NUMERIC(15, 2) NOT NULL,
          profit_change NUMERIC(5, 2) NOT NULL,
          pending_invoices NUMERIC(15, 2) NOT NULL,
          invoices_count INT NOT NULL,
          payroll_spending NUMERIC(15, 2) NOT NULL,
          payroll_change NUMERIC(5, 2) NOT NULL,
          cash_runway_months NUMERIC(4, 1) NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cash_flow (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          month VARCHAR(20) NOT NULL,
          revenue NUMERIC(15, 2) NOT NULL,
          expenses NUMERIC(15, 2) NOT NULL,
          net NUMERIC(15, 2) NOT NULL,
          year INT NOT NULL DEFAULT 2026,
          sort_order INT NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS expense_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          value NUMERIC(15, 2) NOT NULL,
          color VARCHAR(20) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS department_spending (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          department VARCHAR(100) NOT NULL,
          budget NUMERIC(15, 2) NOT NULL,
          actual NUMERIC(15, 2) NOT NULL,
          utilization NUMERIC(5, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ledger_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          transaction_code VARCHAR(50) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          amount NUMERIC(15, 2) NOT NULL,
          date DATE NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Completed',
          type transaction_type NOT NULL
      );

      CREATE TABLE IF NOT EXISTS time_management_summary (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          total_tracked_hours NUMERIC(10, 2) NOT NULL,
          average_work_hours NUMERIC(4, 2) NOT NULL,
          overtime_hours NUMERIC(6, 2) NOT NULL,
          productivity_score NUMERIC(5, 2) NOT NULL,
          on_time_arrival_rate NUMERIC(5, 2) NOT NULL,
          active_clocked_in_now INT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS shift_schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          shift_name VARCHAR(100) NOT NULL,
          timing VARCHAR(100) NOT NULL,
          assigned_employees INT NOT NULL DEFAULT 0,
          compliance NUMERIC(5, 2) NOT NULL DEFAULT 100.0
      );

      CREATE TABLE IF NOT EXISTS weekly_heatmap (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          day VARCHAR(10) NOT NULL,
          hour_08 INT NOT NULL DEFAULT 0,
          hour_10 INT NOT NULL DEFAULT 0,
          hour_12 INT NOT NULL DEFAULT 0,
          hour_14 INT NOT NULL DEFAULT 0,
          hour_16 INT NOT NULL DEFAULT 0,
          hour_18 INT NOT NULL DEFAULT 0,
          sort_order INT NOT NULL DEFAULT 0
      );
    `);

    // 4. Indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
      CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
      CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
      CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
      CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
      CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll(employee_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_employee_id ON reviews(employee_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);
    `);

    // 5. Seed initial data if empty
    const userCheck = await query(`SELECT COUNT(*) as count FROM users;`);
    if (parseInt(userCheck.rows[0].count, 10) === 0) {
      console.log('🌱 [Neon DB] Seeding initial enterprise workforce & demo records...');

      const adminPassHash = bcrypt.hashSync('Admin@1234', 12);
      const empPassHash = bcrypt.hashSync('Employee@1234', 12);

      // Seed Users
      await query(`
        INSERT INTO users (id, employee_id, email, full_name, password_hash, role, status, is_verified, avatar)
        VALUES
        ('a0000000-0000-0000-0000-000000000001', 'EMP-001', 'admin@dayflow.com', 'Eleanor Vance', $1, 'admin', 'ACTIVE', TRUE, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop'),
        ('a0000000-0000-0000-0000-000000000002', 'EMP-1042', 'alex.morgan@dayflow.com', 'Alex Morgan', $2, 'employee', 'ACTIVE', TRUE, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'),
        ('a0000000-0000-0000-0000-000000000003', 'EMP-1088', 'sarah.chen@dayflow.com', 'Sarah Chen', $2, 'employee', 'ACTIVE', TRUE, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop'),
        ('a0000000-0000-0000-0000-000000000004', 'EMP-1102', 'david.kim@dayflow.com', 'David Kim', $2, 'employee', 'ACTIVE', TRUE, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop'),
        ('a0000000-0000-0000-0000-000000000005', 'EMP-1145', 'maya.patel@dayflow.com', 'Maya Patel', $2, 'employee', 'ACTIVE', TRUE, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop'),
        ('a0000000-0000-0000-0000-000000000006', 'EMP-1190', 'james.wilson@dayflow.com', 'James Wilson', $2, 'employee', 'ACTIVE', TRUE, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop'),
        ('a0000000-0000-0000-0000-000000000007', 'EMP-1205', 'elena.rostova@dayflow.com', 'Elena Rostova', $2, 'employee', 'ACTIVE', TRUE, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop');
      `, [adminPassHash, empPassHash]);

      // Seed Employees
      await query(`
        INSERT INTO employees (id, employee_id, user_id, full_name, email, phone, address, emergency_contact, avatar, status, department, designation, job_title, work_type, join_date, reporting_manager, location, work_shift)
        VALUES
        ('b0000000-0000-0000-0000-000000000001', 'EMP-001', 'a0000000-0000-0000-0000-000000000001', 'Eleanor Vance', 'admin@dayflow.com', '+1 (555) 234-8901', '742 Evergreen Terrace, Suite 400, San Francisco, CA', 'Robert Vance (+1 555-890-1234)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop', 'Active', 'Human Resources', 'Vice President', 'VP of Human Resources & People Ops', 'Full-Time (Hybrid)', '2023-01-01', 'Board of Directors', 'San Francisco HQ', '09:00 AM - 06:00 PM (PST)'),
        ('b0000000-0000-0000-0000-000000000002', 'EMP-1042', 'a0000000-0000-0000-0000-000000000002', 'Alex Morgan', 'alex.morgan@dayflow.com', '+1 (555) 432-9081', '128 Mission Bay Blvd, Apt 5B, San Francisco, CA 94158', 'Clara Morgan (+1 555-678-9012)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop', 'Active', 'Design & UX', 'Senior IC-4', 'Senior Product Designer', 'Full-Time (Remote)', '2023-03-15', 'Eleanor Vance', 'Remote - West Coast', '09:00 AM - 05:30 PM (PST)'),
        ('b0000000-0000-0000-0000-000000000003', 'EMP-1088', 'a0000000-0000-0000-0000-000000000003', 'Sarah Chen', 'sarah.chen@dayflow.com', '+1 (555) 789-2341', '450 Fremont Street, Seattle, WA', 'Michael Chen (+1 555-321-4567)', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop', 'Active', 'Engineering', 'Staff Engineer (IC-5)', 'Lead Frontend Engineer', 'Full-Time (Hybrid)', '2023-05-10', 'Marcus Brody', 'Seattle Hub', '09:30 AM - 06:00 PM (PST)'),
        ('b0000000-0000-0000-0000-000000000004', 'EMP-1102', 'a0000000-0000-0000-0000-000000000004', 'David Kim', 'david.kim@dayflow.com', '+1 (555) 890-5678', '202 Lakeview Ave, Austin, TX', 'Hannah Kim (+1 555-890-9988)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop', 'Active', 'Infrastructure', 'Senior Architect', 'DevOps & Cloud Architect', 'Full-Time (Remote)', '2023-06-01', 'Marcus Brody', 'Austin Hub', '08:30 AM - 05:00 PM (CST)'),
        ('b0000000-0000-0000-0000-000000000005', 'EMP-1145', 'a0000000-0000-0000-0000-000000000005', 'Maya Patel', 'maya.patel@dayflow.com', '+1 (555) 678-1234', '900 Broadway, New York, NY', 'Dev Patel (+1 555-678-0099)', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop', 'Active', 'Product', 'Principal PM', 'Principal Product Manager', 'Full-Time (On-site)', '2023-08-12', 'Eleanor Vance', 'New York Office', '09:00 AM - 06:00 PM (EST)'),
        ('b0000000-0000-0000-0000-000000000006', 'EMP-1190', 'a0000000-0000-0000-0000-000000000006', 'James Wilson', 'james.wilson@dayflow.com', '+1 (555) 456-7890', '1504 Pine Street, Chicago, IL', 'Jessica Wilson (+1 555-456-1122)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', 'Active', 'Engineering', 'Lead QA Engineer', 'QA Automation Lead', 'Full-Time (Hybrid)', '2023-11-20', 'Sarah Chen', 'Chicago Hub', '09:00 AM - 05:30 PM (CST)'),
        ('b0000000-0000-0000-0000-000000000007', 'EMP-1205', 'a0000000-0000-0000-0000-000000000007', 'Elena Rostova', 'elena.rostova@dayflow.com', '+1 (555) 345-6789', '320 Main St, Boston, MA', 'Dmitri Rostov (+1 555-345-9988)', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop', 'Active', 'Human Resources', 'Senior Recruiter', 'Talent Acquisition Lead', 'Full-Time (Remote)', '2024-01-08', 'Eleanor Vance', 'Boston Hub', '09:00 AM - 05:30 PM (EST)'),
        ('b0000000-0000-0000-0000-000000000008', 'EMP-1050', NULL, 'Priya Sharma', 'priya.sharma@dayflow.com', '+1 (555) 390-1122', '88 Tech Blvd, San Jose, CA', 'Amit Sharma (+1 555-390-4455)', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=256&auto=format&fit=crop', 'Invited', 'Design & UX', 'Staff Designer', 'UI/UX Interaction Designer', 'Full-Time (Remote)', '2026-09-01', 'Alex Morgan', 'Remote', '09:00 AM - 05:30 PM (PST)');
      `);

      // Seed Invitations
      await query(`
        INSERT INTO invitations (employee_id, email, full_name, role, token, expires_at, status, created_by)
        VALUES
        ('EMP-1050', 'priya.sharma@dayflow.com', 'Priya Sharma', 'employee', 'demo-invite-token-emp-2026', NOW() + INTERVAL '7 days', 'INVITED', 'Eleanor Vance (HR Admin)'),
        ('EMP-1060', 'marcus.vance@dayflow.com', 'Marcus Vance', 'admin', 'demo-invite-token-admin-2026', NOW() + INTERVAL '7 days', 'INVITED', 'Eleanor Vance (HR Admin)'),
        ('EMP-1099', 'expired.user@dayflow.com', 'Expired User', 'employee', 'demo-invite-token-expired', NOW() - INTERVAL '2 days', 'EXPIRED', 'Eleanor Vance (HR Admin)');
      `);

      // Seed Salary Structures
      await query(`
        INSERT INTO salary_structures (employee_id, currency, basic, hra, transport, medical, gross, tax_deduction, pf_deduction, net_salary)
        VALUES
        ('EMP-001', 'USD', 12000.00, 4000.00, 1000.00, 800.00, 17800.00, 3200.00, 1400.00, 13200.00),
        ('EMP-1042', 'USD', 6500.00, 2200.00, 600.00, 500.00, 9800.00, 1470.00, 784.00, 7546.00),
        ('EMP-1088', 'USD', 8200.00, 2800.00, 700.00, 600.00, 12300.00, 1980.00, 980.00, 9340.00),
        ('EMP-1102', 'USD', 7800.00, 2500.00, 650.00, 550.00, 11500.00, 1750.00, 920.00, 8830.00),
        ('EMP-1145', 'USD', 8500.00, 3000.00, 800.00, 600.00, 12900.00, 2100.00, 1030.00, 9770.00),
        ('EMP-1190', 'USD', 6200.00, 2100.00, 550.00, 500.00, 9350.00, 1390.00, 748.00, 7212.00),
        ('EMP-1205', 'USD', 5800.00, 1900.00, 500.00, 500.00, 8700.00, 1250.00, 696.00, 6754.00),
        ('EMP-1050', 'USD', 6200.00, 2000.00, 500.00, 500.00, 9200.00, 1380.00, 744.00, 7076.00);
      `);

      // Seed Leave Balances
      await query(`
        INSERT INTO leave_balances (employee_id, annual, monthly, daily, hourly, sick)
        VALUES
        ('EMP-001', 24, 2, 6, 24, 12),
        ('EMP-1042', 18, 2, 5, 16, 10),
        ('EMP-1088', 15, 2, 4, 12, 8),
        ('EMP-1102', 20, 2, 6, 20, 11),
        ('EMP-1145', 16, 2, 5, 14, 9),
        ('EMP-1190', 14, 2, 4, 10, 8),
        ('EMP-1205', 17, 2, 5, 16, 10),
        ('EMP-1050', 18, 2, 5, 16, 10);
      `);

      // Seed Documents
      await query(`
        INSERT INTO employee_documents (employee_id, name, file_size, document_type, file_url)
        VALUES
        ('EMP-001', 'Executive_Offer_Letter.pdf', '1.8 MB', 'PDF', '/docs/Executive_Offer_Letter.pdf'),
        ('EMP-001', 'Non_Disclosure_Agreement.pdf', '940 KB', 'PDF', '/docs/Non_Disclosure_Agreement.pdf'),
        ('EMP-1042', 'Employment_Contract_Signed.pdf', '2.4 MB', 'PDF', '/docs/Employment_Contract_Signed.pdf');
      `);

      // Seed Leaves
      await query(`
        INSERT INTO leaves (employee_id, employee_name, department, leave_type, from_date, to_date, duration, remarks, status, admin_comment, applied_at, reviewed_at, reviewed_by)
        VALUES
        ('EMP-1042', 'Alex Morgan', 'Design & UX', 'Paid', '2026-09-10', '2026-09-12', 3, 'Annual family vacation trip to Yosemite.', 'Approved', 'Approved. Please coordinate with design team handoffs.', '2026-08-15T10:30:00Z', '2026-08-16T14:20:00Z', 'Eleanor Vance'),
        ('EMP-1042', 'Alex Morgan', 'Design & UX', 'Sick', '2026-08-04', '2026-08-04', 1, 'Doctor appointment and routine allergy checkup.', 'Approved', 'Approved. Rest well!', '2026-08-03T16:00:00Z', '2026-08-03T18:00:00Z', 'Eleanor Vance'),
        ('EMP-1042', 'Alex Morgan', 'Design & UX', 'Paid', '2026-10-01', '2026-10-02', 2, 'Attending Figma Config design symposium.', 'Pending', NULL, '2026-08-20T11:15:00Z', NULL, NULL);
      `);

      // Seed Payroll
      await query(`
        INSERT INTO payroll (employee_id, employee_name, department, designation, month, month_code, basic, hra, transport, medical, gross, tax_deduction, pf_deduction, net_salary, status, payment_method, payment_date, slip_url)
        VALUES
        ('EMP-1042', 'Alex Morgan', 'Design & UX', 'Senior Product Designer', 'July 2026', '2026-07', 6500.00, 2200.00, 600.00, 500.00, 9800.00, 1470.00, 784.00, 7546.00, 'Paid', 'Direct Deposit (ACH)', '2026-07-31', '/api/payroll/me/slip/2026-07'),
        ('EMP-1042', 'Alex Morgan', 'Design & UX', 'Senior Product Designer', 'August 2026', '2026-08', 6500.00, 2200.00, 600.00, 500.00, 9800.00, 1470.00, 784.00, 7546.00, 'Processed', 'Direct Deposit (ACH)', '2026-08-31', '/api/payroll/me/slip/2026-08'),
        ('EMP-1088', 'Sarah Chen', 'Engineering', 'Lead Frontend Engineer', 'August 2026', '2026-08', 8200.00, 2800.00, 700.00, 600.00, 12300.00, 1980.00, 980.00, 9340.00, 'Processed', 'Direct Deposit (ACH)', '2026-08-31', '/api/payroll/me/slip/2026-08'),
        ('EMP-1102', 'David Kim', 'Infrastructure', 'DevOps & Cloud Architect', 'August 2026', '2026-08', 7800.00, 2500.00, 650.00, 550.00, 11500.00, 1750.00, 920.00, 8830.00, 'Processed', 'Direct Deposit (ACH)', '2026-08-31', '/api/payroll/me/slip/2026-08');
      `);

      // Seed Reviews
      await query(`
        INSERT INTO reviews (employee_id, employee_name, department, period, reviewer, reviewer_role, score, rating, strengths, improvements, feedback, review_date, status)
        VALUES
        ('EMP-1042', 'Alex Morgan', 'Design & UX', 'Q2 2026 (Apr - Jun)', 'Eleanor Vance', 'VP of HR', 94, 'Exceeds Expectations', 'Outstanding design velocity, spearheaded new design system revamp.', 'Could mentor junior UX researchers more actively.', 'Alex has consistently delivered high-caliber design artifacts.', '2026-07-05', 'Published');
      `);

      // Seed Notifications
      await query(`
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES
        ('a0000000-0000-0000-0000-000000000002', 'Leave Request Approved', 'Your leave request for Yosemite (Sep 10 - Sep 12) was approved by Eleanor Vance.', 'leave', FALSE);
      `);

      // Seed Finance Summary
      await query(`
        INSERT INTO finance_summary (total_revenue, revenue_change, total_expenses, expense_change, net_profit, profit_change, pending_invoices, invoices_count, payroll_spending, payroll_change, cash_runway_months)
        VALUES
        (284500.00, 14.80, 168400.00, -3.20, 116100.00, 22.40, 42300.00, 8, 72890.00, 5.10, 18.5);

        INSERT INTO cash_flow (month, revenue, expenses, net, year, sort_order)
        VALUES
        ('Jan', 210000.00, 145000.00, 65000.00, 2026, 1),
        ('Feb', 225000.00, 148000.00, 77000.00, 2026, 2),
        ('Mar', 240000.00, 152000.00, 88000.00, 2026, 3),
        ('Apr', 255000.00, 158000.00, 97000.00, 2026, 4),
        ('May', 270000.00, 162000.00, 108000.00, 2026, 5),
        ('Jun', 278000.00, 165000.00, 113000.00, 2026, 6),
        ('Jul', 284500.00, 168400.00, 116100.00, 2026, 7);

        INSERT INTO expense_categories (name, value, color)
        VALUES
        ('Engineering & Tech', 58000.00, '#00C896'),
        ('Payroll & Benefits', 72890.00, '#38BDF8'),
        ('Marketing & Growth', 21500.00, '#F59E0B'),
        ('Office & Facilities', 9200.00, '#A855F7'),
        ('Legal & Compliance', 6810.00, '#EC4899');

        INSERT INTO department_spending (department, budget, actual, utilization)
        VALUES
        ('Engineering', 90000.00, 82400.00, 91.50),
        ('Design & UX', 35000.00, 31200.00, 89.10),
        ('Product', 40000.00, 36800.00, 92.00),
        ('Human Resources', 30000.00, 26500.00, 88.30),
        ('Infrastructure', 25000.00, 23100.00, 92.40);

        INSERT INTO ledger_transactions (transaction_code, title, category, amount, date, status, type)
        VALUES
        ('TX-8801', 'AWS Cloud Hosting & Kubernetes', 'Infrastructure', 8450.00, '2026-08-20', 'Completed', 'Expense'),
        ('TX-8802', 'Enterprise SaaS Subscription (Acme Corp)', 'Sales', 34200.00, '2026-08-19', 'Completed', 'Income'),
        ('TX-8803', 'Figma Organization Annual License', 'Software', 4200.00, '2026-08-18', 'Completed', 'Expense'),
        ('TX-8804', 'Direct Deposit Payroll Disbursement Batch', 'Payroll', 72890.00, '2026-08-15', 'Completed', 'Expense');
      `);

      // Seed Time Management
      await query(`
        INSERT INTO time_management_summary (total_tracked_hours, average_work_hours, overtime_hours, productivity_score, on_time_arrival_rate, active_clocked_in_now)
        VALUES
        (1420.00, 8.20, 64.50, 92.80, 94.20, 5);

        INSERT INTO shift_schedules (shift_name, timing, assigned_employees, compliance)
        VALUES
        ('General Morning (PST)', '09:00 AM - 05:30 PM', 4, 96.00),
        ('Central Flexible (CST)', '08:30 AM - 05:00 PM', 2, 94.00),
        ('Executive Shift (EST)', '09:00 AM - 06:00 PM', 1, 98.00);

        INSERT INTO weekly_heatmap (day, hour_08, hour_10, hour_12, hour_14, hour_16, hour_18, sort_order)
        VALUES
        ('Mon', 12, 35, 28, 38, 34, 10, 1),
        ('Tue', 15, 38, 30, 40, 37, 14, 2),
        ('Wed', 14, 39, 29, 41, 38, 15, 3),
        ('Thu', 16, 37, 27, 39, 36, 12, 4),
        ('Fri', 11, 32, 25, 34, 28, 6, 5);
      `);

      // Seed Attendance for the last 20 weekdays
      const today = new Date();
      const empIds = ['EMP-001', 'EMP-1042', 'EMP-1088', 'EMP-1102', 'EMP-1145', 'EMP-1190', 'EMP-1205'];

      for (let i = 20; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        const dateStr = d.toISOString().split('T')[0];

        for (const empId of empIds) {
          const isToday = i === 0;
          const checkIn = isToday ? (empId === 'EMP-1088' ? '09:18 AM' : '08:58 AM') : '08:55 AM';
          const checkOut = isToday ? null : '05:30 PM';
          const workHours = isToday ? 'In Progress' : '8.5 hrs';
          const status = isToday && empId === 'EMP-1088' ? 'Late' : 'Present';

          await query(`
            INSERT INTO attendance (employee_id, date, check_in, check_out, work_hours, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (employee_id, date) DO NOTHING;
          `, [empId, dateStr, checkIn, checkOut, workHours, status]);
        }
      }
    }

    console.log('✅ [Neon DB] Database initialized and synchronized successfully!');
    return true;
  } catch (error) {
    console.error('❌ [Neon DB] Database initialization error:', error);
    throw error;
  }
};
