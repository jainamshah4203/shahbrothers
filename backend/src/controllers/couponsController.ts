import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { CouponUsage } from '../models/CouponUsage';

export async function listCoupons(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    const filter: any = {};
    if (search) {
      filter.code = { $regex: search, $options: 'i' };
    }
    const includeExpired = String(req.query.includeExpired || '').toLowerCase() === 'true';
    if (!includeExpired) {
      const now = new Date();
      filter.active = true;
      filter.$or = [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } },
      ];
      // Also ensure startDate not in future
      filter.$and = [
        { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
      ];
    }

    const [items, count] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(filter),
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
    const exists = await Coupon.findOne({ code: String(body.code || '').toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Coupon code already exists' });
    const coupon = await Coupon.create({
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
    });
    return res.status(201).json({ coupon });
  } catch (err) {
    console.error('Create coupon error:', err);
    return res.status(500).json({ message: 'Server error while creating coupon' });
  }
}

export async function getCoupon(req: Request, res: Response) {
  try {
    const c = await Coupon.findById(req.params.id);
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

    const c = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!c) return res.status(404).json({ message: 'Coupon not found' });
    return res.json({ coupon: c });
  } catch (err) {
    console.error('Update coupon error:', err);
    return res.status(500).json({ message: 'Server error while updating coupon' });
  }
}

export async function deleteCoupon(req: Request, res: Response) {
  try {
    const c = await Coupon.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ message: 'Coupon not found' });
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

    const c = await Coupon.findOne({ code });
    if (!c) return res.status(404).json({ valid: false, message: 'Invalid coupon' });

    const now = new Date();
    if (!c.active) return res.status(400).json({ valid: false, message: 'Coupon is inactive' });
    if (c.startDate && c.startDate > now) return res.status(400).json({ valid: false, message: 'Coupon not started yet' });
    if (c.endDate && c.endDate < now) return res.status(400).json({ valid: false, message: 'Coupon expired' });
    if (typeof c.minOrder === 'number' && cartTotal < c.minOrder) return res.status(400).json({ valid: false, message: `Minimum order ₹${c.minOrder}` });
    if (typeof c.usageLimit === 'number' && c.usedCount >= c.usageLimit) return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });

    // Check per-user limit
    if (typeof c.perUserLimit === 'number' && c.perUserLimit > 0 && (userId || email)) {
      const userUsageFilter: any = { couponId: c._id };
      if (userId) userUsageFilter.userId = userId;
      else if (email) userUsageFilter.email = email;
      
      const userUsageCount = await CouponUsage.countDocuments(userUsageFilter);
      if (userUsageCount >= c.perUserLimit) {
        return res.status(400).json({ valid: false, message: `You have already used this coupon ${c.perUserLimit} time(s)` });
      }
    }

    let discount = 0;
    if (c.type === 'percent') {
      discount = (cartTotal * c.value) / 100;
      if (typeof c.maxDiscount === 'number') discount = Math.min(discount, c.maxDiscount);
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
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) return;

    // Create usage record
    await CouponUsage.create({
      couponId: coupon._id,
      couponCode: coupon.code,
      userId: userId || undefined,
      email: email || undefined,
      orderId,
      orderTotal: orderTotal || 0,
      discountAmount: discountAmount || 0,
    });

    // Increment coupon usage count
    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    
    console.log(`Coupon ${couponCode} usage tracked for order ${orderId}`);
  } catch (error) {
    console.error('Error tracking coupon usage:', error);
  }
}

// GET /coupons/export - Export coupons as CSV
export async function exportCoupons(req: Request, res: Response) {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    
    const csvHeader = 'Code,Type,Value,MinOrder,MaxDiscount,StartDate,EndDate,UsageLimit,PerUserLimit,Active,UsedCount,CreatedAt\n';
    const csvRows = coupons.map(c => [
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

        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if (exists) {
          results.errors.push(`Row ${i + 1}: Coupon ${code} already exists`);
          continue;
        }

        await Coupon.create({
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
    
    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    
    // Build usage filter
    const usageFilter: any = {};
    if (Object.keys(dateFilter).length > 0) usageFilter.usedAt = dateFilter;
    if (couponId) usageFilter.couponId = couponId;

    // Aggregate usage statistics
    const [usageStats, topCoupons, recentUsage] = await Promise.all([
      // Overall usage stats
      CouponUsage.aggregate([
        { $match: usageFilter },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: 1 },
            totalDiscount: { $sum: '$discountAmount' },
            totalOrderValue: { $sum: '$orderTotal' },
            avgDiscount: { $avg: '$discountAmount' },
            avgOrderValue: { $avg: '$orderTotal' },
          }
        }
      ]),
      
      // Top performing coupons
      CouponUsage.aggregate([
        { $match: usageFilter },
        {
          $group: {
            _id: '$couponCode',
            usageCount: { $sum: 1 },
            totalDiscount: { $sum: '$discountAmount' },
            totalOrderValue: { $sum: '$orderTotal' },
            avgDiscount: { $avg: '$discountAmount' },
          }
        },
        { $sort: { usageCount: -1 } },
        { $limit: 10 }
      ]),
      
      // Recent usage activity
      CouponUsage.find(usageFilter)
        .sort({ usedAt: -1 })
        .limit(20)
        .populate('couponId', 'code type value')
    ]);

    // Usage by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usageByDate = await CouponUsage.aggregate([
      { $match: { usedAt: { $gte: thirtyDaysAgo }, ...usageFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$usedAt' } },
          count: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.json({
      overview: usageStats[0] || {
        totalUsage: 0,
        totalDiscount: 0,
        totalOrderValue: 0,
        avgDiscount: 0,
        avgOrderValue: 0,
      },
      topCoupons,
      recentUsage,
      usageByDate,
    });
  } catch (err) {
    console.error('Get coupon analytics error:', err);
    return res.status(500).json({ message: 'Server error while fetching analytics' });
  }
}
