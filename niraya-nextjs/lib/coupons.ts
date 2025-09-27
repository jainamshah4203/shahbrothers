export interface CouponValidationResponse {
  valid: boolean;
  message?: string;
  discount?: number;
  finalTotal?: number;
  coupon?: {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    minOrder?: number;
    maxDiscount?: number;
    startDate?: string | null;
    endDate?: string | null;
    usageLimit?: number;
    perUserLimit?: number;
    active: boolean;
  };
}

export async function validateCoupon(code: string, cartTotal: number, userId?: string, email?: string): Promise<CouponValidationResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  try {
    const response = await fetch(`${apiUrl}/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code.toUpperCase().trim(),
        cartTotal,
        userId,
        email,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        valid: false,
        message: data.message || 'Invalid coupon',
      };
    }

    return data;
  } catch (error) {
    console.error('Coupon validation error:', error);
    return {
      valid: false,
      message: 'Failed to validate coupon. Please try again.',
    };
  }
}
