import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Product } from '../models/Product';
import { Variant } from '../models/Variant';

function pick<T>(arr: T[], n: number): T[] {
  const out: T[] = [];
  const copy = [...arr];
  while (out.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

async function run() {
  dotenv.config();
  await connectDB();

  const products = await Product.find({}).limit(12);
  if (!products.length) {
    console.log('No products found. Please run the seed script for products first.');
    process.exit(0);
  }

  console.log(`Creating variants for ${products.length} products...`);

  for (const p of products) {
    const colors: string[] = Array.isArray(p.colors) ? p.colors.map((c: any) => (typeof c === 'string' ? c : c?.name)).filter(Boolean) : [];
    const sizes: string[] = Array.isArray(p.sizes) ? p.sizes : [];

    const colorChoices = colors.length ? pick(colors, Math.min(colors.length, 2)) : ['Default'];
    const sizeChoices = sizes.length ? pick(sizes, Math.min(sizes.length, 2)) : ['Std'];

    for (const c of colorChoices) {
      for (const s of sizeChoices) {
        const mrp = Number(p.price) || 999;
        const base = Number(p.salePrice ?? p.price) || mrp;
        const discount = Math.floor(Math.random() * 20); // up to 20%
        const price = Math.max(1, Math.round(base * (1 - discount / 100)));
        const sku = `${p.slug}-${String(c).toLowerCase().replace(/\s+/g,'')}-${String(s).toLowerCase()}`.slice(0, 40);

        const existing = await Variant.findOne({ productId: p._id, color: c, size: s });
        if (existing) continue;

        await Variant.create({
          productId: p._id,
          sku,
          color: c,
          size: s,
          mrp,
          price,
          stock: Math.floor(Math.random() * 50) + 1,
          discountPercent: mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0,
          images: (Array.isArray(p.images) ? p.images.map((im: any) => (typeof im === 'string' ? im : im?.url)).filter(Boolean) : []).slice(0, 2),
        });
      }
    }
  }

  console.log('✅ Variant seeding completed.');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ seedVariants failed:', err);
  process.exit(1);
});
