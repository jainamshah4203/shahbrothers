import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
  snapshot: {
    name: string;
    price: number;
    salePrice?: number;
    image?: string;
    sku?: string;
  };
}

export interface IAddress {
  name?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrder extends Document {
  userId?: Types.ObjectId;
  email?: string;
  invoiceNumber?: string;
  notes?: string;
  items: IOrderItem[];
  subtotal?: number;
  discount?: number;
  couponDiscount?: number;
  shippingFee?: number;
  total: number;
  totalAmount?: number;
  transactionId?: string;
  status: 'Processing' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Failed';
  paymentMethod?: 'COD' | 'Prepaid' | 'Razorpay' | 'Stripe' | 'Other';
  shippingAddress: IAddress;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String },
  color: { type: String },
  snapshot: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    image: { type: String },
    sku: { type: String },
  },
});

const AddressSchema = new Schema<IAddress>({
  name: { type: String },
  phone: { type: String },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    invoiceNumber: { type: String, unique: true, sparse: true, index: true },
    notes: { type: String },
    items: { type: [OrderItemSchema], required: true, validate: [(arr: any[]) => arr.length > 0, 'At least one item'] },
    subtotal: { type: Number, min: 0 },
    discount: { type: Number, min: 0, default: 0 },
    couponDiscount: { type: Number, min: 0, default: 0 },
    shippingFee: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, min: 0 },
    transactionId: { type: String },
    status: { type: String, enum: ['Processing', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Failed'], default: 'Processing' },
    paymentMethod: { type: String, enum: ['COD', 'Prepaid', 'Razorpay', 'Stripe', 'Other'], default: 'COD' },
    shippingAddress: { type: AddressSchema, required: true },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
