import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Order } from '../models/Order';
import { nextSequence } from '../models/Counter';

async function run() {
  dotenv.config();
  await connectDB();

  const filter: any = { $or: [{ invoiceNumber: { $exists: false } }, { invoiceNumber: null }, { invoiceNumber: '' }] };
  const orders = await Order.find(filter).sort({ createdAt: 1 });
  if (orders.length === 0) {
    console.log('No orders require invoice numbers.');
    process.exit(0);
  }

  let updated = 0;
  for (const o of orders) {
    try {
      const seq = await nextSequence('invoice');
      const yyyy = (o.createdAt ? new Date(o.createdAt) : new Date()).getFullYear();
      const inv = `INV-${yyyy}-${String(seq).padStart(6, '0')}`;
      await Order.updateOne({ _id: o._id }, { $set: { invoiceNumber: inv } });
      updated++;
      if (updated % 50 === 0) console.log(`Assigned ${updated} invoice numbers...`);
    } catch (e) {
      console.error(`Failed to assign invoice for order ${o._id}:`, e);
    }
  }

  console.log(`✅ Backfill complete. Assigned invoice numbers to ${updated} order(s).`);
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Backfill failed:', e);
  process.exit(1);
});
