import express from 'express';
import { createSOS, getAllSOS, updateSOSStatus } from '../controllers/sosController.js';

const router = express.Router();

router.route('/')
  .post(createSOS)
  .get(getAllSOS);

router.route('/:id/status')
  .patch(updateSOSStatus);

export default router;