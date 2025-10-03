import { Router } from 'express';
import { adminRequired } from '../middleware/auth';
import { getAdminStats } from '../controllers/adminController';

const router = Router();

router.get('/stats', adminRequired as any, getAdminStats as any);

export default router;
