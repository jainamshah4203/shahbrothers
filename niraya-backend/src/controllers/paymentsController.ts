import type { Request, Response } from 'express';
import crypto from 'crypto';

// Lazy require to avoid type issues if @types not installed
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }
  return new Razorpay({ key_id, key_secret });
}

export async function createRazorpayOrder(req: Request, res: Response) {
  try {
    const { amount, receipt } = req.body || {};
    // amount expected in rupees; convert to paise
    const amtRupees = Number(amount || 0);
    if (!amtRupees || amtRupees <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const amtPaise = Math.round(amtRupees * 100);

    const instance = getRazorpayInstance();
    const options = {
      amount: amtPaise,
      currency: 'INR',
      receipt: String(receipt || `rcpt_${Date.now()}`),
      payment_capture: 1,
    } as any;
    const order = await instance.orders.create(options);
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (e: any) {
    console.error('createRazorpayOrder error', e);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
}

export async function verifyRazorpaySignature(req: Request, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing verification fields' });
    }
    const keySecret = process.env.RAZORPAY_KEY_SECRET as string;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expected = hmac.digest('hex');
    const valid = expected === razorpay_signature;
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid signature' });
    res.json({ success: true });
  } catch (e: any) {
    console.error('verifyRazorpaySignature error', e);
    res.status(500).json({ message: 'Failed to verify Razorpay signature' });
  }
}
