import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percent' | 'fixed';
  value: number; // percent 0-100 or fixed amount
  minOrder?: number;
  maxDiscount?: number; // cap when percent
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number; // total usage allowed
  perUserLimit?: number; // usage per user/email
  active: boolean;
  usedCount: number;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, min: 0 },
  maxDiscount: { type: Number, min: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  usageLimit: { type: Number, min: 0 },
  perUserLimit: { type: Number, min: 0 },
  active: { type: Boolean, default: true },
  usedCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
