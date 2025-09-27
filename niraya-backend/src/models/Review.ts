import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  productId: Types.ObjectId;
  userId?: Types.ObjectId;
  name?: string;
  email?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  reply?: string;
}

const ReviewSchema = new Schema<IReview>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  reply: { type: String },
}, { timestamps: true });

ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ email: 1, createdAt: -1 });

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
