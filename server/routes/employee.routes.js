import express from 'express';
import { getEmployeeDashboard, getEmployeeProfile, updateEmployeeProfile } from '../controllers/employee.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { profileUpdateValidationRules } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('employee', 'admin'));

router.get('/dashboard', getEmployeeDashboard);
router.get('/profile', getEmployeeProfile);
router.patch('/profile', profileUpdateValidationRules, updateEmployeeProfile);

export default router;
