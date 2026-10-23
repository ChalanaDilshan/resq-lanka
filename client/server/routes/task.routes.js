import express from 'express';
import {
  getAllTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  applyForTask,
  getMyApplications,
  getTaskApplications,
  reviewApplication,
  withdrawApplication,
} from '../controllers/task.controller.js';
import {
  authenticate,
  requireRole,
  optionalAuth,
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public & Browsing routes
router.get('/', getAllTasks);
router.get('/stats', getTaskStats);

// Volunteer Self-Service routes (must be placed before /:id parameter)
router.get('/my-applications', authenticate, getMyApplications);
router.patch('/applications/:applicationId/withdraw', authenticate, withdrawApplication);

// Administrator / Coordinator Review routes
router.patch(
  '/applications/:applicationId/review',
  authenticate,
  requireRole('administrator', 'coordinator'),
  reviewApplication
);

// Individual Task routes
router.get('/:id', optionalAuth, getTaskById);

router.post(
  '/',
  authenticate,
  requireRole('administrator', 'coordinator'),
  createTask
);

router.put(
  '/:id',
  authenticate,
  requireRole('administrator', 'coordinator'),
  updateTask
);

router.delete(
  '/:id',
  authenticate,
  requireRole('administrator', 'coordinator'),
  deleteTask
);

// Volunteer Application route
router.post('/:id/apply', authenticate, applyForTask);

// Administrator Roster view
router.get(
  '/:id/applications',
  authenticate,
  requireRole('administrator', 'coordinator'),
  getTaskApplications
);

export default router;
