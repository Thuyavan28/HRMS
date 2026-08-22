import { query } from '../server/config/db.js';

async function run() {
  try {
    // 1. Ensure thuyavan (EMP-8097) is Active
    await query("UPDATE employees SET status = 'Active' WHERE employee_id = 'EMP-8097';");
    await query("UPDATE users SET status = 'ACTIVE' WHERE employee_id = 'EMP-8097';");

    // 2. Update existing attendance records where check_in > 10:30 AM to 'Late'
    await query("UPDATE attendance SET status = 'Late' WHERE check_in IN ('11:59 AM', '03:36 PM');");

    // 3. Check active employees count
    const emps = await query("SELECT employee_id, full_name, status FROM employees WHERE status = 'Active';");
    console.log('✅ Active employees in DB:', emps.rows.length);
    emps.rows.forEach(e => console.log(`  - [${e.employee_id}] ${e.full_name}`));

    // 4. Check attendance records
    const atts = await query("SELECT employee_id, date, check_in, check_out, status FROM attendance;");
    console.log('✅ Attendance records in DB:', atts.rows.length);
    atts.rows.forEach(a => console.log(`  - [${a.employee_id}] Date: ${a.date} | In: ${a.check_in} | Status: ${a.status}`));

    console.log('✅ Fix complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
