import { Router } from 'express';
import { adminRequired } from '../middleware/auth';
import { listReviews, approveReview, rejectReview, replyReview, deleteReview, bulkAction } from '../controllers/reviewsController';

const router = Router();

router.get('/', adminRequired as any, listReviews as any);
router.post('/bulk', adminRequired as any, bulkAction as any);
router.post('/:id/approve', adminRequired as any, approveReview as any);
router.post('/:id/reject', adminRequired as any, rejectReview as any);
router.post('/:id/reply', adminRequired as any, replyReview as any);
router.delete('/:id', adminRequired as any, deleteReview as any);

export default router;
