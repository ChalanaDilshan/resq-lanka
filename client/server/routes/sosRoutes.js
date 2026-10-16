import express from 'express';
import {
  createSOS,
  getAllSOS,
  getSOSById,
  updateSOSStatus,
} from '../controllers/sosController.js';
import {
  authenticate,
  requireRole,
  optionalAuth,
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public emergency reporting and live feed
router.route('/')
  .post(optionalAuth, createSOS)
  .get(optionalAuth, getAllSOS);

// Individual incident report
router.route('/:id')
  .get(optionalAuth, getSOSById);

// Responders / Admins status update
router.route('/:id/status')
  .patch(
    authenticate,
    requireRole('administrator', 'coordinator', 'volunteer'),
    updateSOSStatus
  );

export default router;