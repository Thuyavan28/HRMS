import bcrypt from 'bcryptjs';
import { query, pool } from './config/db.js';

async function sync() {
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const empHash = await bcrypt.hash('Employee@1234', 12);

  await query(`UPDATE users SET password_hash = $1, email = 'admin@dayflow.com' WHERE employee_id = 'EMP-001';`, [adminHash]);
  await query(`UPDATE users SET password_hash = $1, email = 'alex.morgan@dayflow.com' WHERE employee_id = 'EMP-1042';`, [empHash]);

  console.log('✅ Admin (admin@dayflow.com / EMP-001) & Alex Morgan (alex.morgan@dayflow.com / EMP-1042) passwords synced to Neon DB.');
  await pool.end();
}

sync();
