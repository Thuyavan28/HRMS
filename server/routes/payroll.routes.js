import express from 'express';
import { getMyPayroll, downloadPayslip } from '../controllers/payroll.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/me', getMyPayroll);
router.get('/me/slip/:month', downloadPayslip);

export default router;
