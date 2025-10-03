import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';

// GET /customers?search=&page=&limit=
export async function listCustomers(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    // Aggregate customers by email from Orders (includes guests)
    const match: any = {};
    if (search) {
      match.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      ];
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: '$email',
          email: { $first: '$email' },
          name: { $first: '$shippingAddress.name' },
          phone: { $first: '$shippingAddress.phone' },
          ordersCount: { $sum: 1 },
          totalSpent: { $sum: { $ifNull: ['$totalAmount', '$total'] } },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
      { $sort: { lastOrderAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [rows, totalAgg] = await Promise.all([
      Order.aggregate(pipeline),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$email' } },
        { $count: 'total' },
      ]),
    ]);
    const totalDistinct = totalAgg?.[0]?.total || 0;

    // Enrich with User info if exists
    const emails = rows.map((r) => r.email).filter(Boolean);
    const users = emails.length ? await User.find({ email: { $in: emails } }, 'email name _id createdAt') : [];
    const byEmail = new Map(users.map((u: any) => [u.email, u]));

    const customers = rows.map((r) => {
      const u = byEmail.get(r.email);
      return {
        email: r.email,
        name: u?.name || r.name || '',
        phone: r.phone || '',
        ordersCount: r.ordersCount,
        totalSpent: r.totalSpent || 0,
        lastOrderAt: r.lastOrderAt,
        userId: u?._id || null,
        joinedAt: u?.createdAt || null,
      };
    });

    return res.json({
      customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDistinct / limit),
        total: totalDistinct,
        hasNextPage: skip + customers.length < totalDistinct,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('List customers error:', err);
    return res.status(500).json({ message: 'Server error while fetching customers' });
  }
}
