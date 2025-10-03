import { Router } from 'express';
import { adminRequired } from '../middleware/auth';
import { listCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';

const router = Router();

router.get('/', adminRequired as any, listCategories as any);
router.get('/:id', adminRequired as any, getCategoryById as any);
router.post('/', adminRequired as any, createCategory as any);
router.put('/:id', adminRequired as any, updateCategory as any);
router.delete('/:id', adminRequired as any, deleteCategory as any);

export default router;
