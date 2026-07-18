import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /customers?search=&page=&limit=
export async function listCustomers(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    // Since Prisma doesn't support MongoDB-style aggregation pipelines,
    // we aggregate customers by email from Orders using raw queries via groupBy + in-memory enrichment

    // Get all orders (with email filter if searching)
    const orderFilter: any = {};
    if (search) {
      orderFilter.OR = [
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Group orders by email
    const groupedOrders = await prisma.order.groupBy({
      by: ['email'],
      where: { email: { not: null }, ...orderFilter },
      _count: { id: true },
      _sum: { totalAmount: true, total: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
      skip,
      take: limit,
    });

    // Get total distinct email count
    const totalGrouped = await prisma.order.groupBy({
      by: ['email'],
      where: { email: { not: null }, ...orderFilter },
      _count: { id: true },
    });
    const totalDistinct = totalGrouped.length;

    // Get the latest shipping address for each email for name/phone info
    const emails = groupedOrders.map((r: any) => r.email).filter(Boolean) as string[];
    
    // Enrich with User info if exists
    const users = emails.length
      ? await prisma.user.findMany({
          where: { email: { in: emails } },
          select: { email: true, name: true, id: true, createdAt: true },
        })
      : [];
    const byEmail = new Map(users.map((u: any) => [u.email, u]));

    // Get latest order for each email to extract shipping address name/phone
    const latestOrders = emails.length
      ? await prisma.order.findMany({
          where: { email: { in: emails } },
          orderBy: { createdAt: 'desc' },
          distinct: ['email'],
          select: { email: true, shippingAddress: true },
        })
      : [];
    const addrByEmail = new Map(latestOrders.map((o: any) => [o.email, o.shippingAddress as any]));

    const customers = groupedOrders.map((r: any) => {
      const u: any = byEmail.get(r.email!);
      const addr: any = addrByEmail.get(r.email!) || {};
      return {
        email: r.email,
        name: u?.name || addr?.name || '',
        phone: addr?.phone || '',
        ordersCount: r._count.id,
        totalSpent: r._sum.totalAmount || r._sum.total || 0,
        lastOrderAt: r._max.createdAt,
        userId: u?.id || null,
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
