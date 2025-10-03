import { Router } from 'express';
import { adminRequired } from '../middleware/auth';
import { listCoupons, createCoupon, getCoupon, updateCoupon, deleteCoupon, validateCoupon, exportCoupons, importCoupons, getCouponAnalytics } from '../controllers/couponsController';

const router = Router();

router.get('/', adminRequired as any, listCoupons as any);
router.post('/', adminRequired as any, createCoupon as any);
router.get('/export', adminRequired as any, exportCoupons as any);
router.post('/import', adminRequired as any, importCoupons as any);
router.get('/analytics', adminRequired as any, getCouponAnalytics as any);
router.get('/:id', adminRequired as any, getCoupon as any);
router.put('/:id', adminRequired as any, updateCoupon as any);
router.delete('/:id', adminRequired as any, deleteCoupon as any);
router.post('/validate', validateCoupon as any);

export default router;
