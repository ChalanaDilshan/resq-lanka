import express from 'express';
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  logout,
} from '../controllers/auth.controller.js';
import {
  getVolunteers,
  updateVolunteerStatus,
  updateVolunteerReliability,
} from '../controllers/volunteerAdmin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getMe);

// Administrator / Coordinator Volunteer Vetting & Review Queue
router.get(
  '/volunteers',
  authenticate,
  requireRole('administrator', 'coordinator'),
  getVolunteers
);
router.patch(
  '/volunteers/:id/status',
  authenticate,
  requireRole('administrator', 'coordinator'),
  updateVolunteerStatus
);
router.patch(
  '/volunteers/:id/reliability',
  authenticate,
  requireRole('administrator', 'coordinator'),
  updateVolunteerReliability
);

export default router;
