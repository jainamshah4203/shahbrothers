import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICouponUsage extends Document {
  couponId: Types.ObjectId;
  couponCode: string; // denormalized for easier queries
  userId?: Types.ObjectId;
  email?: string; // for guest users
  orderId: Types.ObjectId;
  usedAt: Date;
  orderTotal: number;
  discountAmount: number;
}

const CouponUsageSchema = new Schema<ICouponUsage>({
  couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true, index: true },
  couponCode: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  email: { type: String, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  usedAt: { type: Date, default: Date.now, index: true },
  orderTotal: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, required: true, min: 0 },
}, { timestamps: true });

// Compound indexes for efficient queries
CouponUsageSchema.index({ couponId: 1, userId: 1 });
CouponUsageSchema.index({ couponId: 1, email: 1 });
CouponUsageSchema.index({ couponCode: 1, usedAt: -1 });

export const CouponUsage = mongoose.models.CouponUsage || mongoose.model<ICouponUsage>('CouponUsage', CouponUsageSchema);
