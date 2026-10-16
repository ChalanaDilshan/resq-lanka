import express from 'express';
import {
  getAllShelters,
  getShelterStats,
  getShelterById,
  updateShelterOccupancyAndCapacity,
  createShelter,
  deleteShelter,
} from '../controllers/shelter.controller.js';

const router = express.Router();

import { authenticate, requireRole } from '../middleware/auth.middleware.js';

// Public Shelter Directory & Statistics
router.get('/', getAllShelters);
router.get('/stats', getShelterStats);
router.get('/:id', getShelterById);

// Administrator / Coordinator Management Endpoints
router.patch(
  '/:id/occupancy',
  authenticate,
  requireRole('administrator', 'coordinator'),
  updateShelterOccupancyAndCapacity
);
router.put(
  '/:id',
  authenticate,
  requireRole('administrator', 'coordinator'),
  updateShelterOccupancyAndCapacity
);
router.post(
  '/',
  authenticate,
  requireRole('administrator', 'coordinator'),
  createShelter
);
router.delete(
  '/:id',
  authenticate,
  requireRole('administrator', 'coordinator'),
  deleteShelter
);

export default router;
