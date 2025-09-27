import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: { url: string; alt?: string }[];
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Knitwear' | 'Shoes' | 'Accessories';
  sizes: string[];
  colors: { name: string; hex?: string }[];
  stock: number;
  brand?: string;
  featured?: boolean;
  isNewProduct?: boolean;
  isBestseller?: boolean;
  limited?: boolean;
  material: string;
  careInstructions?: string[];
  heroIndex?: number;
  mainImageUrl?: string; // virtual
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    images: {
      type: [
        {
          url: { type: String, required: true },
          alt: { type: String },
        },
      ],
      default: [],
      validate: [(arr: any[]) => arr.length > 0, 'At least one image is required'],
    },
    heroIndex: { type: Number, min: 0, default: 0 },
    category: {
      type: String,
      enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Knitwear', 'Shoes', 'Accessories'],
      required: true,
      index: true,
    },
    sizes: { type: [String], required: true },
    colors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String },
        },
      ],
      required: true,
    },
    stock: { type: Number, required: true, min: 0 },
    brand: { type: String },
    featured: { type: Boolean, default: false },
    isNewProduct: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    limited: { type: Boolean, default: false },
    material: { type: String, required: true },
    careInstructions: { type: [String], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Virtual: mainImageUrl points to hero image url or first if not available
ProductSchema.virtual('mainImageUrl').get(function (this: IProduct) {
  try {
    const idx = Math.max(0, Math.min((this as any).heroIndex ?? 0, (this.images?.length || 1) - 1));
    const entry: any = this.images?.[idx];
    return entry?.url || entry || '';
  } catch {
    return '';
  }
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
