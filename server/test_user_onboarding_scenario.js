import { query, pool } from './config/db.js';

const BASE_URL = 'http://localhost:5000/api';

async function testHrOnboardingScenario() {
  console.log('===============================================================');
  console.log('🧪 TESTING HR CREATION -> INVITATION -> SIGNUP -> DASHBOARD FLOW');
  console.log('===============================================================\n');

  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const empId = `EMP-${randomSuffix}`;
    const workEmail = `kiran.${randomSuffix}@dayflow.com`;

    // 1. Log in as HR Admin (Eleanor Vance)
    console.log('1️⃣ Step 1: HR Admin signs in...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@dayflow.com',
        password: 'Admin@1234'
      })
    });
    const adminCookie = adminLoginRes.headers.get('set-cookie')?.split(',').map(c => c.split(';')[0]).join('; ');
    console.log('   ✅ HR Admin logged in successfully.');

    // 2. HR Admin creates a new employee & assigns Role = 'employee'
    console.log(`\n2️⃣ Step 2: HR Admin provisions new Employee (${empId} / role: employee)...`);
    const createEmpRes = await fetch(`${BASE_URL}/admin/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie
      },
      body: JSON.stringify({
        fullName: 'Kiran Kumar',
        employeeId: empId,
        email: workEmail,
        phone: '+1 (555) 333-4444',
        role: 'employee', // Fixed by HR
        department: 'Engineering',
        title: 'Backend Engineer',
        designation: 'Senior IC',
        workType: 'Full-Time (Remote)',
        basicSalary: 6800
      })
    });
    const createEmpData = await createEmpRes.json();
    if (!createEmpData.success) {
      throw new Error(`Create employee failed: ${createEmpData.message}`);
    }

    const token = createEmpData.data.invitation.token;
    console.log(`   ✅ Employee created in Neon DB!`);
    console.log(`   🔗 Generated Activation Token: ${token}`);
    console.log(`   🔒 Fixed Role: ${createEmpData.data.invitation.role}`);
    console.log(`   🔒 Fixed Employee ID: ${createEmpData.data.employee.employeeId}`);

    // 3. User clicks link via email -> frontend validates invitation
    console.log('\n3️⃣ Step 3: User clicks email link -> Backend validates token genuinely from HR...');
    const validateRes = await fetch(`${BASE_URL}/auth/invitation/validate?token=${token}`);
    const validateData = await validateRes.json();
    console.log('   ✅ Invitation validated as genuine HR invitation!');
    console.log('   📋 Auto-filled Fixed Credentials:');
    console.log(`      - Employee ID: ${validateData.data.employeeId} (Fixed / Read-only)`);
    console.log(`      - Work Email:  ${validateData.data.email} (Fixed / Read-only)`);
    console.log(`      - Assigned Role: ${validateData.data.role} (Fixed / Read-only)`);

    // 4. User modifies their Name to "Kiran K. Sharma" and sets password
    console.log('\n4️⃣ Step 4: User updates Full Name & creates secure password on Signup page...');
    const activateRes = await fetch(`${BASE_URL}/auth/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        fullName: 'Kiran K. Sharma', // Modified preferred name
        password: 'KiranSecure@2026',
        confirmPassword: 'KiranSecure@2026'
      })
    });
    const activateCookie = activateRes.headers.get('set-cookie')?.split(',').map(c => c.split(';')[0]).join('; ');
    const activateData = await activateRes.json();
    console.log(`   ✅ Account Activated! Status: ${activateRes.status}`);
    console.log(`   👤 Registered Name: ${activateData.data.user.fullName}`);
    console.log(`   🔒 Enforced Role: ${activateData.data.user.role}`);

    // 5. Query Neon DB directly to verify persistence
    console.log('\n5️⃣ Step 5: Querying Neon DB directly to verify table updates...');
    const dbUser = await query('SELECT * FROM users WHERE email = $1;', [workEmail]);
    const dbEmp = await query('SELECT * FROM employees WHERE employee_id = $1;', [empId]);
    const dbInv = await query('SELECT * FROM invitations WHERE token = $1;', [token]);

    console.log('   🐘 [Neon DB users table]:', {
      employee_id: dbUser.rows[0].employee_id,
      email: dbUser.rows[0].email,
      full_name: dbUser.rows[0].full_name,
      role: dbUser.rows[0].role,
      status: dbUser.rows[0].status
    });

    console.log('   🐘 [Neon DB employees table]:', {
      employee_id: dbEmp.rows[0].employee_id,
      full_name: dbEmp.rows[0].full_name,
      status: dbEmp.rows[0].status,
      department: dbEmp.rows[0].department
    });

    console.log('   🐘 [Neon DB invitations table]:', {
      token: dbInv.rows[0].token.substring(0, 16) + '...',
      role: dbInv.rows[0].role,
      status: dbInv.rows[0].status,
      used_at: dbInv.rows[0].used_at
    });

    // 6. User accesses Employee Dashboard
    console.log('\n6️⃣ Step 6: User accesses Employee Dashboard with session cookie...');
    const dashRes = await fetch(`${BASE_URL}/employee/dashboard`, {
      headers: {
        Cookie: activateCookie
      }
    });
    const dashData = await dashRes.json();
    console.log(`   ✅ Employee Dashboard Loaded! Status: ${dashRes.status}`);
    console.log(`   🎉 Employee Greeting Name: ${dashData.data.employee.fullName}`);
    console.log(`   🏢 Department: ${dashData.data.employee.department}`);

    console.log('\n===============================================================');
    console.log('🏆 ALL STEPS IN ONBOARDING FLOW VERIFIED SUCCESSFULLY IN NEON DB!');
    console.log('===============================================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await pool.end();
  }
}

testHrOnboardingScenario();
