import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { Request as ExRequest } from 'express';

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
    if (q) {
      filter.OR = [
        { comment: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (productId) filter.productId = productId;
    if (rating > 0) filter.rating = rating;

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: filter }),
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
    const items = await prisma.review.findMany({
      where: { productId: id, status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const reviews = items.map((r: any) => ({
      id: r.id,
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
    const rating = Math.max(1, Math.min(5, Number(req.body?.rating || 0)));
    const comment = String(req.body?.comment || '').trim();
    if (!comment) return res.status(400).json({ message: 'Comment is required' });

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: req.userId || undefined,
        name: String((req as any)?.user?.name || req.body?.name || ''),
        email: String((req as any)?.user?.email || req.body?.email || ''),
        rating,
        comment,
        status: 'pending',
      }
    });
    return res.status(201).json({ review: {
      id: review.id,
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
    if (!productId) return res.status(400).json({ message: 'Invalid product id' });
    (req.params as any).id = productId;
    return createForProduct(req, res);
  } catch (err) {
    console.error('Create general review error:', err);
    return res.status(500).json({ message: 'Server error while creating review' });
  }
}

export async function approveReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await prisma.review.update({ where: { id }, data: { status: 'approved' } });
    return res.json({ review: updated });
  } catch (err) {
    console.error('Approve review error:', err);
    return res.status(500).json({ message: 'Server error while approving review' });
  }
}

export async function rejectReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await prisma.review.update({ where: { id }, data: { status: 'rejected' } });
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
    const updated = await prisma.review.update({ where: { id }, data: { reply: String(reply || '') } });
    return res.json({ review: updated });
  } catch (err) {
    console.error('Reply review error:', err);
    return res.status(500).json({ message: 'Server error while replying review' });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete review error:', err);
    return res.status(500).json({ message: 'Server error while deleting review' });
  }
}

export async function bulkAction(req: Request, res: Response) {
  try {
    const { ids, action } = req.body || {};
    const idList: string[] = Array.isArray(ids) ? ids.filter((s: any) => typeof s === 'string') : [];
    if (idList.length === 0) return res.status(400).json({ message: 'No ids provided' });

    if (action === 'approve') {
      await prisma.review.updateMany({ where: { id: { in: idList } }, data: { status: 'approved' } });
    } else if (action === 'reject') {
      await prisma.review.updateMany({ where: { id: { in: idList } }, data: { status: 'rejected' } });
    } else if (action === 'delete') {
      await prisma.review.deleteMany({ where: { id: { in: idList } } });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Bulk review action error:', err);
    return res.status(500).json({ message: 'Server error while applying bulk action' });
  }
}
