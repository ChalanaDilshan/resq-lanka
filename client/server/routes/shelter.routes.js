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

// Public Shelter Directory & Statistics
router.get('/', getAllShelters);
router.get('/stats', getShelterStats);
router.get('/:id', getShelterById);

// Coordinator Endpoints: Update Occupancy & Capacity
router.patch('/:id/occupancy', updateShelterOccupancyAndCapacity);
router.put('/:id', updateShelterOccupancyAndCapacity);

// Coordinator/Admin Management
router.post('/', createShelter);
router.delete('/:id', deleteShelter);

export default router;
