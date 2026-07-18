import { Request, Response } from 'express';
import { prisma } from '../config/database';

function monthsBack(n: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);
  return start;
}

export async function getAdminStats(_req: Request, res: Response) {
  try {
    const [totalProducts, totalCustomers, totalOrders] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);

    // Get distinct categories
    const distinctCats = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    // Monthly orders for last 12 months (raw SQL for grouping by month)
    const since = monthsBack(12);
    const orders12m = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, total: true },
    });

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyOrders = [] as Array<{ month: string; count: number; total: number }>;
    const now = new Date();
    
    // Build a map of year-month -> {count, total}
    const monthMap = new Map<string, { count: number; total: number }>();
    for (const o of orders12m) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const existing = monthMap.get(key) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += o.total || 0;
      monthMap.set(key, existing);
    }

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${m}`;
      const entry = monthMap.get(key);
      monthlyOrders.push({ month: `${monthNames[m - 1]} ${String(y).slice(-2)}`, count: entry?.count || 0, total: entry?.total || 0 });
    }

    // Status distribution
    const allOrders = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const orderStatusDistribution = allOrders.map((s: any) => ({ status: s.status || 'Unknown', count: s._count.status }));

    // Latest orders
    const latestOrdersDocs = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { items: true },
    });
    const latestOrders = latestOrdersDocs.map((o: any) => ({
      id: o.id,
      paymentId: o.transactionId || '-',
      totalItems: Array.isArray(o.items) ? o.items.reduce((a: number, b: any) => a + (b.quantity || 0), 0) : 0,
      status: o.status,
      amount: o.total,
      createdAt: o.createdAt,
    }));

    res.json({
      totals: {
        totalCategories: distinctCats.length,
        totalProducts,
        totalCustomers,
        totalOrders,
      },
      monthlyOrders,
      orderStatusDistribution,
      latestOrders,
      latestReviews: [],
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error while fetching admin stats' });
  }
}
