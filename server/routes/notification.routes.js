import express from 'express';
import { getMyNotifications, markAsRead, markAllRead } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/me', getMyNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);

export default router;
