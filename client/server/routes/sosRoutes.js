import express from 'express';
import { createSOS, getAllSOS, updateSOSStatus } from '../controllers/sosController.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public emergency reporting and live feed
router.route('/')
  .post(optionalAuth, createSOS)
  .get(getAllSOS);

// Responders / Admins status update
router.route('/:id/status')
  .patch(authenticate, requireRole('administrator', 'coordinator', 'volunteer'), updateSOSStatus);

export default router;