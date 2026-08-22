import { query, pool } from './config/db.js';
import bcrypt from 'bcryptjs';

async function migrate() {
  console.log('🇮🇳 Running India migration on existing Neon DB data...');

  // Update user full names
  const nameMap = [
    ['EMP-001',  'Ananya Krishnan'],
    ['EMP-1042', 'Arjun Sharma'],
    ['EMP-1088', 'Sneha Iyer'],
    ['EMP-1102', 'Rohit Nair'],
    ['EMP-1145', 'Meera Patel'],
    ['EMP-1190', 'Vikram Reddy'],
    ['EMP-1205', 'Divya Menon'],
    ['EMP-1050', 'Priya Sharma'],
  ];
  for (const [eid, name] of nameMap) {
    await query('UPDATE users SET full_name = $1 WHERE employee_id = $2;', [name, eid]);
    await query('UPDATE employees SET full_name = $1 WHERE employee_id = $2;', [name, eid]);
  }
  console.log('✅ Names updated to Indian names');

  // Update employee phone numbers, addresses, emergency contacts, locations, shifts
  const empUpdates = [
    ['EMP-001',  '+91 98400 12345', 'No. 12, Boat Club Road, Alwarpet, Chennai, Tamil Nadu - 600018', 'Ramesh Krishnan (+91 98411 56789)', 'Chennai HQ', '09:00 AM - 06:00 PM (IST)'],
    ['EMP-1042', '+91 99400 87654', '4th Floor, Prestige Shantiniketan, Whitefield, Bengaluru, Karnataka - 560048', 'Priya Sharma (+91 99401 23456)', 'Remote - Bengaluru', '09:00 AM - 05:30 PM (IST)'],
    ['EMP-1088', '+91 98200 34567', 'Flat 302, Hiranandani Gardens, Powai, Mumbai, Maharashtra - 400076', 'Suresh Iyer (+91 98201 78901)', 'Mumbai Hub', '09:30 AM - 06:00 PM (IST)'],
    ['EMP-1102', '+91 97400 56789', 'Plot 78, Jubilee Hills, Hyderabad, Telangana - 500033', 'Kavitha Nair (+91 97401 90123)', 'Hyderabad Hub', '08:30 AM - 05:00 PM (IST)'],
    ['EMP-1145', '+91 96500 23456', 'B-12, Bodakdev, Ahmedabad, Gujarat - 380054', 'Devraj Patel (+91 96501 67890)', 'Ahmedabad Office', '09:00 AM - 06:00 PM (IST)'],
    ['EMP-1190', '+91 98300 45678', 'H.No 23-45, Madhapur, Hyderabad, Telangana - 500081', 'Lakshmi Reddy (+91 98301 89012)', 'Hyderabad Hub', '09:00 AM - 05:30 PM (IST)'],
    ['EMP-1205', '+91 94400 67890', 'TC 11/1234, Kowdiar, Thiruvananthapuram, Kerala - 695003', 'Sunil Menon (+91 94401 23456)', 'Thiruvananthapuram Hub', '09:00 AM - 05:30 PM (IST)'],
    ['EMP-1050', '+91 99200 11223', 'Flat 501, DLF Phase 3, Gurugram, Haryana - 122002', 'Amit Sharma (+91 99201 44556)', 'Remote - Gurugram', '09:00 AM - 05:30 PM (IST)'],
  ];
  for (const [eid, phone, address, ec, loc, shift] of empUpdates) {
    await query(`UPDATE employees SET phone=$1, address=$2, emergency_contact=$3, location=$4, work_shift=$5 WHERE employee_id=$6;`,
      [phone, address, ec, loc, shift, eid]);
  }
  console.log('✅ Employee details updated to Indian format');

  // Update salary structures to INR
  const salaries = [
    ['EMP-001',  'INR', 180000, 72000, 12000, 8000,  272000, 54400, 21600, 196000],
    ['EMP-1042', 'INR',  95000, 38000,  8000, 5000,  146000, 29200, 11400, 105400],
    ['EMP-1088', 'INR', 120000, 48000, 10000, 6000,  184000, 36800, 14400, 132800],
    ['EMP-1102', 'INR', 110000, 44000,  9000, 6000,  169000, 33800, 13200, 122000],
    ['EMP-1145', 'INR', 125000, 50000, 10000, 7000,  192000, 38400, 15000, 138600],
    ['EMP-1190', 'INR',  90000, 36000,  7000, 5000,  138000, 27600, 10800,  99600],
    ['EMP-1205', 'INR',  85000, 34000,  6500, 5000,  130500, 26100, 10200,  94200],
    ['EMP-1050', 'INR',  90000, 36000,  7000, 5000,  138000, 27600, 10800,  99600],
  ];
  for (const [eid, curr, basic, hra, trans, med, gross, tax, pf, net] of salaries) {
    await query(`
      INSERT INTO salary_structures (employee_id, currency, basic, hra, transport, medical, gross, tax_deduction, pf_deduction, net_salary)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (employee_id) DO UPDATE SET
        currency=$2, basic=$3, hra=$4, transport=$5, medical=$6,
        gross=$7, tax_deduction=$8, pf_deduction=$9, net_salary=$10, updated_at=NOW();
    `, [eid, curr, basic, hra, trans, med, gross, tax, pf, net]);
  }
  console.log('✅ Salary structures converted to INR');

  // Update payroll records to INR
  await query(`
    UPDATE payroll SET
      basic=95000, hra=38000, transport=8000, medical=5000,
      gross=146000, tax_deduction=29200, pf_deduction=11400, net_salary=105400,
      payment_method='NEFT / Direct Credit',
      employee_name='Arjun Sharma'
    WHERE employee_id='EMP-1042';
  `);
  await query(`UPDATE payroll SET employee_name='Sneha Iyer',  basic=120000, hra=48000, transport=10000, medical=6000, gross=184000, tax_deduction=36800, pf_deduction=14400, net_salary=132800, payment_method='NEFT / Direct Credit' WHERE employee_id='EMP-1088';`);
  await query(`UPDATE payroll SET employee_name='Rohit Nair',  basic=110000, hra=44000, transport=9000,  medical=6000, gross=169000, tax_deduction=33800, pf_deduction=13200, net_salary=122000, payment_method='NEFT / Direct Credit' WHERE employee_id='EMP-1102';`);
  console.log('✅ Payroll records converted to INR');

  // Update reporting managers in employees
  await query(`UPDATE employees SET reporting_manager='Ananya Krishnan' WHERE reporting_manager='Eleanor Vance';`);
  await query(`UPDATE employees SET reporting_manager='Arjun Sharma'   WHERE reporting_manager='Alex Morgan';`);
  await query(`UPDATE employees SET reporting_manager='Vikram Reddy'   WHERE reporting_manager IN ('Marcus Brody', 'Sarah Chen');`);
  await query(`UPDATE employees SET reporting_manager='Sneha Iyer'     WHERE reporting_manager='Sarah Chen';`);
  await query(`UPDATE employees SET reporting_manager='Ananya Krishnan' WHERE reporting_manager='Eleanor Vance (HR Admin)';`);
  console.log('✅ Reporting managers updated');

  // Update leaves employee names
  await query(`UPDATE leaves SET employee_name='Arjun Sharma', admin_comment='Approved. Please coordinate with design team handoffs.' WHERE employee_id='EMP-1042' AND admin_comment IS NOT NULL AND status='Approved' AND duration=3;`);
  await query(`UPDATE leaves SET employee_name='Arjun Sharma' WHERE employee_id='EMP-1042';`);
  await query(`UPDATE leaves SET reviewed_by='Ananya Krishnan' WHERE reviewed_by='Eleanor Vance';`);
  console.log('✅ Leave records updated to Indian names');

  // Update finance summary to INR
  const fsCheck = await query('SELECT COUNT(*) as count FROM finance_summary;');
  if (parseInt(fsCheck.rows[0].count) > 0) {
    await query(`
      UPDATE finance_summary SET
        total_revenue=23700000, revenue_change=14.80,
        total_expenses=14030000, expense_change=-3.20,
        net_profit=9670000, profit_change=22.40,
        pending_invoices=3525000, invoices_count=8,
        payroll_spending=6070000, payroll_change=5.10,
        cash_runway_months=18.5, updated_at=NOW();
    `);
    await query(`
      UPDATE cash_flow SET
        revenue = CASE month
          WHEN 'Jan' THEN 17500000 WHEN 'Feb' THEN 18750000 WHEN 'Mar' THEN 20000000
          WHEN 'Apr' THEN 21250000 WHEN 'May' THEN 22500000 WHEN 'Jun' THEN 23170000
          WHEN 'Jul' THEN 23700000 ELSE revenue END,
        expenses = CASE month
          WHEN 'Jan' THEN 12090000 WHEN 'Feb' THEN 12340000 WHEN 'Mar' THEN 12670000
          WHEN 'Apr' THEN 13170000 WHEN 'May' THEN 13500000 WHEN 'Jun' THEN 13750000
          WHEN 'Jul' THEN 14030000 ELSE expenses END,
        net = CASE month
          WHEN 'Jan' THEN 5410000 WHEN 'Feb' THEN 6410000 WHEN 'Mar' THEN 7330000
          WHEN 'Apr' THEN 8080000 WHEN 'May' THEN 9000000 WHEN 'Jun' THEN 9420000
          WHEN 'Jul' THEN 9670000 ELSE net END;
    `);
    await query(`
      UPDATE expense_categories SET value = CASE name
        WHEN 'Engineering & Tech'  THEN 4830000
        WHEN 'Payroll & Benefits'  THEN 6070000
        WHEN 'Marketing & Growth'  THEN 1792000
        WHEN 'Office & Facilities' THEN  767000
        WHEN 'Legal & Compliance'  THEN  567000
        ELSE value END;
    `);
    await query(`
      UPDATE department_spending SET
        budget = CASE department
          WHEN 'Engineering'     THEN 7500000 WHEN 'Design & UX' THEN 2920000
          WHEN 'Product'         THEN 3330000 WHEN 'Human Resources' THEN 2500000
          WHEN 'Infrastructure'  THEN 2080000 ELSE budget END,
        actual = CASE department
          WHEN 'Engineering'     THEN 6866000 WHEN 'Design & UX' THEN 2600000
          WHEN 'Product'         THEN 3067000 WHEN 'Human Resources' THEN 2209000
          WHEN 'Infrastructure'  THEN 1925000 ELSE actual END;
    `);
    await query(`
      UPDATE ledger_transactions SET
        title = CASE transaction_code
          WHEN 'TX-8802' THEN 'Enterprise SaaS Subscription (TCS)'
          WHEN 'TX-8804' THEN 'NEFT Payroll Disbursement Batch'
          ELSE title END,
        amount = CASE transaction_code
          WHEN 'TX-8801' THEN  704000
          WHEN 'TX-8802' THEN 2850000
          WHEN 'TX-8803' THEN  350000
          WHEN 'TX-8804' THEN 6070000
          ELSE amount END;
    `);
    console.log('✅ Finance data converted to INR');
  }

  // Update shift schedules
  await query(`UPDATE shift_schedules SET shift_name='General Shift (IST)'   WHERE shift_name LIKE '%PST%' OR shift_name LIKE '%Morning%';`);
  await query(`UPDATE shift_schedules SET shift_name='Flexible Shift (IST)'  WHERE shift_name LIKE '%CST%' OR shift_name LIKE '%Flexible%';`);
  await query(`UPDATE shift_schedules SET shift_name='Executive Shift (IST)' WHERE shift_name LIKE '%EST%' OR shift_name LIKE '%Executive%';`);
  console.log('✅ Shift schedules updated to IST');

  // Update invitations created_by
  await query(`UPDATE invitations SET created_by='Ananya Krishnan (HR Admin)' WHERE created_by LIKE '%Eleanor%';`);

  console.log('\n🎉 Migration complete! All data is now in Indian format (INR + Indian cities + +91 phones + IST).');
  await pool.end();
}

migrate().catch(e => { console.error(e); process.exit(1); });
