import { Request, Response } from 'express';
import { Variant } from '../models/Variant';
import { Product } from '../models/Product';
import { Types } from 'mongoose';

function toObjectId(id?: string) {
  try {
    return id && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;
  } catch {
    return undefined;
  }
}

export async function getVariantById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid variant id' });
    const v: any = await Variant.findById(id).populate('productId', 'name slug');
    if (!v) return res.status(404).json({ message: 'Variant not found' });
    const variant = {
      _id: v._id,
      productId: v.productId?._id || v.productId,
      productName: v.productId?.name || undefined,
      productSlug: v.productId?.slug || undefined,
      sku: v.sku,
      color: v.color,
      size: v.size,
      mrp: v.mrp,
      price: v.price,
      discountPercent: v.discountPercent,
      stock: v.stock,
      images: v.images || [],
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
    return res.json({ variant });
  } catch (err) {
    console.error('Get variant error:', err);
    return res.status(500).json({ message: 'Server error while getting variant' });
  }
}

export async function listVariants(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || '10'), 10)));
    const skip = (page - 1) * limit;

    const productId = toObjectId(String(req.query.productId || ''));
    const color = String(req.query.color || '').trim();
    const size = String(req.query.size || '').trim();
    const search = String(req.query.search || '').trim();

    const filter: any = {};
    if (productId) filter.productId = productId;
    if (color) filter.color = new RegExp(color, 'i');
    if (size) filter.size = new RegExp(size, 'i');
    if (search) {
      // search by SKU or color/size
      filter.$or = [
        { sku: new RegExp(search, 'i') },
        { color: new RegExp(search, 'i') },
        { size: new RegExp(search, 'i') },
      ];
    }

    const [items, count] = await Promise.all([
      Variant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('productId', 'name slug'),
      Variant.countDocuments(filter),
    ]);

    const variants = items.map((v: any) => ({
      _id: v._id,
      productId: v.productId?._id || v.productId,
      productName: v.productId?.name || undefined,
      productSlug: v.productId?.slug || undefined,
      sku: v.sku,
      color: v.color,
      size: v.size,
      mrp: v.mrp,
      price: v.price,
      discountPercent: v.discountPercent,
      stock: v.stock,
      images: v.images || [],
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    return res.json({
      variants,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNextPage: skip + items.length < count,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('List variants error:', err);
    return res.status(500).json({ message: 'Server error while listing variants' });
  }
}

export async function createVariant(req: Request, res: Response) {
  try {
    const { productId, sku, color, size, mrp, price, stock, images } = req.body || {};
    const pid = toObjectId(productId);
    if (!pid) return res.status(400).json({ message: 'productId is required' });
    const product = await Product.findById(pid);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const discountPercent = mrp && price ? Math.max(0, Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)) : undefined;

    const created = await Variant.create({
      productId: pid,
      sku,
      color,
      size,
      mrp: Number(mrp ?? 0),
      price: Number(price ?? 0),
      stock: Number(stock ?? 0),
      discountPercent,
      images: Array.isArray(images) ? images : [],
    });
    return res.status(201).json({ variant: created });
  } catch (err) {
    console.error('Create variant error:', err);
    return res.status(500).json({ message: 'Server error while creating variant' });
  }
}

export async function updateVariant(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid variant id' });
    const patch: any = { ...req.body };
    if (patch.mrp != null && patch.price != null) {
      const mrp = Number(patch.mrp);
      const price = Number(patch.price);
      patch.discountPercent = mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0;
    }
    const updated = await Variant.findByIdAndUpdate(id, { $set: patch }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Variant not found' });
    return res.json({ variant: updated });
  } catch (err) {
    console.error('Update variant error:', err);
    return res.status(500).json({ message: 'Server error while updating variant' });
  }
}

export async function deleteVariant(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid variant id' });
    const deleted = await Variant.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Variant not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete variant error:', err);
    return res.status(500).json({ message: 'Server error while deleting variant' });
  }
}
