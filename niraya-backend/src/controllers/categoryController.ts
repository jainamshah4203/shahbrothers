import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Types } from 'mongoose';

export async function listCategories(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || '10'), 10)));
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    const filter: any = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { slug: new RegExp(search, 'i') }];

    const [items, count] = await Promise.all([
      Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Category.countDocuments(filter),
    ]);

    return res.json({
      categories: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNextPage: skip + items.length < count,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('List categories error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    return res.json({ category: cat });
  } catch (err) {
    console.error('Get category error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug, description } = req.body || {};
    if (!name || !slug) return res.status(400).json({ message: 'name and slug are required' });
    const exists = await Category.findOne({ slug });
    if (exists) return res.status(409).json({ message: 'Slug already exists' });
    const created = await Category.create({ name, slug, description });
    return res.status(201).json({ category: created });
  } catch (err) {
    console.error('Create category error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const patch: any = {};
    ['name', 'slug', 'description'].forEach((k) => {
      if (req.body && req.body[k] != null) patch[k] = req.body[k];
    });
    const updated = await Category.findByIdAndUpdate(id, { $set: patch }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    return res.json({ category: updated });
  } catch (err) {
    console.error('Update category error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete category error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
