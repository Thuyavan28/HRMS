import express from 'express';
import { getMyReviews } from '../controllers/review.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/me', getMyReviews);

export default router;
