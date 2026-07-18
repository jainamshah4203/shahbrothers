import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { validationResult } from 'express-validator';

function mapApiProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    salePrice: p.salePrice,
    images: Array.isArray(p.images) ? p.images.map((im: any) => (typeof im === 'string' ? im : im?.url)).filter(Boolean) : [],
    category: p.category,
    brand: p.brand,
    slug: p.slug,
    sizes: p.sizes || [],
    colors: Array.isArray(p.colors) ? p.colors.map((c: any) => (typeof c === 'string' ? c : c?.name)).filter(Boolean) : [],
    stock: p.stock ?? 0,
    featured: !!p.featured,
    limited: !!p.limited,
    material: p.material,
    careInstructions: p.careInstructions || [],
    isNewProduct: !!p.isNewProduct,
    isBestseller: !!p.isBestseller,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export const bulkUpdateProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, action } = req.body || {};
    const idList: string[] = Array.isArray(ids) ? ids : [];
    if (idList.length === 0) {
      res.status(400).json({ message: 'No ids provided' });
      return;
    }
    const validIds = idList.filter((s) => typeof s === 'string');
    const set: any = {};
    if (action === 'feature') set.featured = true;
    else if (action === 'unfeature') set.featured = false;
    else if (action === 'bestseller') set.isBestseller = true;
    else if (action === 'unbestseller') set.isBestseller = false;
    else if (action === 'limited') set.limited = true;
    else if (action === 'unlimited') set.limited = false;
    else if (action === 'new') set.isNewProduct = true;
    else if (action === 'unnew') set.isNewProduct = false;
    else {
      res.status(400).json({ message: 'Invalid action' });
      return;
    }
    await prisma.product.updateMany({
      where: { id: { in: validIds } },
      data: set
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({ message: 'Server error while bulk updating products' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      return;
    }

    const body = req.body || {};
    const images = Array.isArray(body.images)
      ? body.images.map((im: any) => (typeof im === 'string' ? { url: im } : im)).filter((im: any) => im && im.url)
      : [];
    const colors = Array.isArray(body.colors)
      ? body.colors.map((c: any) => (typeof c === 'string' ? { name: c } : c)).filter((c: any) => c && c.name)
      : [];

    const created = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        salePrice: body.salePrice,
        images: images,
        category: body.category,
        sizes: body.sizes || [],
        colors: colors,
        stock: body.stock ?? 0,
        brand: body.brand,
        featured: !!body.featured,
        limited: !!body.limited,
        isNewProduct: !!body.isNewProduct,
        isBestseller: !!body.isBestseller,
        material: body.material,
        careInstructions: body.careInstructions || [],
      }
    });

    res.status(201).json({ product: mapApiProduct(created) });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      return;
    }
    const { id } = req.params;
    const body = req.body || {};
    const updates: any = { ...body };
    if (Array.isArray(body.images)) {
      updates.images = body.images.map((im: any) => (typeof im === 'string' ? { url: im } : im)).filter((im: any) => im && im.url);
    }
    if (Array.isArray(body.colors)) {
      updates.colors = body.colors.map((c: any) => (typeof c === 'string' ? { name: c } : c)).filter((c: any) => c && c.name);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updates
    });
    res.json({ product: mapApiProduct(updated) });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as Record<string, string>;

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.gte = Number(minPrice);
      if (maxPrice) filter.price.lte = Number(maxPrice);
    }

    // Booleans
    const featured = (req.query as any).featured;
    if (typeof featured === 'string' && /^(true|1)$/i.test(featured)) filter.featured = true;
    const bestSeller = (req.query as any).bestSeller;
    if (typeof bestSeller === 'string' && /^(true|1)$/i.test(bestSeller)) filter.isBestseller = true;
    const saleOnly = (req.query as any).saleOnly;
    if (typeof saleOnly === 'string' && /^(true|1)$/i.test(saleOnly)) {
      filter.salePrice = { not: null };
    }
    const limited = (req.query as any).limited;
    if (typeof limited === 'string' && /^(true|1)$/i.test(limited)) filter.limited = true;
    const newOnly = (req.query as any).newOnly;
    if (typeof newOnly === 'string' && /^(true|1)$/i.test(newOnly)) filter.isNewProduct = true;

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';

    const productsDocs = await prisma.product.findMany({
      where: filter,
      orderBy,
      skip,
      take: Number(limit)
    });
    
    const products = productsDocs.map(mapApiProduct);
    const total = await prisma.product.count({ where: filter });
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalProducts: total,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '8' } = req.query as Record<string, string>;
    const productsDocs = await prisma.product.findMany({
      where: {
        OR: [{ isNewProduct: true }, { isBestseller: true }],
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    res.json({ products: productsDocs.map(mapApiProduct) });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error while fetching featured products' });
  }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { page = '1', limit = '12' } = req.query as Record<string, string>;
    const skip = (Number(page) - 1) * Number(limit);

    const productsDocs = await prisma.product.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.product.count({ where: { category } });
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      products: productsDocs.map(mapApiProduct),
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalProducts: total,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error while fetching products by category' });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        slug: { equals: slug, mode: 'insensitive' }
      }
    });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ product: mapApiProduct(product) });
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ product: mapApiProduct(product) });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};
