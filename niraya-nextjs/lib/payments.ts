import { apiPost } from './api';

export async function createRazorpayOrder(amount: number, receipt?: string): Promise<{ key: string; order: any }> {
  return apiPost('/payments/razorpay/order', { amount, receipt });
}

export async function verifyRazorpaySignature(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean }> {
  return apiPost('/payments/razorpay/verify', payload);
}

export async function loadRazorpayCheckout(): Promise<void> {
  if (typeof window === 'undefined') return;
  if ((window as any).Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(s);
  });
}
