import { Router } from 'express';
import { getUploadSignature } from '../controllers/mediaController';
import { adminRequired } from '../middleware/auth';

const router = Router();

// Admin: get Cloudinary upload signature
router.post('/sign', adminRequired as any, getUploadSignature as any);

export default router;
