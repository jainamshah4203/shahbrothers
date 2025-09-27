import { Router } from 'express';
import { optionalAuth, adminRequired } from '../middleware/auth';
// Use require with any to avoid TS named export typing issues if the controller is not fully typed yet
// eslint-disable-next-line @typescript-eslint/no-var-requires
const oc: any = require('../controllers/orderController');

const router = Router();

// Create order (requires logged-in user for userId, but also accepts guest email)
router.post('/', optionalAuth as any, oc.createOrder as any);

// Current user's orders (multiple aliases used by frontend)
router.get('/my-orders', optionalAuth as any, oc.getMyOrders as any);
router.get('/my', optionalAuth as any, oc.getMyOrders as any);
router.get('/my-orders/:id', optionalAuth as any, oc.getOrderById as any);

// Public: list orders by email (guest order lookup)
router.get('/by-email', oc.listByEmail as any);

// Track / fetch specific order
router.get('/track/:id', oc.trackOrder as any);
router.get('/:id', optionalAuth as any, oc.getOrderById as any);
// Invoice PDF
router.get('/:id/invoice.pdf', optionalAuth as any, oc.generateInvoicePdf as any);

// Pay an existing order (mark as Paid) after successful Razorpay payment
router.patch('/:id/pay', optionalAuth as any, oc.markOrderPaid as any);

// Admin list
router.get('/', adminRequired as any, oc.listOrders as any);
router.delete('/:id', adminRequired as any, oc.deleteOrder as any);
router.put('/:id/status', adminRequired as any, oc.updateOrderStatus as any);

export default router;
