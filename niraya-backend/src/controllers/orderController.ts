import { Request, Response } from 'express';
import { Order, IOrder, IOrderItem } from '../models/Order';
import { Product } from '../models/Product';
import { Types } from 'mongoose';
import { trackCouponUsage } from './couponsController';
import { Coupon } from '../models/Coupon';
import { CouponUsage } from '../models/CouponUsage';
import { nextSequence } from '../models/Counter';
// Use require to avoid TS typing issues with pdfkit
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument: any = require('pdfkit');

function toObjectId(id?: string): Types.ObjectId | undefined {
  try {
    return id && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;
  } catch {
    return undefined;
  }
}

const mapOrder = (order: any) => {
  const o = typeof order.toObject === 'function' ? order.toObject() : order;
  const items = Array.isArray(o.items)
    ? o.items.map((it: any) => {
        const prod = it?.product || {};
        // Normalize image into a plain string
        let img: any = it?.snapshot?.image;
        if (!img) {
          const imgs = prod?.images || [];
          const idx = Math.max(0, Math.min((prod?.heroIndex ?? 0), Math.max(0, imgs.length - 1)));
          const entry = imgs[idx];
          img = (prod?.mainImageUrl) || entry?.url || entry || '';
        }
        if (typeof img === 'object' && img) img = img.url || '';
        // Normalize product images to string[] for frontend fallback
        const pImgsRaw: any[] = Array.isArray(prod?.images) ? prod.images : [];
        const pImgs: string[] = pImgsRaw.map((e: any) => (typeof e === 'string' ? e : e?.url || '')).filter(Boolean);
        const pMain = (typeof prod?.mainImageUrl === 'string' && prod.mainImageUrl) || pImgs[0] || '';
        return {
          _id: it._id,
          product: { name: it?.snapshot?.name || prod?.name, slug: prod?.slug, mainImageUrl: pMain, images: pImgs },
          quantity: it.quantity,
          size: it.size,
          color: it.color,
          price: it?.snapshot?.price ?? 0,
          image: typeof img === 'string' ? img : '',
        };
      })
    : [];
  return {
    _id: o._id,
    userId: o.userId,
    email: o.email,
    invoiceNumber: o.invoiceNumber,
    transactionId: o.transactionId,
    paymentMethod: o.paymentMethod,
    notes: o.notes,
    items,
    itemsCount: items.length,
    subtotal: o.subtotal ?? o.total,
    discount: o.discount ?? 0,
    couponDiscount: o.couponDiscount ?? 0,
    shippingFee: o.shippingFee ?? 0,
    total: (o.total ?? 0),
    totalAmount: (o.totalAmount ?? o.total ?? 0),
    status: o.status,
    shippingAddress: o.shippingAddress,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
};

// Admin: update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const allowed = ['Processing', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Failed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updated = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    return res.json({ order: mapOrder(updated) });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error while updating status' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Server error while deleting order' });
  }
};

// Admin: list all orders with filters
export const listOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || '10'), 10)));
    const skip = (page - 1) * limit;
    const email = String(req.query.email || '').trim();
    const status = String(req.query.status || '').trim();
    const paymentMethod = String(req.query.paymentMethod || '').trim();

    const filter: any = {};
    if (email) filter.email = new RegExp(email, 'i');
    if (status) filter.status = status;
    if (paymentMethod) {
      if (paymentMethod === 'Online') {
        filter.paymentMethod = { $ne: 'COD' };
      } else {
        filter.paymentMethod = paymentMethod; // e.g., COD
      }
    }

    const [items, count] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('items.product', 'name images slug heroIndex'),
      Order.countDocuments(filter),
    ]);

    return res.json({
      orders: items.map(mapOrder),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNextPage: skip + items.length < count,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('List orders error:', error);
    return res.status(500).json({ message: 'Server error while listing orders' });
  }
};

export const createOrder = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { items, shippingAddress, email, paymentMethod, name, phone, contact, coupon, notes, shippingFee, status: requestedStatus, transactionId } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Build order items with snapshot and compute total
    const orderItems: IOrderItem[] = [] as any;
    let total = 0;
    for (const it of items) {
      const pid = typeof it.product === 'string' ? it.product : it.product?._id;
      const product = pid ? await Product.findById(pid) : null;
      const price = product ? (product.salePrice ?? product.price) : Number(it.snapshot?.price || 0);
      const name = product ? product.name : String(it.snapshot?.name || 'Item');
      const image = (product as any)?.mainImageUrl
        || (Array.isArray((product as any)?.images) ? ((product as any).images?.[0]?.url || (product as any).images?.[0]) : undefined)
        || it.snapshot?.image;
      const snap = { name, price, salePrice: product?.salePrice, image } as any;
      const qty = Math.max(1, Number(it.quantity || it.qty || 1));
      total += price * qty;
      orderItems.push({
        product: toObjectId(pid)!,
        quantity: qty,
        size: it.size,
        color: it.color,
        snapshot: snap,
      } as IOrderItem);
    }

    // Robust extraction for customer identity fields
    const extractedName =
      (shippingAddress && (shippingAddress.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim())) ||
      name ||
      (contact && (contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim())) ||
      undefined;

    const extractedPhone =
      (shippingAddress && (shippingAddress.phone || shippingAddress.phoneNumber || shippingAddress.mobile)) ||
      phone ||
      (contact && (contact.phone || contact.phoneNumber || contact.mobile)) ||
      undefined;

    const extractedEmail =
      email ||
      (shippingAddress && (shippingAddress.email || shippingAddress.contactEmail)) ||
      (contact && (contact.email || contact.contactEmail)) ||
      (req as any)?.user?.email ||
      undefined;

    const addr = {
      ...(shippingAddress || {}),
      name: extractedName,
      phone: extractedPhone,
    };

    // Apply coupon discount if provided (server-side recompute for integrity)
    let couponDiscount = 0;
    let finalTotal = total;
    if (coupon && coupon.code) {
      const code = String(coupon.code).toUpperCase().trim();
      const found = await Coupon.findOne({ code });
      if (found) {
        const now = new Date();
        const minOrderOk = typeof found.minOrder !== 'number' || total >= (found.minOrder || 0);
        const withinStart = !found.startDate || found.startDate <= now;
        const withinEnd = !found.endDate || found.endDate >= now;
        const active = !!found.active;
        const usageOk = typeof found.usageLimit !== 'number' || (found.usedCount < (found.usageLimit || 0));
        // per-user check (email or userId)
        let perUserOk = true;
        if (typeof found.perUserLimit === 'number' && found.perUserLimit > 0) {
          const filter: any = { couponId: found._id };
          if (req.userId) filter.userId = req.userId; else if (extractedEmail) filter.email = extractedEmail;
          const used = await CouponUsage.countDocuments(filter);
          perUserOk = used < found.perUserLimit;
        }
        if (active && withinStart && withinEnd && minOrderOk && usageOk && perUserOk) {
          // compute server-side discount
          if (found.type === 'percent') {
            couponDiscount = (total * found.value) / 100;
            if (typeof found.maxDiscount === 'number') couponDiscount = Math.min(couponDiscount, found.maxDiscount);
          } else {
            couponDiscount = Math.min(found.value, total);
          }
          couponDiscount = Math.max(0, Math.floor(couponDiscount));
          finalTotal = Math.max(0, total - couponDiscount);
        }
      }
    }

    const sf = Math.max(0, Number(shippingFee || 0));
    finalTotal += sf;

    const initialStatus = requestedStatus === 'Failed' ? 'Failed' : 'Processing';
    const order: Partial<IOrder> = {
      userId: toObjectId(req.userId),
      email: extractedEmail,
      invoiceNumber: undefined, // will set before create
      notes: typeof notes === 'string' && notes.trim() ? notes.trim() : undefined,
      items: orderItems,
      subtotal: total,
      discount: 0,
      couponDiscount,
      shippingFee: sf,
      total: finalTotal,
      totalAmount: finalTotal,
      status: initialStatus,
      paymentMethod: paymentMethod || 'COD',
      shippingAddress: addr as any,
    };
    if (transactionId) (order as any).transactionId = transactionId;

    // Generate invoice number sequence
    try {
      const seq = await nextSequence('invoice');
      const yyyy = new Date().getFullYear();
      const inv = `INV-${yyyy}-${String(seq).padStart(6, '0')}`;
      (order as any).invoiceNumber = inv;
    } catch (e) {
      console.warn('Failed to generate invoice number, proceeding without it');
    }

    const created = await Order.create(order);
    
    // Track coupon usage if coupon was applied
    if (coupon && coupon.code && couponDiscount > 0) {
      await trackCouponUsage(
        coupon.code,
        created._id.toString(),
        req.userId,
        extractedEmail,
        total,
        couponDiscount
      );
    }

    const mapped = mapOrder(created);
    return res.status(201).json({ orderId: created._id, order: mapped });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Server error while creating order' });
  }
};

export const getMyOrders = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const userId = toObjectId(req.userId);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.json({ orders: orders.map(mapOrder) });
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

export const getUserOrders = async (req: Request & { userId?: string }, res: Response) => {
  // Alias for /users/me/orders
  return getMyOrders(req, res);
};

// Public: list orders by email (for customers to look up guest orders)
export const listByEmail = async (req: Request, res: Response) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const orders = await Order.find({ email }).sort({ createdAt: -1 });
    return res.json({ orders: orders.map(mapOrder) });
  } catch (error) {
    console.error('List by email error:', error);
    return res.status(500).json({ message: 'Server error while fetching orders by email' });
  }
};

export const getOrderById = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params;
    // NOTE: Public fetch by id (no ownership checks), per requirement that admin app is separate from main app

    // Validate ObjectId to avoid CastError -> 500
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(id).populate('items.product', 'name images slug heroIndex');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json({ order: mapOrder(order) });
  } catch (error) {
    console.error('Get order by id error:', error);
    return res.status(500).json({ message: 'Server error while fetching order' });
  }
};

export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = String((req.query.email as string) || '').trim();
    // Validate ObjectId to avoid CastError -> 500
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (email && order.email && order.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json({ order: mapOrder(order) });
  } catch (error) {
    console.error('Track order error:', error);
    return res.status(500).json({ message: 'Server error while tracking order' });
  }
};

// Mark an existing order as Paid (used after successful Razorpay payment from Pay Now)
export const markOrderPaid = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body || {};
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const update: any = { status: 'Paid' };
    if (transactionId) update.transactionId = String(transactionId);
    const updated = await Order.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    return res.json({ order: mapOrder(updated) });
  } catch (error) {
    console.error('Mark order paid error:', error);
    return res.status(500).json({ message: 'Server error while marking order paid' });
  }
};

// Stream server-generated Invoice PDF using pdfkit
export const generateInvoicePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid order id' });
    const order = await Order.findById(id).populate('items.product', 'name images slug heroIndex');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const filename = `invoice-${order._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    doc.pipe(res);

    // Company header
    const companyName = process.env.COMPANY_NAME || 'NIRAYA';
    const companyGst = process.env.COMPANY_GST || '24AAACH7409R2Z6';
    const companyAddress = process.env.COMPANY_ADDRESS || '';

    doc.fontSize(20).font('Helvetica-Bold').text(companyName, 40, 40);
    if (companyAddress) doc.fontSize(10).font('Helvetica').text(companyAddress, 40, 65);
    doc.fontSize(10).text(`GST: ${companyGst}`, 40, 80);

    // Invoice meta box (top right)
    const metaX = 280; // moved slightly left
    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    doc.roundedRect(metaX, 40, 200, 80, 6).strokeColor('#dddddd').stroke();
    doc.fontSize(10).fillColor('#000000');
    doc.text(`Invoice #: ${order.invoiceNumber || '—'}`, metaX + 10, 50);
    doc.text(`Order ID: ${order._id}`, metaX + 10);
    doc.text(`Date: ${createdAt.toLocaleString()}`, metaX + 10);
    doc.text(`Payment: ${order.paymentMethod || '—'}`, metaX + 10);

    // QR code in header - link to order details page for status (top-right corner)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCode = require('qrcode');
      const site = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
      const orderUrl = `${site}/orders/${order._id}`;
      const qr = await QRCode.toBuffer(orderUrl, { type: 'png', width: 84, margin: 1 });
      const qrX = doc.page.width - 110; // nudge further right
      const qrY = 40;
      doc.image(qr, qrX, qrY, { fit: [84, 84] });
      doc.fontSize(8).fillColor('#6b7280').text('Scan for status', qrX, qrY + 88, { width: 84, align: 'center' }).fillColor('#000000');
    } catch {}

    // Bill To / Ship To
    const yStart = 140;
    const colW = 260;
    doc.font('Helvetica-Bold').fontSize(12).text('Bill To', 40, yStart);
    doc.font('Helvetica').fontSize(10);
    doc.text(order.shippingAddress?.name || '—', 40, yStart + 15);
    if (order.email) doc.text(order.email, 40);
    if (order.shippingAddress?.phone) doc.text(order.shippingAddress.phone, 40);

    doc.font('Helvetica-Bold').fontSize(12).text('Ship To', 40 + colW, yStart);
    doc.font('Helvetica').fontSize(10);
    doc.text(order.shippingAddress?.street || '', 40 + colW, yStart + 15);
    const cityLine = [order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.zipCode].filter(Boolean).join(', ');
    if (cityLine) doc.text(cityLine, 40 + colW);
    if (order.shippingAddress?.country) doc.text(order.shippingAddress.country, 40 + colW);

    // Register unicode-safe font if available (for proper ₹ rendering)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');
      const fontPath = process.env.PDF_FONT_PATH || path.join(process.cwd(), 'assets', 'fonts', 'NotoSans-Regular.ttf');
      if (fontPath) {
        doc.registerFont('Body', fontPath);
        doc.font('Body');
      }
    } catch {}

    // Items table
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(12).text('Items');
    const tableTop = doc.y + 10;
    const cols = [40, 280, 350, 440, 500];
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Product', cols[0], tableTop);
    doc.text('Qty', cols[2], tableTop);
    doc.text('Price', cols[3], tableTop);
    doc.text('Line Total', cols[4], tableTop);

    doc.moveTo(40, tableTop + 20).lineTo(555, tableTop + 20).strokeColor('#000000').stroke();

    // Items rows
    doc.font('Helvetica').fontSize(10);
    let y = tableTop + 30;
    const unicodeFontLoaded = (doc as any)._font && (doc as any)._font.name === 'Body';
    const formatINR = (num: number) => `${unicodeFontLoaded ? '₹' : 'Rs.'}${Number(num).toLocaleString('en-IN')}`;
    (order.items || []).forEach((it: any) => {
      const name = it?.product?.name || it?.snapshot?.name || 'Item';
      const qty = it?.quantity || 0;
      const price = Number(it?.price || it?.snapshot?.price || 0);
      const line = price * qty;

      doc.text(name, cols[0], y, { width: 230 });
      doc.text(String(qty), cols[2], y);
      doc.font(unicodeFontLoaded ? 'Body' : 'Helvetica');
      doc.text(formatINR(price), cols[3], y);
      doc.text(formatINR(line), cols[4], y);
      doc.font('Helvetica');

      y += 20;
    });

    // Totals box (right aligned)
    const subtotal = order.subtotal ?? order.total ?? 0;
    const coupon = order.couponDiscount ?? 0;
    const shipping = order.shippingFee ?? 0;
    const total = order.total ?? 0;

    const totalsY = y + 10;
    // Enlarge totals box and shift a bit left
    const totalsX = 320;
    const totalsW = 235;
    const amtRight = totalsX + totalsW - 10; // right padding
    const amtWidth = 60;
    doc.roundedRect(totalsX, totalsY, totalsW, 96, 6).strokeColor('#dddddd').stroke();
    doc.font('Helvetica').fontSize(10);
    doc.text('Subtotal', totalsX + 10, totalsY + 10);
    doc.font(unicodeFontLoaded ? 'Body' : 'Helvetica');
    doc.text(formatINR(subtotal), amtRight - amtWidth, totalsY + 10, { width: amtWidth, align: 'right' });
    if (coupon > 0) {
      doc.text('Discount', totalsX + 10, totalsY + 28);
      doc.text(`-${formatINR(coupon)}`, amtRight - amtWidth, totalsY + 28, { width: amtWidth, align: 'right' });
    }
    if (shipping > 0) {
      doc.text('Shipping', totalsX + 10, totalsY + 46);
      doc.text(formatINR(shipping), amtRight - amtWidth, totalsY + 46, { width: amtWidth, align: 'right' });
    }
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Amount Payable', totalsX + 10, totalsY + 66);
    doc.text(formatINR(total), amtRight - amtWidth, totalsY + 66, { width: amtWidth, align: 'right' });
    doc.font('Helvetica');

    // Footer
    doc.moveDown(6);
    doc.font('Helvetica').fontSize(9).fillColor('#666666').text(
      `Thank you for shopping with ${companyName}. All sales are subject to our return & replacement policy.\n` +
      `Returns accepted within 7 days of delivery if the item is unused and in original condition with tags.\n` +
      `For support, contact ${process.env.SUPPORT_EMAIL || 'support@niraya.example'}.`,
      40,
      doc.y,
      { width: 500, align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Invoice PDF generation error:', error);
    return res.status(500).json({ message: 'Failed to generate invoice PDF' });
  }
};
