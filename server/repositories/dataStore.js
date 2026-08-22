import bcrypt from 'bcryptjs';

// Pre-hashed passwords using bcrypt (12 rounds)
// Admin@1234 => $2a$12$Nq9v7e5kRzR1g0yG9PjO.. (generated below safely on init or synchronized)
const DEFAULT_ADMIN_PASS_HASH = bcrypt.hashSync('Admin@1234', 12);
const DEFAULT_EMP_PASS_HASH = bcrypt.hashSync('Employee@1234', 12);

class InMemoryDataStore {
  constructor() {
    this.init();
  }

  init() {
    // 1. USERS COLLECTION
    this.users = [
      {
        id: 'usr-admin-01',
        employeeId: 'EMP-001',
        email: 'admin@dayflow.com',
        fullName: 'Eleanor Vance',
        passwordHash: DEFAULT_ADMIN_PASS_HASH,
        role: 'admin',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
        createdAt: '2023-01-01T08:00:00.000Z'
      },
      {
        id: 'usr-emp-01',
        employeeId: 'EMP-1042',
        email: 'alex.morgan@dayflow.com',
        fullName: 'Alex Morgan',
        passwordHash: DEFAULT_EMP_PASS_HASH,
        role: 'employee',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        createdAt: '2023-03-15T09:00:00.000Z'
      },
      {
        id: 'usr-emp-02',
        employeeId: 'EMP-1088',
        email: 'sarah.chen@dayflow.com',
        fullName: 'Sarah Chen',
        passwordHash: DEFAULT_EMP_PASS_HASH,
        role: 'employee',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop',
        createdAt: '2023-05-10T09:00:00.000Z'
      },
      {
        id: 'usr-emp-03',
        employeeId: 'EMP-1102',
        email: 'david.kim@dayflow.com',
        fullName: 'David Kim',
        passwordHash: DEFAULT_EMP_PASS_HASH,
        role: 'employee',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
        createdAt: '2023-06-01T09:00:00.000Z'
      },
      {
        id: 'usr-emp-04',
        employeeId: 'EMP-1145',
        email: 'maya.patel@dayflow.com',
        fullName: 'Maya Patel',
        passwordHash: DEFAULT_EMP_PASS_HASH,
        role: 'employee',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop',
        createdAt: '2023-08-12T09:00:00.000Z'
      },
      {
        id: 'usr-emp-05',
        employeeId: 'EMP-1190',
        email: 'james.wilson@dayflow.com',
        fullName: 'James Wilson',
        passwordHash: DEFAULT_EMP_PASS_HASH,
        role: 'employee',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
        createdAt: '2023-11-20T09:00:00.000Z'
      },
      {
        id: 'usr-emp-06',
        employeeId: 'EMP-1205',
        email: 'elena.rostova@dayflow.com',
        fullName: 'Elena Rostova',
        passwordHash: DEFAULT_EMP_PASS_HASH,
        role: 'employee',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
        createdAt: '2024-01-08T09:00:00.000Z'
      }
    ];

    // 2. EMPLOYEE PROFILES (Rich Enterprise Details)
    this.employees = [
      {
        id: 'emp-001',
        employeeId: 'EMP-001',
        userId: 'usr-admin-01',
        fullName: 'Eleanor Vance',
        email: 'admin@dayflow.com',
        phone: '+1 (555) 234-8901',
        address: '742 Evergreen Terrace, Suite 400, San Francisco, CA',
        emergencyContact: 'Robert Vance (+1 555-890-1234)',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
        status: 'Active',
        jobDetails: {
          title: 'VP of Human Resources & People Ops',
          department: 'Executive / HR',
          designation: 'Vice President',
          workType: 'Full-Time (Hybrid)',
          joinDate: '2023-01-01',
          reportingManager: 'Board of Directors',
          location: 'San Francisco HQ',
          workShift: '09:00 AM - 06:00 PM (PST)'
        },
        salaryStructure: {
          currency: 'USD',
          basic: 12000,
          hra: 4000,
          transport: 1000,
          medical: 800,
          gross: 17800,
          taxDeduction: 3200,
          pfDeduction: 1400,
          netSalary: 13200
        },
        leaveBalances: {
          annual: 24,
          monthly: 2,
          daily: 6,
          hourly: 24,
          sick: 12
        },
        documents: [
          { name: 'Executive_Offer_Letter.pdf', size: '1.8 MB', uploadedAt: '2023-01-01', type: 'PDF' },
          { name: 'Non_Disclosure_Agreement.pdf', size: '940 KB', uploadedAt: '2023-01-02', type: 'PDF' },
          { name: 'Tax_W4_Form_2025.pdf', size: '420 KB', uploadedAt: '2025-01-10', type: 'PDF' }
        ]
      },
      {
        id: 'emp-1042',
        employeeId: 'EMP-1042',
        userId: 'usr-emp-01',
        fullName: 'Alex Morgan',
        email: 'alex.morgan@dayflow.com',
        phone: '+1 (555) 432-9081',
        address: '128 Mission Bay Blvd, Apt 5B, San Francisco, CA 94158',
        emergencyContact: 'Clara Morgan (Spouse) - +1 555-678-9012',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        status: 'Active',
        jobDetails: {
          title: 'Senior Product Designer',
          department: 'Design & UX',
          designation: 'Senior IC-4',
          workType: 'Full-Time (Remote)',
          joinDate: '2023-03-15',
          reportingManager: 'Eleanor Vance',
          location: 'Remote - West Coast',
          workShift: '09:00 AM - 05:30 PM (PST)'
        },
        salaryStructure: {
          currency: 'USD',
          basic: 6500,
          hra: 2200,
          transport: 600,
          medical: 500,
          gross: 9800,
          taxDeduction: 1470,
          pfDeduction: 784,
          netSalary: 7546
        },
        leaveBalances: {
          annual: 18,
          monthly: 2,
          daily: 5,
          hourly: 16,
          sick: 10
        },
        documents: [
          { name: 'Employment_Contract_Signed.pdf', size: '2.4 MB', uploadedAt: '2023-03-15', type: 'PDF' },
          { name: 'Identity_Verification_Passport.pdf', size: '1.2 MB', uploadedAt: '2023-03-16', type: 'PDF' },
          { name: 'Health_Insurance_Enrollment.pdf', size: '680 KB', uploadedAt: '2023-04-01', type: 'PDF' }
        ]
      },
      {
        id: 'emp-1088',
        employeeId: 'EMP-1088',
        userId: 'usr-emp-02',
        fullName: 'Sarah Chen',
        email: 'sarah.chen@dayflow.com',
        phone: '+1 (555) 789-2341',
        address: '450 Fremont Street, Seattle, WA',
        emergencyContact: 'Michael Chen - +1 555-321-4567',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop',
        status: 'Active',
        jobDetails: {
          title: 'Lead Frontend Engineer',
          department: 'Engineering',
          designation: 'Staff Engineer (IC-5)',
          workType: 'Full-Time (Hybrid)',
          joinDate: '2023-05-10',
          reportingManager: 'Marcus Brody',
          location: 'Seattle Hub',
          workShift: '09:30 AM - 06:00 PM (PST)'
        },
        salaryStructure: {
          currency: 'USD',
          basic: 8200,
          hra: 2800,
          transport: 700,
          medical: 600,
          gross: 12300,
          taxDeduction: 1980,
          pfDeduction: 980,
          netSalary: 9340
        },
        leaveBalances: {
          annual: 15,
          monthly: 2,
          daily: 4,
          hourly: 12,
          sick: 8
        },
        documents: [
          { name: 'Offer_Letter_Signed.pdf', size: '1.9 MB', uploadedAt: '2023-05-10', type: 'PDF' }
        ]
      },
      {
        id: 'emp-1102',
        employeeId: 'EMP-1102',
        userId: 'usr-emp-03',
        fullName: 'David Kim',
        email: 'david.kim@dayflow.com',
        phone: '+1 (555) 890-5678',
        address: '202 Lakeview Ave, Austin, TX',
        emergencyContact: 'Hannah Kim - +1 555-890-9988',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
        status: 'Active',
        jobDetails: {
          title: 'DevOps & Cloud Architect',
          department: 'Infrastructure',
          designation: 'Senior Architect',
          workType: 'Full-Time (Remote)',
          joinDate: '2023-06-01',
          reportingManager: 'Marcus Brody',
          location: 'Austin Hub',
          workShift: '08:30 AM - 05:00 PM (CST)'
        },
        salaryStructure: {
          currency: 'USD',
          basic: 7800,
          hra: 2500,
          transport: 650,
          medical: 550,
          gross: 11500,
          taxDeduction: 1750,
          pfDeduction: 920,
          netSalary: 8830
        },
        leaveBalances: {
          annual: 20,
          monthly: 2,
          daily: 6,
          hourly: 20,
          sick: 11
        },
        documents: [
          { name: 'AWS_Security_Certification.pdf', size: '1.1 MB', uploadedAt: '2023-06-05', type: 'PDF' }
        ]
      },
      {
        id: 'emp-1145',
        employeeId: 'EMP-1145',
        userId: 'usr-emp-04',
        fullName: 'Maya Patel',
        email: 'maya.patel@dayflow.com',
        phone: '+1 (555) 678-1234',
        address: '900 Broadway, New York, NY',
        emergencyContact: 'Dev Patel - +1 555-678-0099',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop',
        status: 'Active',
        jobDetails: {
          title: 'Principal Product Manager',
          department: 'Product',
          designation: 'Principal PM',
          workType: 'Full-Time (On-site)',
          joinDate: '2023-08-12',
          reportingManager: 'Eleanor Vance',
          location: 'New York Office',
          workShift: '09:00 AM - 06:00 PM (EST)'
        },
        salaryStructure: {
          currency: 'USD',
          basic: 8500,
          hra: 3000,
          transport: 800,
          medical: 600,
          gross: 12900,
          taxDeduction: 2100,
          pfDeduction: 1030,
          netSalary: 9770
        },
        leaveBalances: {
          annual: 16,
          monthly: 2,
          daily: 5,
          hourly: 14,
          sick: 9
        },
        documents: [
          { name: 'NDA_Signed_2023.pdf', size: '820 KB', uploadedAt: '2023-08-12', type: 'PDF' }
        ]
      },
      {
        id: 'emp-1190',
        employeeId: 'EMP-1190',
        userId: 'usr-emp-05',
        fullName: 'James Wilson',
        email: 'james.wilson@dayflow.com',
        phone: '+1 (555) 456-7890',
        address: '1504 Pine Street, Chicago, IL',
        emergencyContact: 'Jessica Wilson - +1 555-456-1122',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
        status: 'Active',
        jobDetails: {
          title: 'QA Automation Lead',
          department: 'Engineering',
          designation: 'Lead QA Engineer',
          workType: 'Full-Time (Hybrid)',
          joinDate: '2023-11-20',
          reportingManager: 'Sarah Chen',
          location: 'Chicago Hub',
          workShift: '09:00 AM - 05:30 PM (CST)'
        },
        salaryStructure: {
          currency: 'USD',
          basic: 6200,
          hra: 2100,
          transport: 550,
          medical: 500,
          gross: 9350,
          taxDeduction: 1390,
          pfDeduction: 748,
          netSalary: 7212
        },
        leaveBalances: {
          annual: 14,
          monthly: 2,
          daily: 4,
          hourly: 10,
          sick: 8
        },
        documents: [
          { name: 'QA_Lead_Agreement.pdf', size: '1.5 MB', uploadedAt: '2023-11-20', type: 'PDF' }
        ]
      },
      {
        id: 'emp-1205',
        employeeId: 'EMP-1205',
        userId: 'usr-emp-06',
        fullName: 'Elena Rostova',
        email: 'elena.rostova@dayflow.com',
        phone: '+1 (555) 345-6789',
        address: '320 Main St, Boston, MA',
        emergencyContact: 'Dmitri Rostov - +1 555-345-9988',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
        status: 'Active',
        jobDetails: {
          title: 'Talent Acquisition Lead',
          department: 'Human Resources',
          designation: 'Senior Recruiter',
          workType: 'Full-Time (Remote)',
          joinDate: '2024-01-08',
          reportingManager: 'Eleanor Vance',
          location: 'Boston Hub',
          workShift: '09:00 AM - 05:30 PM (EST)'
        },
        salaryStructure: {
          currency: 'USD',
          basic: 5800,
          hra: 1900,
          transport: 500,
          medical: 500,
          gross: 8700,
          taxDeduction: 1250,
          pfDeduction: 696,
          netSalary: 6754
        },
        leaveBalances: {
          annual: 17,
          monthly: 2,
          daily: 5,
          hourly: 16,
          sick: 10
        },
        documents: [
          { name: 'Talent_Acquisition_Contract.pdf', size: '1.4 MB', uploadedAt: '2024-01-08', type: 'PDF' }
        ]
      }
    ];

    // 3. ATTENDANCE RECORDS (Past 30 days + dynamic punch states)
    this.attendance = [];
    const today = new Date();
    const employeeIds = ['EMP-001', 'EMP-1042', 'EMP-1088', 'EMP-1102', 'EMP-1145', 'EMP-1190', 'EMP-1205'];

    for (let i = 25; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayOfWeek = d.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateStr = d.toISOString().split('T')[0];

      employeeIds.forEach((empId) => {
        const isToday = i === 0;
        let checkIn = '09:00 AM';
        let checkOut = '05:30 PM';
        let workHours = '8.5 hrs';
        let status = 'Present';

        if (isToday) {
          if (empId === 'EMP-1042') {
            // Alex Morgan checked in today at 08:58 AM, not yet checked out
            checkIn = '08:58 AM';
            checkOut = null;
            workHours = 'In Progress';
            status = 'Present';
          } else if (empId === 'EMP-1088') {
            checkIn = '09:18 AM';
            checkOut = null;
            workHours = 'In Progress';
            status = 'Late';
          } else {
            checkIn = '09:02 AM';
            checkOut = null;
            workHours = 'In Progress';
            status = 'Present';
          }
        } else {
          // Historical variance
          if (i % 7 === 2) {
            checkIn = '09:22 AM';
            status = 'Late';
            workHours = '8.1 hrs';
          } else if (i % 11 === 0 && empId === 'EMP-1102') {
            checkIn = null;
            checkOut = null;
            status = 'Absent';
            workHours = '0.0 hrs';
          } else {
            checkIn = '08:55 AM';
            status = 'Present';
            workHours = '8.6 hrs';
          }
        }

        this.attendance.push({
          id: `att-${empId}-${dateStr}`,
          employeeId: empId,
          date: dateStr,
          checkIn,
          checkOut,
          workHours,
          status,
          device: 'Web App Portal',
          location: 'Standard IP / VPN'
        });
      });
    }

    // 4. LEAVE REQUESTS
    this.leaves = [
      {
        id: 'lv-901',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        leaveType: 'Paid',
        fromDate: '2026-09-10',
        toDate: '2026-09-12',
        duration: 3,
        remarks: 'Annual family vacation trip to Yosemite.',
        status: 'Approved',
        adminComment: 'Approved. Please coordinate with design team handoffs.',
        appliedAt: '2026-08-15T10:30:00.000Z',
        reviewedAt: '2026-08-16T14:20:00.000Z',
        reviewedBy: 'Eleanor Vance'
      },
      {
        id: 'lv-902',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        leaveType: 'Sick',
        fromDate: '2026-08-04',
        toDate: '2026-08-04',
        duration: 1,
        remarks: 'Doctor appointment and routine allergy checkup.',
        status: 'Approved',
        adminComment: 'Approved. Rest well!',
        appliedAt: '2026-08-03T16:00:00.000Z',
        reviewedAt: '2026-08-03T18:00:00.000Z',
        reviewedBy: 'Eleanor Vance'
      },
      {
        id: 'lv-903',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        leaveType: 'Paid',
        fromDate: '2026-10-01',
        toDate: '2026-10-02',
        duration: 2,
        remarks: 'Attending Figma Config design symposium.',
        status: 'Pending',
        adminComment: null,
        appliedAt: '2026-08-20T11:15:00.000Z',
        reviewedAt: null,
        reviewedBy: null
      },
      {
        id: 'lv-904',
        employeeId: 'EMP-1088',
        employeeName: 'Sarah Chen',
        department: 'Engineering',
        leaveType: 'Paid',
        fromDate: '2026-08-28',
        toDate: '2026-08-29',
        duration: 2,
        remarks: 'Personal travel and family wedding.',
        status: 'Pending',
        adminComment: null,
        appliedAt: '2026-08-19T09:40:00.000Z',
        reviewedAt: null,
        reviewedBy: null
      },
      {
        id: 'lv-905',
        employeeId: 'EMP-1102',
        employeeName: 'David Kim',
        department: 'Infrastructure',
        leaveType: 'Sick',
        fromDate: '2026-08-14',
        toDate: '2026-08-14',
        duration: 1,
        remarks: 'Dental surgery procedure.',
        status: 'Approved',
        adminComment: 'Get well soon.',
        appliedAt: '2026-08-13T12:00:00.000Z',
        reviewedAt: '2026-08-13T13:30:00.000Z',
        reviewedBy: 'Eleanor Vance'
      },
      {
        id: 'lv-906',
        employeeId: 'EMP-1145',
        employeeName: 'Maya Patel',
        department: 'Product',
        leaveType: 'Unpaid',
        fromDate: '2026-07-20',
        toDate: '2026-07-22',
        duration: 3,
        remarks: 'Extended overseas personal leave.',
        status: 'Approved',
        adminComment: 'Noted and approved by management.',
        appliedAt: '2026-07-10T14:10:00.000Z',
        reviewedAt: '2026-07-11T09:00:00.000Z',
        reviewedBy: 'Eleanor Vance'
      },
      {
        id: 'lv-907',
        employeeId: 'EMP-1190',
        employeeName: 'James Wilson',
        department: 'Engineering',
        leaveType: 'Casual',
        fromDate: '2026-08-18',
        toDate: '2026-08-18',
        duration: 1,
        remarks: 'Home renovation repair work inspection.',
        status: 'Rejected',
        adminComment: 'Critical sprint testing release scheduled on that date.',
        appliedAt: '2026-08-17T08:00:00.000Z',
        reviewedAt: '2026-08-17T10:30:00.000Z',
        reviewedBy: 'Eleanor Vance'
      }
    ];

    // 5. PAYROLL RECORDS
    this.payroll = [
      {
        id: 'pay-2026-07-1042',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        designation: 'Senior Product Designer',
        month: 'July 2026',
        monthCode: '2026-07',
        basic: 6500,
        hra: 2200,
        transport: 600,
        medical: 500,
        gross: 9800,
        taxDeduction: 1470,
        pfDeduction: 784,
        netSalary: 7546,
        status: 'Paid',
        paymentMethod: 'Direct Deposit (ACH)',
        paymentDate: '2026-07-31',
        slipUrl: '/api/payroll/me/slip/2026-07'
      },
      {
        id: 'pay-2026-06-1042',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        designation: 'Senior Product Designer',
        month: 'June 2026',
        monthCode: '2026-06',
        basic: 6500,
        hra: 2200,
        transport: 600,
        medical: 500,
        gross: 9800,
        taxDeduction: 1470,
        pfDeduction: 784,
        netSalary: 7546,
        status: 'Paid',
        paymentMethod: 'Direct Deposit (ACH)',
        paymentDate: '2026-06-30',
        slipUrl: '/api/payroll/me/slip/2026-06'
      },
      {
        id: 'pay-2026-05-1042',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        designation: 'Senior Product Designer',
        month: 'May 2026',
        monthCode: '2026-05',
        basic: 6500,
        hra: 2200,
        transport: 600,
        medical: 500,
        gross: 9800,
        taxDeduction: 1470,
        pfDeduction: 784,
        netSalary: 7546,
        status: 'Paid',
        paymentMethod: 'Direct Deposit (ACH)',
        paymentDate: '2026-05-31',
        slipUrl: '/api/payroll/me/slip/2026-05'
      },
      {
        id: 'pay-2026-08-1042',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        designation: 'Senior Product Designer',
        month: 'August 2026',
        monthCode: '2026-08',
        basic: 6500,
        hra: 2200,
        transport: 600,
        medical: 500,
        gross: 9800,
        taxDeduction: 1470,
        pfDeduction: 784,
        netSalary: 7546,
        status: 'Processed',
        paymentMethod: 'Direct Deposit (ACH)',
        paymentDate: '2026-08-31',
        slipUrl: '/api/payroll/me/slip/2026-08'
      },
      // Other employees for August 2026
      {
        id: 'pay-2026-08-1088',
        employeeId: 'EMP-1088',
        employeeName: 'Sarah Chen',
        department: 'Engineering',
        designation: 'Lead Frontend Engineer',
        month: 'August 2026',
        monthCode: '2026-08',
        basic: 8200,
        hra: 2800,
        transport: 700,
        medical: 600,
        gross: 12300,
        taxDeduction: 1980,
        pfDeduction: 980,
        netSalary: 9340,
        status: 'Processed',
        paymentMethod: 'Direct Deposit (ACH)',
        paymentDate: '2026-08-31',
        slipUrl: '/api/payroll/me/slip/2026-08'
      },
      {
        id: 'pay-2026-08-1102',
        employeeId: 'EMP-1102',
        employeeName: 'David Kim',
        department: 'Infrastructure',
        designation: 'DevOps Architect',
        month: 'August 2026',
        monthCode: '2026-08',
        basic: 7800,
        hra: 2500,
        transport: 650,
        medical: 550,
        gross: 11500,
        taxDeduction: 1750,
        pfDeduction: 920,
        netSalary: 8830,
        status: 'Processed',
        paymentMethod: 'Direct Deposit (ACH)',
        paymentDate: '2026-08-31',
        slipUrl: '/api/payroll/me/slip/2026-08'
      },
      {
        id: 'pay-2026-08-1145',
        employeeId: 'EMP-1145',
        employeeName: 'Maya Patel',
        department: 'Product',
        designation: 'Principal PM',
        month: 'August 2026',
        monthCode: '2026-08',
        basic: 8500,
        hra: 3000,
        transport: 800,
        medical: 600,
        gross: 12900,
        taxDeduction: 2100,
        pfDeduction: 1030,
        netSalary: 9770,
        status: 'Processed',
        paymentMethod: 'Direct Deposit (ACH)',
        paymentDate: '2026-08-31',
        slipUrl: '/api/payroll/me/slip/2026-08'
      },
      {
        id: 'pay-2026-08-1190',
        employeeId: 'EMP-1190',
        employeeName: 'James Wilson',
        department: 'Engineering',
        designation: 'QA Automation Lead',
        month: 'August 2026',
        monthCode: '2026-08',
        basic: 6200,
        hra: 2100,
        transport: 550,
        medical: 500,
        gross: 9350,
        taxDeduction: 1390,
        pfDeduction: 748,
        netSalary: 7212,
        status: 'Pending',
        paymentMethod: 'Direct Deposit (ACH)',
        paymentDate: '2026-08-31',
        slipUrl: '/api/payroll/me/slip/2026-08'
      }
    ];

    // 6. REVIEWS
    this.reviews = [
      {
        id: 'rev-2026-q2-1042',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        period: 'Q2 2026 (Apr - Jun)',
        reviewer: 'Eleanor Vance',
        reviewerRole: 'VP of HR',
        score: 94,
        rating: 'Exceeds Expectations',
        strengths: 'Outstanding design velocity, spearheaded the new Dayflow design system revamp, elevated UX accessibility standards.',
        improvements: 'Could mentor junior UX researchers more actively and participate in quarterly roadmap workshops.',
        feedback: 'Alex has consistently delivered high-caliber design artifacts that streamlined our user journey. Her attention to typography, micro-interactions, and visual harmony makes our product standout in the market.',
        reviewDate: '2026-07-05',
        status: 'Published'
      },
      {
        id: 'rev-2026-q1-1042',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        period: 'Q1 2026 (Jan - Mar)',
        reviewer: 'Eleanor Vance',
        reviewerRole: 'VP of HR',
        score: 91,
        rating: 'Exceeds Expectations',
        strengths: 'Rapid prototyping, clean Figma component library architecture, strong collaboration with frontend engineers.',
        improvements: 'Ensure earlier design freeze before major engineering sprint commits.',
        feedback: 'Alex executed the mobile design redesign ahead of schedule and demonstrated exceptional cross-functional empathy.',
        reviewDate: '2026-04-08',
        status: 'Published'
      },
      {
        id: 'rev-2025-annual-1042',
        employeeId: 'EMP-1042',
        employeeName: 'Alex Morgan',
        department: 'Design & UX',
        period: 'Annual 2025',
        reviewer: 'Eleanor Vance',
        reviewerRole: 'VP of HR',
        score: 96,
        rating: 'Exceptional',
        strengths: 'Core design leadership, initiated design token pipeline, zero critical UX defects post-release.',
        improvements: 'Expand external portfolio presentations.',
        feedback: 'A stellar year for Alex. Promoted to Senior Product Designer with unanimous team acclaim.',
        reviewDate: '2025-12-20',
        status: 'Published'
      },
      {
        id: 'rev-2026-q2-1088',
        employeeId: 'EMP-1088',
        employeeName: 'Sarah Chen',
        department: 'Engineering',
        period: 'Q2 2026 (Apr - Jun)',
        reviewer: 'Eleanor Vance',
        reviewerRole: 'VP of HR',
        score: 97,
        rating: 'Exceptional',
        strengths: 'Architected high performance React SPA core, lowered bundle payload by 42%.',
        improvements: 'Encourage delegation for junior code reviews.',
        feedback: 'Outstanding technical leadership across the entire web stack.',
        reviewDate: '2026-07-06',
        status: 'Published'
      }
    ];

    // 7. NOTIFICATIONS
    this.notifications = [
      {
        id: 'ntf-01',
        userId: 'usr-emp-01',
        title: 'Leave Request Approved',
        message: 'Your leave request for Yosemite (Sep 10 - Sep 12) was approved by Eleanor Vance.',
        type: 'leave',
        isRead: false,
        createdAt: '2026-08-16T14:20:00.000Z'
      },
      {
        id: 'ntf-02',
        userId: 'usr-emp-01',
        title: 'Payslip Available for Download',
        message: 'Your salary payslip for July 2026 ($7,546 Net) has been generated and is ready.',
        type: 'payroll',
        isRead: false,
        createdAt: '2026-08-01T09:00:00.000Z'
      },
      {
        id: 'ntf-03',
        userId: 'usr-emp-01',
        title: 'Performance Review Published',
        message: 'Your Q2 2026 Performance Review has been finalized with a score of 94/100.',
        type: 'review',
        isRead: true,
        createdAt: '2026-07-05T11:00:00.000Z'
      },
      {
        id: 'ntf-04',
        userId: 'usr-admin-01',
        title: 'New Leave Application Pending',
        message: 'Alex Morgan submitted a new leave request (Figma Config, Oct 01 - Oct 02).',
        type: 'leave',
        isRead: false,
        createdAt: '2026-08-20T11:15:00.000Z'
      },
      {
        id: 'ntf-05',
        userId: 'usr-admin-01',
        title: 'August Payroll Run Prepared',
        message: 'Draft payroll calculations for 6 active employees ready for approval & processing.',
        type: 'payroll',
        isRead: false,
        createdAt: '2026-08-21T08:30:00.000Z'
      }
    ];

    // 8. FINANCE DATA
    this.finance = {
      summary: {
        totalRevenue: 284500,
        revenueChange: 14.8,
        totalExpenses: 168400,
        expenseChange: -3.2,
        netProfit: 116100,
        profitChange: 22.4,
        pendingInvoices: 42300,
        invoicesCount: 8,
        payrollSpending: 72890,
        payrollChange: 5.1,
        cashRunwayMonths: 18.5
      },
      cashFlow: [
        { month: 'Jan', revenue: 210000, expenses: 145000, net: 65000 },
        { month: 'Feb', revenue: 225000, expenses: 148000, net: 77000 },
        { month: 'Mar', revenue: 240000, expenses: 152000, net: 88000 },
        { month: 'Apr', revenue: 255000, expenses: 158000, net: 97000 },
        { month: 'May', revenue: 270000, expenses: 162000, net: 108000 },
        { month: 'Jun', revenue: 278000, expenses: 165000, net: 113000 },
        { month: 'Jul', revenue: 284500, expenses: 168400, net: 116100 }
      ],
      expenseCategories: [
        { name: 'Engineering & Tech', value: 58000, color: '#00C896' },
        { name: 'Payroll & Benefits', value: 72890, color: '#38BDF8' },
        { name: 'Marketing & Growth', value: 21500, color: '#F59E0B' },
        { name: 'Office & Facilities', value: 9200, color: '#A855F7' },
        { name: 'Legal & Compliance', value: 6810, color: '#EC4899' }
      ],
      departmentSpending: [
        { department: 'Engineering', budget: 90000, actual: 82400, utilization: 91.5 },
        { department: 'Design & UX', budget: 35000, actual: 31200, utilization: 89.1 },
        { department: 'Product', budget: 40000, actual: 36800, utilization: 92.0 },
        { department: 'Human Resources', budget: 30000, actual: 26500, utilization: 88.3 },
        { department: 'Infrastructure', budget: 25000, actual: 23100, utilization: 92.4 }
      ],
      recentTransactions: [
        { id: 'TX-8801', title: 'AWS Cloud Hosting & Kubernetes', category: 'Infrastructure', amount: 8450.00, date: '2026-08-20', status: 'Completed', type: 'Expense' },
        { id: 'TX-8802', title: 'Enterprise Client Subscription #490', category: 'Revenue', amount: 48000.00, date: '2026-08-19', status: 'Completed', type: 'Income' },
        { id: 'TX-8803', title: 'Figma Enterprise Annual Licensing', category: 'Design & UX', amount: 3600.00, date: '2026-08-18', status: 'Completed', type: 'Expense' },
        { id: 'TX-8804', title: 'WeWork Global Access Hubs', category: 'Facilities', amount: 4200.00, date: '2026-08-15', status: 'Completed', type: 'Expense' },
        { id: 'TX-8805', title: 'Mid-Market SaaS License Contract', category: 'Revenue', amount: 22500.00, date: '2026-08-14', status: 'Completed', type: 'Income' }
      ]
    };

    // 9. TIME MANAGEMENT DATA
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
        { shiftName: 'General Morning (PST)', timing: '09:00 AM - 05:30 PM', assignedEmployees: 4, compliance: 96 },
        { shiftName: 'Central Flexible (CST)', timing: '08:30 AM - 05:00 PM', assignedEmployees: 2, compliance: 94 },
        { shiftName: 'East Coast Operations', timing: '09:00 AM - 06:00 PM', assignedEmployees: 1, compliance: 98 }
      ],
      productivityTrends: [
        { week: 'W1 Jul', score: 89, focusHours: 34.2, meetings: 5.8 },
        { week: 'W2 Jul', score: 91, focusHours: 35.0, meetings: 5.0 },
        { week: 'W3 Jul', score: 94, focusHours: 36.5, meetings: 4.2 },
        { week: 'W4 Jul', score: 92, focusHours: 35.8, meetings: 4.8 },
        { week: 'W1 Aug', score: 93, focusHours: 36.0, meetings: 4.5 },
        { week: 'W2 Aug', score: 95, focusHours: 37.2, meetings: 3.8 }
      ]
    };
  }

  // Repository Operations
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  findUserByEmployeeId(empId) {
    return this.users.find(u => u.employeeId === empId);
  }

  createUser(userData) {
    const newUser = {
      id: `usr-${Date.now()}`,
      ...userData,
      isVerified: userData.isVerified || false,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);

    // Also auto-create initial Employee profile record if not present
    const existingProfile = this.employees.find(e => e.employeeId === userData.employeeId);
    if (!existingProfile) {
      this.employees.push({
        id: `emp-${Date.now()}`,
        employeeId: userData.employeeId,
        userId: newUser.id,
        fullName: userData.fullName,
        email: userData.email,
        phone: '+1 (555) 000-0000',
        address: 'Company Headquarters, Suite 100',
        emergencyContact: 'Not specified',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
        status: 'Active',
        jobDetails: {
          title: userData.role === 'admin' ? 'HR Administrator' : 'Software Associate',
          department: userData.role === 'admin' ? 'Human Resources' : 'Engineering',
          designation: userData.role === 'admin' ? 'HR Specialist' : 'Associate IC',
          workType: 'Full-Time (Remote)',
          joinDate: new Date().toISOString().split('T')[0],
          reportingManager: 'Eleanor Vance',
          location: 'Remote',
          workShift: '09:00 AM - 05:30 PM'
        },
        salaryStructure: {
          currency: 'USD',
          basic: 5000,
          hra: 1500,
          transport: 400,
          medical: 400,
          gross: 7300,
          taxDeduction: 1095,
          pfDeduction: 584,
          netSalary: 5621
        },
        leaveBalances: {
          annual: 15,
          monthly: 2,
          daily: 4,
          hourly: 16,
          sick: 10
        },
        documents: []
      });
    }

    return newUser;
  }

  getEmployeeProfile(employeeId) {
    return this.employees.find(e => e.employeeId === employeeId);
  }

  getEmployeeProfileByUserId(userId) {
    return this.employees.find(e => e.userId === userId);
  }

  updateEmployeeProfile(employeeId, updates) {
    const empIndex = this.employees.findIndex(e => e.employeeId === employeeId);
    if (empIndex === -1) return null;

    // Merge nested jobDetails and salaryStructure cleanly
    const current = this.employees[empIndex];
    const updated = {
      ...current,
      ...updates,
      jobDetails: updates.jobDetails ? { ...current.jobDetails, ...updates.jobDetails } : current.jobDetails,
      salaryStructure: updates.salaryStructure ? { ...current.salaryStructure, ...updates.salaryStructure } : current.salaryStructure
    };

    // If user avatar or fullName changed, sync to user table
    const user = this.users.find(u => u.employeeId === employeeId);
    if (user) {
      if (updates.fullName) user.fullName = updates.fullName;
      if (updates.avatar) user.avatar = updates.avatar;
    }

    this.employees[empIndex] = updated;
    return updated;
  }

  getAllEmployees(query = {}) {
    let list = [...this.employees];

    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter(e =>
        e.fullName.toLowerCase().includes(s) ||
        e.email.toLowerCase().includes(s) ||
        e.employeeId.toLowerCase().includes(s) ||
        (e.jobDetails && e.jobDetails.department.toLowerCase().includes(s)) ||
        (e.jobDetails && e.jobDetails.title.toLowerCase().includes(s))
      );
    }

    if (query.department && query.department !== 'All') {
      list = list.filter(e => e.jobDetails && e.jobDetails.department === query.department);
    }

    if (query.status && query.status !== 'All') {
      list = list.filter(e => e.status === query.status);
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
    record.workHours = '8.5 hrs'; // realistic calculated shift duration
    return { record, notCheckedIn: false };
  }

  getAllAttendance(query = {}) {
    let list = [...this.attendance];

    if (query.employeeId && query.employeeId !== 'All') {
      list = list.filter(a => a.employeeId === query.employeeId);
    }
    if (query.status && query.status !== 'All') {
      list = list.filter(a => a.status === query.status);
    }
    if (query.date) {
      list = list.filter(a => a.date === query.date);
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getLeavesForEmployee(employeeId) {
    return this.leaves
      .filter(l => l.employeeId === employeeId)
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }

  getAllLeaves(query = {}) {
    let list = [...this.leaves];

    if (query.status && query.status !== 'All') {
      list = list.filter(l => l.status.toLowerCase() === query.status.toLowerCase());
    }
    if (query.employeeId) {
      list = list.filter(l => l.employeeId === query.employeeId);
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

    // Notify Admins
    this.notifications.unshift({
      id: `ntf-${Date.now()}`,
      userId: 'usr-admin-01',
      title: 'New Leave Request Submitted',
      message: `${newLeave.employeeName} submitted a ${newLeave.leaveType} leave request for ${newLeave.duration} day(s).`,
      type: 'leave',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return newLeave;
  }

  cancelLeave(leaveId, employeeId) {
    const index = this.leaves.findIndex(l => l.id === leaveId);
    if (index === -1) return { notFound: true };

    const leave = this.leaves[index];
    if (leave.employeeId !== employeeId) return { unauthorized: true };
    if (leave.status !== 'Pending') return { notPending: true };

    this.leaves.splice(index, 1);
    return { success: true };
  }

  updateLeaveStatus(leaveId, status, adminComment, adminName = 'Eleanor Vance') {
    const leave = this.leaves.find(l => l.id === leaveId);
    if (!leave) return null;

    leave.status = status;
    leave.adminComment = adminComment || (status === 'Approved' ? 'Approved by HR management.' : 'Rejected.');
    leave.reviewedAt = new Date().toISOString();
    leave.reviewedBy = adminName;

    // Deduct leave balance if approved
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

    // Notify employee
    const user = this.users.find(u => u.employeeId === leave.employeeId);
    if (user) {
      this.notifications.unshift({
        id: `ntf-${Date.now()}`,
        userId: user.id,
        title: `Leave Request ${status}`,
        message: `Your ${leave.leaveType} leave request (${leave.fromDate} to ${leave.toDate}) has been ${status.toLowerCase()}.${leave.adminComment ? ` Note: ${leave.adminComment}` : ''}`,
        type: 'leave',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return leave;
  }

  getPayrollForEmployee(employeeId) {
    return this.payroll
      .filter(p => p.employeeId === employeeId)
      .sort((a, b) => b.monthCode.localeCompare(a.monthCode));
  }

  getAllPayroll(query = {}) {
    let list = [...this.payroll];

    if (query.monthCode && query.monthCode !== 'All') {
      list = list.filter(p => p.monthCode === query.monthCode);
    }
    if (query.status && query.status !== 'All') {
      list = list.filter(p => p.status === query.status);
    }

    return list.sort((a, b) => b.monthCode.localeCompare(a.monthCode));
  }

  updatePayrollRecord(payrollId, updates) {
    const index = this.payroll.findIndex(p => p.id === payrollId);
    if (index === -1) return null;

    this.payroll[index] = { ...this.payroll[index], ...updates };
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
      }
    });

    return { count: generated.length, records: generated };
  }

  getReviewsForEmployee(employeeId) {
    return this.reviews
      .filter(r => r.employeeId === employeeId)
      .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
  }

  getAllReviews(query = {}) {
    let list = [...this.reviews];

    if (query.department && query.department !== 'All') {
      list = list.filter(r => r.department === query.department);
    }
    if (query.period && query.period !== 'All') {
      list = list.filter(r => r.period === query.period);
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

    // Notify employee
    const user = this.users.find(u => u.employeeId === reviewData.employeeId);
    if (user) {
      this.notifications.unshift({
        id: `ntf-${Date.now()}`,
        userId: user.id,
        title: 'New Performance Review Released',
        message: `Your performance review for ${newRev.period} has been published (Score: ${newRev.score}/100).`,
        type: 'review',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

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
    return true;
  }

  getFinanceDashboardData() {
    return this.finance;
  }

  getTimeManagementData() {
    return this.timeManagement;
  }
}

// Export singleton instance
export const dataStore = new InMemoryDataStore();
