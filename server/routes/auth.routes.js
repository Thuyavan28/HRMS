import express from 'express';
import { register, login, refresh, logout, getMe, verifyEmail } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { registerValidationRules, loginValidationRules } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', authRateLimiter, registerValidationRules, register);
router.post('/login', authRateLimiter, loginValidationRules, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);
router.post('/verify-email', verifyEmail);

export default router;
