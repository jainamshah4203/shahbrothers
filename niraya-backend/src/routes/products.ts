import { Router } from 'express';
import {
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
} from '../controllers/productController';
import { adminRequired, optionalAuth } from '../middleware/auth';
import { listApprovedForProduct, createForProduct } from '../controllers/reviewsController';
import { body, param } from 'express-validator';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
// Public reviews endpoints for products
router.get('/:id/reviews', listApprovedForProduct as any);
router.post('/:id/reviews', optionalAuth as any, createForProduct as any);

// Admin routes - create/update/delete products
router.post(
  '/',
  adminRequired as any,
  [
    body('name').isString().trim().notEmpty(),
    body('slug').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty(),
    body('price').isNumeric(),
    body('category').isString().trim().notEmpty(),
    body('sizes').isArray().optional({ nullable: true }),
    body('colors').isArray().optional({ nullable: true }),
    body('images').isArray().optional({ nullable: true }),
    body('stock').isNumeric().optional({ nullable: true }),
  ],
  createProduct as any
);

router.put(
  '/:id',
  adminRequired as any,
  [
    param('id').isString().trim().notEmpty(),
    body('name').isString().optional(),
    body('slug').isString().optional(),
    body('description').isString().optional(),
    body('price').isNumeric().optional(),
    body('salePrice').isNumeric().optional({ nullable: true }),
    body('category').isString().optional(),
    body('sizes').isArray().optional({ nullable: true }),
    body('colors').isArray().optional({ nullable: true }),
    body('images').isArray().optional({ nullable: true }),
    body('stock').isNumeric().optional({ nullable: true }),
    body('brand').isString().optional({ nullable: true }),
    body('material').isString().optional({ nullable: true }),
    body('careInstructions').isArray().optional({ nullable: true }),
  ],
  updateProduct as any
);

router.delete(
  '/:id',
  adminRequired as any,
  [param('id').isString().trim().notEmpty()],
  deleteProduct as any
);

// Bulk update product flags (admin)
router.post(
  '/bulk',
  adminRequired as any,
  [body('ids').isArray(), body('action').isString().trim().notEmpty()],
  bulkUpdateProducts as any
);

export default router;
