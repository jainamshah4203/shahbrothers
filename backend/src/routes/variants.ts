import { Router } from 'express';
import { adminRequired } from '../middleware/auth';
import { listVariants, createVariant, updateVariant, deleteVariant, getVariantById } from '../controllers/variantController';

const router = Router();

// Admin-protected CRUD for variants
router.get('/', adminRequired as any, listVariants as any);
router.get('/:id', adminRequired as any, getVariantById as any);
router.post('/', adminRequired as any, createVariant as any);
router.put('/:id', adminRequired as any, updateVariant as any);
router.delete('/:id', adminRequired as any, deleteVariant as any);

export default router;
