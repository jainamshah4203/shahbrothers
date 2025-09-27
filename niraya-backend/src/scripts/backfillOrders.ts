import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Order } from '../models/Order';

async function backfill() {
  dotenv.config();
  await connectDB();

  const orders = await Order.find({});
  let updated = 0;

  for (const o of orders) {
    const addr: any = o.shippingAddress || {};

    // Extract robustly
    const extractedName = addr.name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || undefined;
    const extractedPhone = addr.phone || addr.phoneNumber || addr.mobile || undefined;
    const extractedEmail = o.email || addr.email || addr.contactEmail || undefined;

    // Compute subtotal if missing
    let computedSubtotal: number | undefined = undefined;
    if (Array.isArray(o.items) && o.items.length > 0) {
      computedSubtotal = o.items.reduce((sum: number, it: any) => {
        const price = typeof it?.snapshot?.price === 'number' ? it.snapshot.price : 0;
        const qty = Math.max(1, Number(it?.quantity || 1));
        return sum + price * qty;
      }, 0);
    }

    const patch: any = {};
    // Address
    const setAddr: any = { ...addr };
    if (!setAddr.name && extractedName) setAddr.name = extractedName;
    if (!setAddr.phone && extractedPhone) setAddr.phone = extractedPhone;

    // Only set if we actually changed something
    if (JSON.stringify(setAddr) !== JSON.stringify(addr)) {
      patch.shippingAddress = setAddr;
    }

    if (!o.email && extractedEmail) patch.email = extractedEmail;

    if (o.subtotal == null && computedSubtotal != null) patch.subtotal = computedSubtotal;
    if (o.totalAmount == null && (o.total != null)) patch.totalAmount = o.total;
    if (o.discount == null) patch.discount = 0;
    if (o.couponDiscount == null) patch.couponDiscount = 0;

    if (Object.keys(patch).length > 0) {
      await Order.updateOne({ _id: o._id }, { $set: patch });
      updated++;
    }
  }

  console.log(`✅ Backfill complete. Updated ${updated} order(s).`);
  process.exit(0);
}

backfill().catch((e) => {
  console.error('❌ Backfill failed:', e);
  process.exit(1);
});
