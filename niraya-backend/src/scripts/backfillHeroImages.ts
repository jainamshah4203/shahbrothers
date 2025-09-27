import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';

dotenv.config({ path: process.cwd() + '/.env' });

async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/niraya';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Find orders where any item snapshot.image is missing
  const cursor = Order.find({ 'items.snapshot.image': { $in: [null, '', undefined] } })
    .populate('items.product', 'images heroIndex')
    .cursor();

  let processed = 0;
  for await (const order of cursor) {
    let touched = false;
    const o: any = order;
    if (Array.isArray(o.items)) {
      for (const it of o.items) {
        if (!it?.snapshot) it.snapshot = {};
        if (!it?.snapshot?.image) {
          const p: any = it?.product;
          let image = '';
          if (p) {
            const idx = Math.max(0, Math.min(p.heroIndex ?? 0, (p.images?.length || 1) - 1));
            const entry = p.images?.[idx];
            image = entry?.url || entry || '';
          }
          if (image) {
            it.snapshot.image = image;
            touched = true;
          }
        }
      }
    }
    if (touched) {
      await order.save();
      processed++;
      console.log(`Updated order ${order._id}`);
    }
  }

  console.log(`Backfill done. Updated ${processed} orders.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Backfill error:', err);
  process.exit(1);
});
