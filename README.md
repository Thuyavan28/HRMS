# 🌟 Dayflow HRMS (Human Resource Management System)

> **"Every workday, perfectly aligned."**

Dayflow is a modern, comprehensive, and highly aesthetic Human Resource Management System (HRMS) designed to streamline employee onboarding, attendance tracking, payroll management, and overall HR operations. Built with a robust full-stack architecture, Dayflow ensures security, scalability, and an intuitive user experience.

---

## 🚀 Key Features & Working Flow

### 1. 🔐 Secure & Exclusive Onboarding
Dayflow enforces a strict invitation-only onboarding process to maintain enterprise security.
- **HR Action:** The HR Admin logs into the portal and navigates to the Employee Management dashboard.
- **Invitation Creation:** The admin creates a new employee profile (Name, Role, and Email) and generates an Employee ID.
- **Email Delivery:** The system automatically sends a secure, tokenized invitation link to the new employee's email address using a configured SMTP server.
- **Employee Activation:** The employee clicks the link, which redirects them to a secure signup page. Here, their details are pre-filled (read-only), and they only need to set their secure password to activate their account.

### 2. 👥 Employee Management Dashboard
- **Directory:** View all active and deactivated employees in a clean, searchable, and filterable table.
- **Lifecycle Management:** Edit employee details, manage roles, or securely deactivate/delete employees (cascading deletes for associated records like payroll and attendance).
- **Auto ID Generation:** Smart logic to auto-generate unique `EMP-XXX` IDs avoiding database conflicts.

### 3. 🕒 Time & Attendance Tracking
- Employees can log their daily attendance.
- HR can monitor check-ins, check-outs, and overall hours worked through the Time Management Dashboard.

### 4. 💰 Payroll & Finance
- **Automated Payroll Runs:** HR can generate payroll for employees based on attendance and roles.
- **PDF Payslips:** Employees can view and download pixel-perfect, professionally formatted PDF payslips directly from their portal.
- **Finance Overview:** Visual charts (using modern visualization libraries) to track company expenses, cash flow, and salary distributions.

### 5. 🏖️ Leave Management
- Employees can request time off via their dashboard.
- HR receives real-time notifications and can approve or reject leave requests.

---

## 🛠️ Technology Stack

**Frontend:**
- **React.js (Vite):** Lightning-fast development environment and optimized production builds.
- **Tailwind CSS / Vanilla CSS:** Custom, highly aesthetic UI with glassmorphism, dynamic hover effects, and modern styling.
- **React Router:** For seamless single-page application (SPA) navigation.

**Backend:**
- **Node.js & Express.js:** Scalable and robust REST API architecture.
- **Nodemailer:** Handles all outgoing SMTP email communications (Invitations, Password Resets).
- **PDFKit:** Generates high-quality, perfectly aligned PDF documents (Payslips).
- **JWT (JSON Web Tokens):** Secure, HTTP-only cookie-based authentication.

**Database:**
- **PostgreSQL (Neon DB):** Cloud-native, serverless PostgreSQL for reliable and fast data storage.
- **pg-pool:** Efficient database connection pooling.

---

## ⚙️ Environment Configuration

To run this project locally, you need to configure the following environment variables in your `server/.env` file:

```env
# Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@endpoint.aws.neon.tech/dbname?sslmode=require

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false

# Gmail SMTP (For Email Invitations)
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_16_character_app_password
```
*(Note: You **must** use a Google App Password for `SMTP_PASS`, not your regular Gmail login password).*

---

## 💻 Installation & Setup

Follow these steps to get the system running locally from start to finish:

### 1. Clone & Install Dependencies
Open two separate terminal windows for the frontend and backend.

**Terminal 1 (Backend):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
```

### 2. Run the Application

**Terminal 1 (Backend):**
```bash
cd server
node server.js
# Or use nodemon for development: npm run dev
```
*Expected Output: `✅ [Neon DB] Database initialized and synchronized successfully!` and `🚀 [Dayflow Server] REST API listening on http://localhost:5000`*

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
*Expected Output: Your Vite server will start on `http://localhost:5173`.*

---

## 🔒 Security Best Practices Implemented
1. **No Manual Signups:** Prevents unauthorized users from creating accounts.
2. **HTTP-Only Cookies:** Protects JWT tokens from Cross-Site Scripting (XSS) attacks.
3. **Cascading Database Deletions:** Ensures no orphaned data is left behind when an employee is removed.
4. **Environment Isolation:** Sensitive SMTP and Database credentials are strictly kept out of source code.

---
*Built with passion for modern HR Management.*
