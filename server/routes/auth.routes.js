import express from 'express';
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  logout,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
