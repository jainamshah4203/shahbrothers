import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { trackCouponUsage } from './couponsController';
// Use require to avoid TS typing issues with pdfkit
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument: any = require('pdfkit');

const mapOrder = (o: any) => {
  const items = Array.isArray(o.items)
    ? o.items.map((it: any) => {
        const prod = it?.product || {};
        let img: any = it?.snapshot?.image;
        if (!img) {
          const imgs = prod?.images || [];
          const idx = Math.max(0, Math.min((prod?.heroIndex ?? 0), Math.max(0, imgs.length - 1)));
          const entry = imgs[idx];
          img = (prod?.mainImageUrl) || entry?.url || entry || '';
        }
        if (typeof img === 'object' && img) img = img.url || '';
        const pImgsRaw: any[] = Array.isArray(prod?.images) ? prod.images : [];
        const pImgs: string[] = pImgsRaw.map((e: any) => (typeof e === 'string' ? e : e?.url || '')).filter(Boolean);
        const pMain = (typeof prod?.mainImageUrl === 'string' && prod.mainImageUrl) || pImgs[0] || '';
        return {
          id: it.id,
          product: { name: it?.snapshot?.name || prod?.name, slug: prod?.slug, mainImageUrl: pMain, images: pImgs },
          quantity: it.quantity,
          size: it.size,
          color: it.color,
          price: it?.snapshot?.price ?? 0,
          image: typeof img === 'string' ? img : '',
        };
      })
    : [];
    
  const invString = o.invoiceNumber ? `INV-${new Date(o.createdAt || new Date()).getFullYear()}-${String(o.invoiceNumber).padStart(6, '0')}` : undefined;

  return {
    id: o.id,
    userId: o.userId,
    email: o.email,
    invoiceNumber: invString,
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

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ['Processing', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Failed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } }
    });
    return res.json({ order: mapOrder(updated) });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error while updating status' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Server error while deleting order' });
  }
};

export const listOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || '10'), 10)));
    const skip = (page - 1) * limit;
    const email = String(req.query.email || '').trim();
    const status = String(req.query.status || '').trim();
    const paymentMethod = String(req.query.paymentMethod || '').trim();

    const filter: any = {};
    if (email) filter.email = { contains: email, mode: 'insensitive' };
    if (status) filter.status = status;
    if (paymentMethod) {
      if (paymentMethod === 'Online') {
        filter.paymentMethod = { not: 'COD' };
      } else {
        filter.paymentMethod = paymentMethod;
      }
    }

    const items = await prisma.order.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: { include: { product: true } } }
    });
    
    const count = await prisma.order.count({ where: filter });

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

    const orderItemsToCreate: any[] = [];
    let total = 0;
    for (const it of items) {
      const pid = typeof it.product === 'string' ? it.product : it.product?.id || it.product?._id;
      if (!pid) continue;
      const product = await prisma.product.findUnique({ where: { id: pid } });
      if (!product) continue;
      
      const price = product ? (product.salePrice ?? product.price) : Number(it.snapshot?.price || 0);
      const prodName = product ? product.name : String(it.snapshot?.name || 'Item');
      const pImages: any = product?.images;
      const image = Array.isArray(pImages) ? (pImages[0]?.url || pImages[0]) : it.snapshot?.image;
      
      const snap = { name: prodName, price, salePrice: product?.salePrice, image } as any;
      const qty = Math.max(1, Number(it.quantity || it.qty || 1));
      total += price * qty;
      
      orderItemsToCreate.push({
        productId: product.id,
        quantity: qty,
        size: it.size,
        color: it.color,
        snapshot: snap,
      });
    }

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

    let couponDiscount = 0;
    let finalTotal = total;
    let appliedCoupon: any = null;
    
    if (coupon && coupon.code) {
      const code = String(coupon.code).toUpperCase().trim();
      const found = await prisma.coupon.findUnique({ where: { code } });
      if (found) {
        const now = new Date();
        const minOrderOk = typeof found.minOrder !== 'number' || found.minOrder === null || total >= found.minOrder;
        const withinStart = !found.startDate || found.startDate <= now;
        const withinEnd = !found.endDate || found.endDate >= now;
        const active = !!found.active;
        const usageOk = typeof found.usageLimit !== 'number' || found.usageLimit === null || (found.usedCount < found.usageLimit);
        
        let perUserOk = true;
        if (typeof found.perUserLimit === 'number' && found.perUserLimit > 0) {
          const filter: any = { couponId: found.id };
          if (req.userId) filter.userId = req.userId; else if (extractedEmail) filter.email = extractedEmail;
          const used = await prisma.couponUsage.count({ where: filter });
          perUserOk = used < found.perUserLimit;
        }
        if (active && withinStart && withinEnd && minOrderOk && usageOk && perUserOk) {
          if (found.type === 'percent') {
            couponDiscount = (total * found.value) / 100;
            if (typeof found.maxDiscount === 'number' && found.maxDiscount !== null) couponDiscount = Math.min(couponDiscount, found.maxDiscount);
          } else {
            couponDiscount = Math.min(found.value, total);
          }
          couponDiscount = Math.max(0, Math.floor(couponDiscount));
          finalTotal = Math.max(0, total - couponDiscount);
          appliedCoupon = found;
        }
      }
    }

    const sf = Math.max(0, Number(shippingFee || 0));
    finalTotal += sf;

    const initialStatus = requestedStatus === 'Failed' ? 'Failed' : 'Processing';
    
    const created = await prisma.order.create({
      data: {
        userId: req.userId || null,
        email: extractedEmail,
        notes: typeof notes === 'string' && notes.trim() ? notes.trim() : undefined,
        subtotal: total,
        discount: 0,
        couponDiscount,
        shippingFee: sf,
        total: finalTotal,
        totalAmount: finalTotal,
        status: initialStatus,
        paymentMethod: paymentMethod || 'COD',
        shippingAddress: addr as any,
        transactionId: transactionId ? String(transactionId) : null,
        items: {
          create: orderItemsToCreate
        }
      },
      include: { items: { include: { product: true } } }
    });
    
    if (appliedCoupon && couponDiscount > 0) {
      await trackCouponUsage(
        appliedCoupon.code,
        created.id,
        req.userId,
        extractedEmail,
        total,
        couponDiscount
      );
    }

    const mapped = mapOrder(created);
    return res.status(201).json({ orderId: created.id, order: mapped });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Server error while creating order' });
  }
};

export const getMyOrders = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const orders = await prisma.order.findMany({ 
      where: { userId }, 
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
    return res.json({ orders: orders.map(mapOrder) });
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

export const getUserOrders = async (req: Request & { userId?: string }, res: Response) => {
  return getMyOrders(req, res);
};

export const listByEmail = async (req: Request, res: Response) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const orders = await prisma.order.findMany({ 
      where: { email: { equals: email, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
    return res.json({ orders: orders.map(mapOrder) });
  } catch (error) {
    console.error('List by email error:', error);
    return res.status(500).json({ message: 'Server error while fetching orders by email' });
  }
};

export const getOrderById = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ 
      where: { id },
      include: { items: { include: { product: true } } }
    });
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
    const order = await prisma.order.findUnique({ 
      where: { id },
      include: { items: { include: { product: true } } }
    });
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

export const markOrderPaid = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body || {};
    const update: any = { status: 'Paid' };
    if (transactionId) update.transactionId = String(transactionId);
    const updated = await prisma.order.update({ 
      where: { id },
      data: update,
      include: { items: { include: { product: true } } }
    });
    return res.json({ order: mapOrder(updated) });
  } catch (error) {
    console.error('Mark order paid error:', error);
    return res.status(500).json({ message: 'Server error while marking order paid' });
  }
};

export const generateInvoicePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const order = await prisma.order.findUnique({ 
      where: { id },
      include: { items: { include: { product: true } } }
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const filename = `invoice-${order.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    doc.pipe(res);

    const companyName = process.env.COMPANY_NAME || 'Shah Brothers';
    const companyGst = process.env.COMPANY_GST || '24AAACH7409R2Z6';
    const companyAddress = process.env.COMPANY_ADDRESS || '';

    doc.fontSize(20).font('Helvetica-Bold').text(companyName, 40, 40);
    if (companyAddress) doc.fontSize(10).font('Helvetica').text(companyAddress, 40, 65);
    doc.fontSize(10).text(`GST: ${companyGst}`, 40, 80);

    const metaX = 280;
    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    doc.roundedRect(metaX, 40, 200, 80, 6).strokeColor('#dddddd').stroke();
    doc.fontSize(10).fillColor('#000000');
    
    const invString = order.invoiceNumber ? `INV-${createdAt.getFullYear()}-${String(order.invoiceNumber).padStart(6, '0')}` : '—';
    doc.text(`Invoice #: ${invString}`, metaX + 10, 50);
    doc.text(`Order ID: ${order.id}`, metaX + 10);
    doc.text(`Date: ${createdAt.toLocaleString()}`, metaX + 10);
    doc.text(`Payment: ${order.paymentMethod || '—'}`, metaX + 10);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCode = require('qrcode');
      const site = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
      const orderUrl = `${site}/orders/${order.id}`;
      const qr = await QRCode.toBuffer(orderUrl, { type: 'png', width: 84, margin: 1 });
      const qrX = doc.page.width - 110;
      const qrY = 40;
      doc.image(qr, qrX, qrY, { fit: [84, 84] });
      doc.fontSize(8).fillColor('#6b7280').text('Scan for status', qrX, qrY + 88, { width: 84, align: 'center' }).fillColor('#000000');
    } catch {}

    const yStart = 140;
    const colW = 260;
    doc.font('Helvetica-Bold').fontSize(12).text('Bill To', 40, yStart);
    doc.font('Helvetica').fontSize(10);
    
    const shippingAddress: any = order.shippingAddress || {};
    doc.text(shippingAddress?.name || '—', 40, yStart + 15);
    if (order.email) doc.text(order.email, 40);
    if (shippingAddress?.phone) doc.text(shippingAddress.phone, 40);

    doc.font('Helvetica-Bold').fontSize(12).text('Ship To', 40 + colW, yStart);
    doc.font('Helvetica').fontSize(10);
    doc.text(shippingAddress?.street || '', 40 + colW, yStart + 15);
    const cityLine = [shippingAddress?.city, shippingAddress?.state, shippingAddress?.zipCode].filter(Boolean).join(', ');
    if (cityLine) doc.text(cityLine, 40 + colW);
    if (shippingAddress?.country) doc.text(shippingAddress.country, 40 + colW);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');
      const fontPath = process.env.PDF_FONT_PATH || path.join(process.cwd(), 'assets', 'fonts', 'NotoSans-Regular.ttf');
      if (fontPath) {
        doc.registerFont('Body', fontPath);
        doc.font('Body');
      }
    } catch {}

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

    doc.font('Helvetica').fontSize(10);
    let y = tableTop + 30;
    const unicodeFontLoaded = (doc as any)._font && (doc as any)._font.name === 'Body';
    const formatINR = (num: number) => `${unicodeFontLoaded ? '₹' : 'Rs.'}${Number(num).toLocaleString('en-IN')}`;
    
    (order.items || []).forEach((it: any) => {
      const snap: any = it?.snapshot || {};
      const name = it?.product?.name || snap?.name || 'Item';
      const qty = it?.quantity || 0;
      const price = Number(it?.price || snap?.price || 0);
      const line = price * qty;

      doc.text(name, cols[0], y, { width: 230 });
      doc.text(String(qty), cols[2], y);
      doc.font(unicodeFontLoaded ? 'Body' : 'Helvetica');
      doc.text(formatINR(price), cols[3], y);
      doc.text(formatINR(line), cols[4], y);
      doc.font('Helvetica');

      y += 20;
    });

    const subtotal = order.subtotal ?? order.total ?? 0;
    const couponVal = order.couponDiscount ?? 0;
    const shipping = order.shippingFee ?? 0;
    const totalVal = order.total ?? 0;

    const totalsY = y + 10;
    const totalsX = 320;
    const totalsW = 235;
    const amtRight = totalsX + totalsW - 10;
    const amtWidth = 60;
    doc.roundedRect(totalsX, totalsY, totalsW, 96, 6).strokeColor('#dddddd').stroke();
    doc.font('Helvetica').fontSize(10);
    doc.text('Subtotal', totalsX + 10, totalsY + 10);
    doc.font(unicodeFontLoaded ? 'Body' : 'Helvetica');
    doc.text(formatINR(subtotal), amtRight - amtWidth, totalsY + 10, { width: amtWidth, align: 'right' });
    if (couponVal > 0) {
      doc.text('Discount', totalsX + 10, totalsY + 28);
      doc.text(`-${formatINR(couponVal)}`, amtRight - amtWidth, totalsY + 28, { width: amtWidth, align: 'right' });
    }
    if (shipping > 0) {
      doc.text('Shipping', totalsX + 10, totalsY + 46);
      doc.text(formatINR(shipping), amtRight - amtWidth, totalsY + 46, { width: amtWidth, align: 'right' });
    }
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Amount Payable', totalsX + 10, totalsY + 66);
    doc.text(formatINR(totalVal), amtRight - amtWidth, totalsY + 66, { width: amtWidth, align: 'right' });
    doc.font('Helvetica');

    doc.moveDown(6);
    doc.font('Helvetica').fontSize(9).fillColor('#666666').text(
      `Thank you for shopping with ${companyName}. All sales are subject to our return & replacement policy.\n` +
      `Returns accepted within 7 days of delivery if the item is unused and in original condition with tags.\n` +
      `For support, contact ${process.env.SUPPORT_EMAIL || 'support@shahbrothers.example'}.`,
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
