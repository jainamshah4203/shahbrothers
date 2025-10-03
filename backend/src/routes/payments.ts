import { Router } from 'express';
import { body } from 'express-validator';
import { createRazorpayOrder, verifyRazorpaySignature } from '../controllers/paymentsController';

const router = Router();

router.post(
  '/razorpay/order',
  [body('amount').isFloat({ gt: 0 })],
  createRazorpayOrder as any
);

router.post(
  '/razorpay/verify',
  [
    body('razorpay_order_id').isString().notEmpty(),
    body('razorpay_payment_id').isString().notEmpty(),
    body('razorpay_signature').isString().notEmpty(),
  ],
  verifyRazorpaySignature as any
);

export default router;
