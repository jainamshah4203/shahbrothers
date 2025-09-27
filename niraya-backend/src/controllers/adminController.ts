import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';

function monthsBack(n: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);
  return start;
}

export async function getAdminStats(_req: Request, res: Response) {
  try {
    const [totalProducts, totalCustomers, totalOrders, distinctCategories] = await Promise.all([
      Product.countDocuments({}),
      User.countDocuments({}),
      Order.countDocuments({}),
      Product.distinct('category'),
    ]);

    // Monthly orders for last 12 months
    const since = monthsBack(12);
    const monthlyAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyOrders = [] as Array<{ month: string; count: number; total: number }>;
    // Fill 12 slots
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = monthlyAgg.find((it: any) => it._id.y === y && it._id.m === m);
      monthlyOrders.push({ month: `${monthNames[m - 1]} ${String(y).slice(-2)}`, count: key?.count || 0, total: key?.total || 0 });
    }

    // Status distribution
    const statusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const orderStatusDistribution = statusAgg.map((s: any) => ({ status: s._id || 'Unknown', count: s.count }));

    // Latest orders
    const latestOrdersDocs = await Order.find({}).sort({ createdAt: -1 }).limit(10);
    const latestOrders = latestOrdersDocs.map((o: any) => ({
      id: o._id,
      paymentId: o.paymentId || '-',
      totalItems: Array.isArray(o.items) ? o.items.reduce((a: number, b: any) => a + (b.quantity || 0), 0) : 0,
      status: o.status,
      amount: o.total,
      createdAt: o.createdAt,
    }));

    res.json({
      totals: {
        totalCategories: (distinctCategories || []).filter(Boolean).length,
        totalProducts,
        totalCustomers,
        totalOrders,
      },
      monthlyOrders,
      orderStatusDistribution,
      latestOrders,
      latestReviews: [], // placeholder until Reviews model exists
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error while fetching admin stats' });
  }
}
