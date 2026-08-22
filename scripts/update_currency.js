const fs = require('fs');
const path = require('path');

const files = [
  'client/src/pages/employee/MyProfile.jsx',
  'client/src/pages/employee/MyPayroll.jsx',
  'client/src/pages/admin/PayrollRun.jsx',
  'client/src/pages/admin/PayrollManagement.jsx',
  'client/src/pages/admin/FinanceDashboard.jsx',
  'client/src/pages/admin/EmployeeDetailAdmin.jsx',
  'client/src/pages/admin/AdminDashboard.jsx',
  'client/src/components/charts/ExpensePieChart.jsx',
  'client/src/components/charts/CashFlowAreaChart.jsx'
];

const baseDir = 'c:/Users/thuya/OneDrive/Desktop/app1';

for (const rel of files) {
  const fp = path.join(baseDir, rel);
  if (!fs.existsSync(fp)) { console.log('MISSING:', fp); continue; }
  let src = fs.readFileSync(fp, 'utf8');
  const orig = src;

  // Replace all $ with ₹ (but only those that look like dollar amounts in template literals or JSX)
  // Pattern: ${...} USD  →  ₹${...}
  src = src.replace(/\$\{([^}]+)\} USD/g, '₹${$1}');
  // Pattern: ${ USD (standalone)
  src = src.replace(/ USD\b/g, '');
  // Pattern: Monthly Earnings (USD) → Monthly Earnings (INR)
  src = src.replace(/Monthly Earnings \(USD\)/g, 'Monthly Earnings (INR)');
  src = src.replace(/Statutory Deductions \(USD\)/g, 'Statutory Deductions (INR)');
  // Pattern: value={`$${...}`} → value={`₹${...}`}
  src = src.replace(/value=\{`\$\$\{/g, 'value={`₹${');
  // Pattern: `$${xxx}` → `₹${xxx}`
  src = src.replace(/`\$\$\{/g, '`₹${');
  // Pattern: +${...}  (+ prefix before dollar in JSX string context)
  src = src.replace(/'\+\$\{/g, "'+₹${");
  src = src.replace(/"-\$\{/g, '"-₹${');
  // Direct Deposit (ACH) → NEFT / Direct Credit
  src = src.replace(/Direct Deposit \(ACH\)/g, 'NEFT / Direct Credit');
  // Timezone: (PST), (CST), (EST) → (IST)
  src = src.replace(/\(PST\)/g, '(IST)');
  src = src.replace(/\(CST\)/g, '(IST)');
  src = src.replace(/\(EST\)/g, '(IST)');

  if (src !== orig) {
    fs.writeFileSync(fp, src);
    console.log('Updated:', rel);
  } else {
    console.log('No change:', rel);
  }
}
console.log('Done.');
