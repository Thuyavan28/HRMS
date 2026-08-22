import express from 'express';
import {
  validateInvitation,
  activateAccount,
  register,
  login,
  refresh,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { loginValidationRules, activateValidationRules } from '../middleware/validation.middleware.js';

const router = express.Router();

// Invitation & Activation
router.get('/invitation/validate', validateInvitation);
router.post('/activate', authRateLimiter, activateValidationRules, activateAccount);

// Authentication
router.post('/login', authRateLimiter, loginValidationRules, login);
router.post('/register', authRateLimiter, activateValidationRules, register); // BUG 3 FIX: Added validation
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);
router.post('/verify-email', verifyEmail);

// Password Reset (MISSING 1)
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);

export default router;
