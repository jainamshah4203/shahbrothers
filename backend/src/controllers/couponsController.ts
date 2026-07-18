import { Request, Response } from 'express';
import { prisma } from '../config/database';

export async function listCoupons(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    const filter: any = {};
    if (search) {
      filter.code = { contains: search, mode: 'insensitive' };
    }
    const includeExpired = String(req.query.includeExpired || '').toLowerCase() === 'true';
    if (!includeExpired) {
      const now = new Date();
      filter.active = true;
      filter.OR = [
        { endDate: null },
        { endDate: { gte: now } },
      ];
      filter.AND = [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
      ];
    }

    const [items, count] = await Promise.all([
      prisma.coupon.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where: filter }),
    ]);

    return res.json({
      coupons: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNextPage: skip + items.length < count,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('List coupons error:', err);
    return res.status(500).json({ message: 'Server error while fetching coupons' });
  }
}

export async function createCoupon(req: Request, res: Response) {
  try {
    const body = req.body || {};
    const exists = await prisma.coupon.findUnique({ where: { code: String(body.code || '').toUpperCase() } });
    if (exists) return res.status(400).json({ message: 'Coupon code already exists' });
    const coupon = await prisma.coupon.create({
      data: {
        code: String(body.code || '').toUpperCase(),
        type: body.type,
        value: Number(body.value),
        minOrder: body.minOrder ?? undefined,
        maxDiscount: body.maxDiscount ?? undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        usageLimit: body.usageLimit ?? undefined,
        perUserLimit: body.perUserLimit ?? undefined,
        active: body.active !== false,
      }
    });
    return res.status(201).json({ coupon });
  } catch (err) {
    console.error('Create coupon error:', err);
    return res.status(500).json({ message: 'Server error while creating coupon' });
  }
}

export async function getCoupon(req: Request, res: Response) {
  try {
    const c = await prisma.coupon.findUnique({ where: { id: req.params.id } });
    if (!c) return res.status(404).json({ message: 'Coupon not found' });
    return res.json({ coupon: c });
  } catch (err) {
    console.error('Get coupon error:', err);
    return res.status(500).json({ message: 'Server error while fetching coupon' });
  }
}

export async function updateCoupon(req: Request, res: Response) {
  try {
    const body = req.body || {};
    const update: any = {
      type: body.type,
      value: Number(body.value),
      minOrder: body.minOrder ?? undefined,
      maxDiscount: body.maxDiscount ?? undefined,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      usageLimit: body.usageLimit ?? undefined,
      perUserLimit: body.perUserLimit ?? undefined,
      active: body.active,
    };
    if (body.code) update.code = String(body.code).toUpperCase();

    const c = await prisma.coupon.update({ where: { id: req.params.id }, data: update });
    return res.json({ coupon: c });
  } catch (err) {
    console.error('Update coupon error:', err);
    return res.status(500).json({ message: 'Server error while updating coupon' });
  }
}

export async function deleteCoupon(req: Request, res: Response) {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete coupon error:', err);
    return res.status(500).json({ message: 'Server error while deleting coupon' });
  }
}

// POST /coupons/validate { code, cartTotal, userId?, email? }
export async function validateCoupon(req: Request, res: Response) {
  try {
    const code = String((req.body?.code || '')).toUpperCase().trim();
    const cartTotal = Number(req.body?.cartTotal || 0);
    const userId = req.body?.userId;
    const email = req.body?.email;
    
    if (!code) return res.status(400).json({ valid: false, message: 'Code is required' });
    if (!(cartTotal >= 0)) return res.status(400).json({ valid: false, message: 'cartTotal is required' });

    const c = await prisma.coupon.findUnique({ where: { code } });
    if (!c) return res.status(404).json({ valid: false, message: 'Invalid coupon' });

    const now = new Date();
    if (!c.active) return res.status(400).json({ valid: false, message: 'Coupon is inactive' });
    if (c.startDate && c.startDate > now) return res.status(400).json({ valid: false, message: 'Coupon not started yet' });
    if (c.endDate && c.endDate < now) return res.status(400).json({ valid: false, message: 'Coupon expired' });
    if (typeof c.minOrder === 'number' && c.minOrder !== null && cartTotal < c.minOrder) return res.status(400).json({ valid: false, message: `Minimum order ₹${c.minOrder}` });
    if (typeof c.usageLimit === 'number' && c.usageLimit !== null && c.usedCount >= c.usageLimit) return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });

    // Check per-user limit
    if (typeof c.perUserLimit === 'number' && c.perUserLimit > 0 && (userId || email)) {
      const userUsageFilter: any = { couponId: c.id };
      if (userId) userUsageFilter.userId = userId;
      else if (email) userUsageFilter.email = email;
      
      const userUsageCount = await prisma.couponUsage.count({ where: userUsageFilter });
      if (userUsageCount >= c.perUserLimit) {
        return res.status(400).json({ valid: false, message: `You have already used this coupon ${c.perUserLimit} time(s)` });
      }
    }

    let discount = 0;
    if (c.type === 'percent') {
      discount = (cartTotal * c.value) / 100;
      if (typeof c.maxDiscount === 'number' && c.maxDiscount !== null) discount = Math.min(discount, c.maxDiscount);
    } else {
      discount = Math.min(c.value, cartTotal);
    }

    const finalTotal = Math.max(0, cartTotal - discount);
    return res.json({ valid: true, discount, finalTotal, coupon: {
      code: c.code,
      type: c.type,
      value: c.value,
      minOrder: c.minOrder,
      maxDiscount: c.maxDiscount,
      startDate: c.startDate,
      endDate: c.endDate,
      usageLimit: c.usageLimit,
      perUserLimit: c.perUserLimit,
      active: c.active,
    }});
  } catch (err) {
    console.error('Validate coupon error:', err);
    return res.status(500).json({ valid: false, message: 'Server error while validating coupon' });
  }
}

// Function to track coupon usage when order is placed
export async function trackCouponUsage(couponCode: string, orderId: string, userId?: string, email?: string, orderTotal?: number, discountAmount?: number) {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (!coupon) return;

    // Create usage record
    await prisma.couponUsage.create({
      data: {
        couponId: coupon.id,
        couponCode: coupon.code,
        userId: userId || undefined,
        email: email || undefined,
        orderId,
        orderTotal: orderTotal || 0,
        discountAmount: discountAmount || 0,
      }
    });

    // Increment coupon usage count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } }
    });
    
    console.log(`Coupon ${couponCode} usage tracked for order ${orderId}`);
  } catch (error) {
    console.error('Error tracking coupon usage:', error);
  }
}

// GET /coupons/export - Export coupons as CSV
export async function exportCoupons(req: Request, res: Response) {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    
    const csvHeader = 'Code,Type,Value,MinOrder,MaxDiscount,StartDate,EndDate,UsageLimit,PerUserLimit,Active,UsedCount,CreatedAt\n';
    const csvRows = coupons.map((c: any) => [
      c.code,
      c.type,
      c.value,
      c.minOrder || '',
      c.maxDiscount || '',
      c.startDate ? c.startDate.toISOString().split('T')[0] : '',
      c.endDate ? c.endDate.toISOString().split('T')[0] : '',
      c.usageLimit || '',
      c.perUserLimit || '',
      c.active,
      c.usedCount,
      c.createdAt ? c.createdAt.toISOString().split('T')[0] : ''
    ].join(','));
    
    const csv = csvHeader + csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=coupons.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Export coupons error:', err);
    return res.status(500).json({ message: 'Server error while exporting coupons' });
  }
}

// POST /coupons/import - Import coupons from CSV
export async function importCoupons(req: Request, res: Response) {
  try {
    const { csvData } = req.body;
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ message: 'CSV data is required' });
    }

    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return res.status(400).json({ message: 'CSV must have header and at least one data row' });
    }

    const header = lines[0].toLowerCase();
    const expectedFields = ['code', 'type', 'value'];
    const hasRequiredFields = expectedFields.every(field => header.includes(field));
    
    if (!hasRequiredFields) {
      return res.status(400).json({ message: 'CSV must include Code, Type, and Value columns' });
    }

    const results = { created: 0, errors: [] as string[] };
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row.length < 3) continue;
      
      try {
        const [code, type, value, minOrder, maxDiscount, startDate, endDate, usageLimit, perUserLimit, active] = row;
        
        if (!code || !type || !value) {
          results.errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        const exists = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (exists) {
          results.errors.push(`Row ${i + 1}: Coupon ${code} already exists`);
          continue;
        }

        await prisma.coupon.create({
          data: {
            code: code.toUpperCase(),
            type: type === 'percent' ? 'percent' : 'fixed',
            value: Number(value),
            minOrder: minOrder ? Number(minOrder) : undefined,
            maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            usageLimit: usageLimit ? Number(usageLimit) : undefined,
            perUserLimit: perUserLimit ? Number(perUserLimit) : undefined,
            active: active ? active.toLowerCase() === 'true' : true,
          }
        });
        
        results.created++;
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error}`);
      }
    }

    return res.json(results);
  } catch (err) {
    console.error('Import coupons error:', err);
    return res.status(500).json({ message: 'Server error while importing coupons' });
  }
}

// GET /coupons/analytics - Get coupon usage analytics
export async function getCouponAnalytics(req: Request, res: Response) {
  try {
    const { startDate, endDate, couponId } = req.query;
    
    // Build usage filter
    const usageFilter: any = {};
    if (startDate || endDate) {
      usageFilter.usedAt = {};
      if (startDate) usageFilter.usedAt.gte = new Date(startDate as string);
      if (endDate) usageFilter.usedAt.lte = new Date(endDate as string);
    }
    if (couponId) usageFilter.couponId = couponId as string;

    // Overall usage stats
    const usageAgg = await prisma.couponUsage.aggregate({
      where: usageFilter,
      _count: { id: true },
      _sum: { discountAmount: true, orderTotal: true },
      _avg: { discountAmount: true, orderTotal: true },
    });

    // Top performing coupons
    const topCoupons = await prisma.couponUsage.groupBy({
      by: ['couponCode'],
      where: usageFilter,
      _count: { id: true },
      _sum: { discountAmount: true, orderTotal: true },
      _avg: { discountAmount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const topCouponsFormatted = topCoupons.map((tc: any) => ({
      _id: tc.couponCode,
      usageCount: tc._count.id,
      totalDiscount: tc._sum.discountAmount || 0,
      totalOrderValue: tc._sum.orderTotal || 0,
      avgDiscount: tc._avg.discountAmount || 0,
    }));

    // Recent usage activity
    const recentUsage = await prisma.couponUsage.findMany({
      where: usageFilter,
      orderBy: { usedAt: 'desc' },
      take: 20,
      include: { coupon: { select: { code: true, type: true, value: true } } },
    });

    // Usage by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsageForDates = await prisma.couponUsage.findMany({
      where: { usedAt: { gte: thirtyDaysAgo }, ...usageFilter },
      select: { usedAt: true, discountAmount: true },
    });

    // Group by date in memory
    const dateMap = new Map<string, { count: number; totalDiscount: number }>();
    for (const u of recentUsageForDates) {
      const dateKey = u.usedAt.toISOString().split('T')[0];
      const existing = dateMap.get(dateKey) || { count: 0, totalDiscount: 0 };
      existing.count += 1;
      existing.totalDiscount += u.discountAmount || 0;
      dateMap.set(dateKey, existing);
    }
    const usageByDate = Array.from(dateMap.entries())
      .map(([date, data]) => ({ _id: date, count: data.count, totalDiscount: data.totalDiscount }))
      .sort((a, b) => a._id.localeCompare(b._id));

    return res.json({
      overview: {
        totalUsage: usageAgg._count.id || 0,
        totalDiscount: usageAgg._sum.discountAmount || 0,
        totalOrderValue: usageAgg._sum.orderTotal || 0,
        avgDiscount: usageAgg._avg.discountAmount || 0,
        avgOrderValue: usageAgg._avg.orderTotal || 0,
      },
      topCoupons: topCouponsFormatted,
      recentUsage,
      usageByDate,
    });
  } catch (err) {
    console.error('Get coupon analytics error:', err);
    return res.status(500).json({ message: 'Server error while fetching analytics' });
  }
}
