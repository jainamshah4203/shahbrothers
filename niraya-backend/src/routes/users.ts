import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';
import { getUserOrders } from '../controllers/orderController';

const router = Router();

// Alias used by frontend to fetch current user's orders
router.get('/me/orders', optionalAuth as any, getUserOrders as any);

export default router;
