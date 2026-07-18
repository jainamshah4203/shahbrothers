import { Request, Response } from 'express';
import { prisma } from '../config/database';

export async function getVariantById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const v = await prisma.variant.findUnique({
      where: { id },
      include: { product: { select: { name: true, slug: true } } },
    });
    if (!v) return res.status(404).json({ message: 'Variant not found' });
    const variant = {
      id: v.id,
      productId: v.productId,
      productName: v.product?.name || undefined,
      productSlug: v.product?.slug || undefined,
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

    const productId = String(req.query.productId || '').trim();
    const color = String(req.query.color || '').trim();
    const size = String(req.query.size || '').trim();
    const search = String(req.query.search || '').trim();

    const filter: any = {};
    if (productId) filter.productId = productId;
    if (color) filter.color = { contains: color, mode: 'insensitive' };
    if (size) filter.size = { contains: size, mode: 'insensitive' };
    if (search) {
      filter.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { color: { contains: search, mode: 'insensitive' } },
        { size: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, count] = await Promise.all([
      prisma.variant.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { product: { select: { name: true, slug: true } } },
      }),
      prisma.variant.count({ where: filter }),
    ]);

    const variants = items.map((v: any) => ({
      id: v.id,
      productId: v.productId,
      productName: v.product?.name || undefined,
      productSlug: v.product?.slug || undefined,
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
    if (!productId) return res.status(400).json({ message: 'productId is required' });
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const discountPercent = mrp && price ? Math.max(0, Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)) : undefined;

    const created = await prisma.variant.create({
      data: {
        productId,
        sku,
        color,
        size,
        mrp: Number(mrp ?? 0),
        price: Number(price ?? 0),
        stock: Number(stock ?? 0),
        discountPercent,
        images: Array.isArray(images) ? images : [],
      }
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
    const patch: any = { ...req.body };
    if (patch.mrp != null && patch.price != null) {
      const mrp = Number(patch.mrp);
      const price = Number(patch.price);
      patch.discountPercent = mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0;
    }
    // Remove fields that shouldn't be directly set
    delete patch.id;
    delete patch.productId;
    
    const updated = await prisma.variant.update({ where: { id }, data: patch });
    return res.json({ variant: updated });
  } catch (err) {
    console.error('Update variant error:', err);
    return res.status(500).json({ message: 'Server error while updating variant' });
  }
}

export async function deleteVariant(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.variant.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete variant error:', err);
    return res.status(500).json({ message: 'Server error while deleting variant' });
  }
}
