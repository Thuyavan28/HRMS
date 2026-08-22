import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyProfile } from './pages/employee/MyProfile';
import { MyAttendance } from './pages/employee/MyAttendance';
import { LeaveRequests } from './pages/employee/LeaveRequests';
import { MyPayroll } from './pages/employee/MyPayroll';
import { MyReviews } from './pages/employee/MyReviews';
import { NotificationsPage } from './pages/employee/NotificationsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { EmployeeDetailAdmin } from './pages/admin/EmployeeDetailAdmin';
import { AttendanceManagement } from './pages/admin/AttendanceManagement';
import { LeaveManagement } from './pages/admin/LeaveManagement';
import { PayrollManagement } from './pages/admin/PayrollManagement';
import { PayrollRun } from './pages/admin/PayrollRun';
import { FinanceDashboard } from './pages/admin/FinanceDashboard';
import { TimeManagementDashboard } from './pages/admin/TimeManagementDashboard';
import { AdminReviews } from './pages/admin/AdminReviews';

// Root redirect handler
const RootRedirect = () => {
  const { user, isAuthenticated, loading, role } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protected Employee Portal Routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRole="employee">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="attendance" element={<MyAttendance />} />
              <Route path="leaves" element={<LeaveRequests />} />
              <Route path="payroll" element={<MyPayroll />} />
              <Route path="reviews" element={<MyReviews />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Protected HR Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="employees/:id" element={<EmployeeDetailAdmin />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="leaves" element={<LeaveManagement />} />
              <Route path="payroll" element={<PayrollManagement />} />
              <Route path="payroll-run" element={<PayrollRun />} />
              <Route path="finance" element={<FinanceDashboard />} />
              <Route path="time-management" element={<TimeManagementDashboard />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
