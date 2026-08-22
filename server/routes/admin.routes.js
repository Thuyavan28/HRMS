import express from 'express';
import {
  getAdminDashboard,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  getInvitations,
  resendInvitation,
  revokeInvitation,
  getAdminAttendance,
  getAdminLeaves,
  approveLeave,
  rejectLeave,
  getAdminPayroll,
  updatePayroll,
  runBulkPayroll,
  getFinanceDashboard,
  getTimeManagementDashboard,
  getAdminReviews,
  createAdminReview
} from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { reviewCreateValidationRules } from '../middleware/validation.middleware.js';

const router = express.Router();

// Strict RBAC: All endpoints require valid JWT and 'admin' role
router.use(authenticateToken);
router.use(requireRole('admin'));

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Employees & Invitations
router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.get('/employees/:id', getEmployeeById);
router.patch('/employees/:id', updateEmployee);
router.patch('/employees/:id/status', toggleEmployeeStatus);

// Invitations Management
router.get('/invitations', getInvitations);
router.post('/invitations/:id/resend', resendInvitation);
router.delete('/invitations/:id', revokeInvitation);

// Attendance
router.get('/attendance', getAdminAttendance);

// Leaves
router.get('/leaves', getAdminLeaves);
router.patch('/leave/:id/approve', approveLeave);
router.patch('/leave/:id/reject', rejectLeave);

// Payroll
router.get('/payroll', getAdminPayroll);
router.patch('/payroll/:id', updatePayroll);
router.post('/payroll/run', runBulkPayroll);

// Finance & Time Analytics
router.get('/finance', getFinanceDashboard);
router.get('/timemanagement', getTimeManagementDashboard);

// Reviews
router.get('/reviews', getAdminReviews);
router.post('/reviews', reviewCreateValidationRules, createAdminReview);

export default router;
