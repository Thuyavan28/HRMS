import express from 'express';
import { getMyLeaves, applyLeave, cancelLeave } from '../controllers/leave.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { leaveApplyValidationRules } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/me', getMyLeaves);
router.post('/apply', leaveApplyValidationRules, applyLeave);
router.delete('/:id', cancelLeave);

export default router;
