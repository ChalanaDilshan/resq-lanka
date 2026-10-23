import express from 'express';
import {
  getAllNotices,
  getNoticeStats,
  getNoticeById,
  createNotice,
  updateNotice,
  verifyNoticeSource,
  withdrawNotice,
  deleteNotice,
} from '../controllers/notice.controller.js';
import {
  authenticate,
  requireRole,
  optionalAuth,
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public & Browsing routes
router.get('/', optionalAuth, getAllNotices);
router.get('/stats', getNoticeStats);

// Notice details
router.get('/:id', optionalAuth, getNoticeById);

// Creation route (Authenticated: Admins create & publish, Citizens create drafts)
router.post('/', authenticate, createNotice);

// Administrator / Coordinator Management routes
router.put(
  '/:id',
  authenticate,
  requireRole('administrator', 'coordinator'),
  updateNotice
);

router.patch(
  '/:id/verify',
  authenticate,
  requireRole('administrator', 'coordinator'),
  verifyNoticeSource
);

router.patch(
  '/:id/withdraw',
  authenticate,
  requireRole('administrator', 'coordinator'),
  withdrawNotice
);

router.delete(
  '/:id',
  authenticate,
  requireRole('administrator', 'coordinator'),
  deleteNotice
);

export default router;
