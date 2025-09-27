import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Review } from '../models/Review';
import { Request as ExRequest } from 'express';

const toObjectId = (id?: string) => (id && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined);

export async function listReviews(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const status = String(req.query.status || '').trim();
    const q = String(req.query.q || '').trim();
    const productId = String(req.query.productId || '').trim();
    const rating = Number(req.query.rating || 0);

    const filter: any = {};
    if (status) filter.status = status;
    if (q) filter.$or = [{ comment: new RegExp(q, 'i') }, { title: new RegExp(q, 'i') }, { name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
    if (productId && Types.ObjectId.isValid(productId)) filter.productId = new Types.ObjectId(productId);
    if (rating > 0) filter.rating = rating;

    const [items, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments(filter),
    ]);

    return res.json({
      reviews: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: skip + items.length < total,
      },
    });
  } catch (err) {
    console.error('List reviews error:', err);
    return res.status(500).json({ message: 'Server error while listing reviews' });
  }
}

// PUBLIC: list approved reviews for a product
export async function listApprovedForProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid product id' });
    const items = await Review.find({ productId: new Types.ObjectId(id), status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(100);
    const reviews = items.map((r) => ({
      _id: r._id,
      user: { name: r.name, email: r.email },
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));
    return res.json({ reviews });
  } catch (err) {
    console.error('List approved reviews error:', err);
    return res.status(500).json({ message: 'Server error while fetching product reviews' });
  }
}

// PUBLIC: create review for a product (goes to pending)
export async function createForProduct(req: ExRequest & { userId?: string }, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid product id' });
    const rating = Math.max(1, Math.min(5, Number(req.body?.rating || 0)));
    const comment = String(req.body?.comment || '').trim();
    if (!comment) return res.status(400).json({ message: 'Comment is required' });

    const review = await Review.create({
      productId: new Types.ObjectId(id),
      userId: toObjectId(req.userId),
      name: String((req as any)?.user?.name || req.body?.name || ''),
      email: String((req as any)?.user?.email || req.body?.email || ''),
      rating,
      comment,
      status: 'pending',
    });
    return res.status(201).json({ review: {
      _id: review._id,
      user: { name: review.name, email: review.email },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }});
  } catch (err) {
    console.error('Create review error:', err);
    return res.status(500).json({ message: 'Server error while creating review' });
  }
}

// PUBLIC: generic create (fallback)
export async function createGeneral(req: ExRequest & { userId?: string }, res: Response) {
  try {
    const productId = String(req.body?.productId || '');
    if (!Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'Invalid product id' });
    (req.params as any).id = productId; // reuse createForProduct
    return createForProduct(req, res);
  } catch (err) {
    console.error('Create general review error:', err);
    return res.status(500).json({ message: 'Server error while creating review' });
  }
}
export async function approveReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await Review.findByIdAndUpdate(id, { $set: { status: 'approved' } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Review not found' });
    return res.json({ review: updated });
  } catch (err) {
    console.error('Approve review error:', err);
    return res.status(500).json({ message: 'Server error while approving review' });
  }
}

export async function rejectReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await Review.findByIdAndUpdate(id, { $set: { status: 'rejected' } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Review not found' });
    return res.json({ review: updated });
  } catch (err) {
    console.error('Reject review error:', err);
    return res.status(500).json({ message: 'Server error while rejecting review' });
  }
}

export async function replyReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reply } = req.body || {};
    const updated = await Review.findByIdAndUpdate(id, { $set: { reply: String(reply || '') } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Review not found' });
    return res.json({ review: updated });
  } catch (err) {
    console.error('Reply review error:', err);
    return res.status(500).json({ message: 'Server error while replying review' });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Review not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete review error:', err);
    return res.status(500).json({ message: 'Server error while deleting review' });
  }
}

export async function bulkAction(req: Request, res: Response) {
  try {
    const { ids, action } = req.body || {};
    const idList: string[] = Array.isArray(ids) ? ids : [];
    if (idList.length === 0) return res.status(400).json({ message: 'No ids provided' });
    const filter = { _id: { $in: idList.filter(Types.ObjectId.isValid).map((id: string) => new Types.ObjectId(id)) } };

    if (action === 'approve') await Review.updateMany(filter, { $set: { status: 'approved' } });
    else if (action === 'reject') await Review.updateMany(filter, { $set: { status: 'rejected' } });
    else if (action === 'delete') await Review.deleteMany(filter);
    else return res.status(400).json({ message: 'Invalid action' });

    return res.json({ success: true });
  } catch (err) {
    console.error('Bulk review action error:', err);
    return res.status(500).json({ message: 'Server error while applying bulk action' });
  }
}
