# Dayflow HRMS — Every workday, perfectly aligned.

Dayflow is a modern, full-stack Human Resource Management System (HRMS) designed to streamline employee management, time tracking, leave requests, payroll processing, and performance reviews. It features a stunning, premium UI and a robust Node.js backend.

---

## 🌟 Key Features

### Employee Portal
- **Dashboard**: Real-time widgets for attendance, leave balances, upcoming holidays, and recent payslips.
- **My Profile**: View official job details, personal information, and locked (HR-managed) salary structures.
- **My Attendance**: Check in/out with precise duration tracking and historical logs.
- **Leave Requests**: Submit, track, and manage leave requests (Paid, Sick, Casual, Unpaid, Maternity/Paternity).
- **My Payroll**: View salary breakdowns and download payslips.
- **My Reviews**: View published performance reviews and self-assessments.
- **Notifications**: Real-time alerts for leave approvals, payroll runs, and reviews.

### HR Admin Portal
- **Admin Dashboard**: High-level KPIs, recent activities, and organizational overview.
- **Employee Management**: Invite new employees (secure email flow), edit profiles, manage salary structures, adjust leave quotas, and handle terminations.
- **Attendance Management**: View company-wide attendance logs and fix incorrect punches.
- **Leave Management**: Approve or reject leave requests with comments.
- **Payroll Management & Run**: Bulk process payroll, generate slips, and manage salary adjustments.
- **Finance Dashboard**: Track department budgets (in INR ₹), organizational spending, and income vs. expenses.
- **Time Management**: Live check-in feed and daily attendance KPIs.
- **Performance Reviews**: Create, edit, and publish performance evaluations.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State/Context**: Context API (AuthContext, ToastContext)

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Serverless) + `pg` connection pool
- **Architecture**: Hybrid in-memory DataStore (for quick reads/prototyping) with async database persistence.
- **Authentication**: JWT (JSON Web Tokens) in secure `httpOnly` cookies.
- **Validation**: Express-Validator with `.escape()` for XSS sanitization.
- **Security**: Helmet, CORS, CSRF tokens, Rate Limiting.
- **Emails**: Nodemailer (SMTP).
- **PDF Generation**: PDFKit (Payslip generation).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Neon, Supabase, or local)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/dayflow-hrms.git
cd dayflow-hrms
```

### 2. Backend Setup
Navigate to the server directory, install dependencies, and configure environment variables.
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Database configuration (Neon Postgres recommended)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Email configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Dayflow HR" <your_email@gmail.com>
```

Start the backend server (This will automatically run DB migrations and sync data):
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies.
```bash
cd client
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🔒 Security Best Practices Implemented
- **XSS Protection**: All user inputs (addresses, remarks, feedback) are sanitized using `express-validator` `.escape()`.
- **CSRF Protection**: Critical mutation endpoints validate a custom `X-CSRF-Token` header.
- **Authentication**: Tokens are stored securely in `httpOnly` cookies, mitigating local storage extraction risks.
- **Password Policies**: Enforced minimum length, uppercase, numbers, and special characters.
- **Token Expiry**: Password reset tokens expire in 1 hour; access tokens expire in 15 minutes (with 7-day refresh).

---

## 📚 Database Schema (PostgreSQL)
The application relies on several core tables:
- `users`: Core authentication, roles (Admin/Employee), and password hashes.
- `employees`: Job details, emergency contacts, reporting lines.
- `invitations`: Secure onboarding tokens for new hires.
- `salary_structures`: Base pay, allowances, deductions.
- `leave_balances`: Entitlements per leave category.
- `leave_requests`: Employee requests and admin approvals.
- `attendance`: Daily punch-in/out logs.
- `payslips`: Generated monthly payroll records.
- `performance_reviews`: Manager evaluations and scores.
- `password_reset_tokens`: Secure temporary tokens for forgotten passwords.

*(Note: The DB schema automatically initializes and seeds itself upon server startup via `server/database/initDb.js`)*

---

## 🤝 Contribution Guidelines
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
*Built for the modern workforce.*
