import express from 'express';
import { getMyAttendance, checkIn, checkOut, getTodayStatus } from '../controllers/attendance.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/me', getMyAttendance);
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/today', getTodayStatus);

export default router;
