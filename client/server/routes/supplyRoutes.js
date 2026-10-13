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

const router = express.Router();

// Public & Coordinator Routes
router.get('/', getSupplyItems);
router.post('/', createSupplyItem);
router.get('/stats', getSupplyStats);

// Pledges
router.get('/pledges', getAllPledges);
router.post('/:id/pledge', makeDonorPledge);
router.patch('/pledges/:pledgeId/status', updatePledgeStatus);

// Item deletion
router.delete('/:id', deleteSupplyItem);

export default router;
