
import express from 'express';
import {
  getSupplyItems,
  createSupplyItem,
  makeDonorPledge,
  getAllPledges,
  updatePledgeStatus,
  deleteSupplyItem,
  getSupplyStats,
} from '../controllers/supplyController.js';

import {
  authenticate,
  requireRole,
  optionalAuth,
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public & Browsing Routes
router.get('/', getSupplyItems);
router.get('/stats', getSupplyStats);

// Coordinator / Administrator Management
router.post(
  '/',
  authenticate,
  requireRole('administrator', 'coordinator'),
  createSupplyItem
);

// Pledges
router.get('/pledges', optionalAuth, getAllPledges);
router.post('/:id/pledge', makeDonorPledge);

router.patch(
  '/pledges/:pledgeId/status',
  authenticate,
  requireRole('administrator', 'coordinator'),
  updatePledgeStatus
);

// Item deletion
router.delete(
  '/:id',
  authenticate,
  requireRole('administrator', 'coordinator'),
  deleteSupplyItem
);

export default router;
