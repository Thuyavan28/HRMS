# 🌟 Dayflow — Human Resource Management System (HRMS)

> *"Every workday, perfectly aligned."*

Dayflow is a modern, dark-themed, enterprise-grade HR Management System built with a pixel-perfect design. It features a complete dual-portal architecture for **Employees** and **HR Administrators**, powered by real-time REST API endpoints, JWT authentication with HTTP-only cookies, role-based access control (RBAC), and interactive telemetry charts.

---

## ✨ Features Overview

### 👤 Employee Self-Service Portal
- **Interactive Dashboard**: Real-time greeting, live punch clock widget (Check-in/Check-out), attendance KPI summary, 5 leave quota balance cards, upcoming schedule, and real-time activity feed.
- **My Profile**: Editable personal details and avatar (`PATCH /api/employee/profile`), with locked job details, salary structure, and verified documents.
- **My Attendance**: Daily clock-in/out tracking with toggleable **Weekly Table View** and **Monthly Calendar Grid View**.
- **Leave Requests**: Dynamic leave application form with auto-calculated calendar duration, leave quota badges, history table, and cancellation for pending requests.
- **My Payroll & Payslips**: Itemized salary breakdown (Basic, HRA, Transport, Medical, Gross, Tax, PF, Net) and one-click PDF Payslip download via `PDFKit`.
- **Performance Reviews**: Radial performance gauge, historical appraisal scores, and expandable manager feedback.
- **Notifications Center**: Real-time alerts, unread badges, filter by category, and "Mark All Read" action.

### 🛡️ HR Administrator Portal
- **Admin Dashboard**: Workforce KPI cards (Total Employees, Payrolls, Turnover Rate, Job Applicants), radial Employee Satisfaction Gauge, Team KPI Line Chart, Employment Status Bar Chart, and Recent Employee directory.
- **Employee Directory & Management**: Searchable and filterable employee table, Add New Employee modal, and status toggling (Active / Deactivated).
- **Administrative Profile Editor**: Full editing access to all fields (Job Details, Grade, Compensation, Deductions, Documents).
- **Attendance Management**: Company-wide punch register, filters by employee/date/status, and weekly punch intensity heatmap.
- **Leave Management**: Filterable leave request tabs (All / Pending / Approved / Rejected) with inline Approve / Reject dialogs and custom manager remarks.
- **Payroll Management & Bulk Run**: Monthly compensation ledger, salary structure adjustment modal, "Mark as Processed" action, and automated bulk payslip batch generation engine with live progress logs.
- **Finance Analytics**: Cash Flow area chart, Expense Allocation donut chart, department budget utilization tracking, and ledger transactions.
- **Time Management Dashboard**: Heatmap telemetry, active shift schedule rosters, overtime distribution, and live check-in/out feed.
- **Appraisal Management**: Company-wide performance review register and "Add Performance Review" modal.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Recharts, Lucide Icons, Axios, React Router v7
- **Backend**: Node.js, Express.js (REST API), JWT, Bcrypt.js, Helmet.js, Express Validator, Express Rate Limit, Cookie Parser, Morgan, PDFKit
- **Security**: JWT Access Tokens (15 min) + Refresh Tokens (7 days) in HTTP-only cookies, Bcrypt password hashing (12 salt rounds), strict RBAC guards on both frontend and backend, rate limiting on auth routes.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### 2. Installation

Clone the repository and install all dependencies:

```bash
# Clone repository
git clone https://github.com/Thuyavan28/HRMS.git
cd HRMS

# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Environment Configuration

The backend comes pre-configured with a `.env` file in the `/server` directory. You can adjust the configuration if needed:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=dayflow_super_secret_jwt_access_token_key_2026_!@#
JWT_REFRESH_SECRET=dayflow_super_secret_jwt_refresh_token_key_2026_$%^
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false
```

### 4. Running the Application

Run both the backend REST API server and the frontend client concurrently with a single command:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Accounts

For immediate testing, quick-login demo buttons are available on the Sign In page, or you can use these credentials:

| Role | Email | Password |
|---|---|---|
| **HR Administrator** | `admin@dayflow.com` | `Admin@1234` |
| **Employee** | `alex.morgan@dayflow.com` | `Employee@1234` |

---

## 📁 Repository Structure

```
├── client/                     # Vite + React + Tailwind Frontend
│   ├── src/
│   │   ├── components/         # Common UI, layout, charts (Recharts)
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Employee and HR Admin portal pages
│   │   ├── services/           # Axios API modules with auto-refresh interceptors
│   │   └── utils/
│   ├── tailwind.config.js      # Custom Dayflow dark navy & teal design tokens
│   └── package.json
│
├── server/                     # Node.js + Express REST API Backend
│   ├── controllers/            # Business logic controllers
│   ├── middleware/             # Auth, RBAC, validator, rate-limiting, error handler
│   ├── models/ & repositories/ # DB-agnostic data store with enterprise seed data
│   ├── routes/                 # Express API routes
│   ├── utils/                  # Token helpers, PDF payslip generator
│   └── server.js               # Main Express entry point
│
├── .gitignore
├── README.md
└── package.json                # Root concurrent scripts
```

---

## 📄 License

This project is licensed under the MIT License.
