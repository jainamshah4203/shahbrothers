import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVariant extends Document {
  productId: Types.ObjectId;
  sku?: string;
  color?: string;
  size?: string;
  mrp: number; // original price
  price: number; // selling price
  discountPercent?: number; // convenience cache
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, trim: true },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
    stock: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Variant = mongoose.models.Variant || mongoose.model<IVariant>('Variant', VariantSchema);
