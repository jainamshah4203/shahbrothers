import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Category } from '../models/Category';

async function run() {
  dotenv.config();
  await connectDB();

  const seeds = [
    { name: 'Tops', slug: 'tops', description: 'Shirts, tees and blouses' },
    { name: 'Bottoms', slug: 'bottoms', description: 'Pants, jeans and skirts' },
    { name: 'Dresses', slug: 'dresses', description: 'Casual and formal dresses' },
    { name: 'Outerwear', slug: 'outerwear', description: 'Jackets and coats' },
    { name: 'Knitwear', slug: 'knitwear', description: 'Sweaters and cardigans' },
    { name: 'Shoes', slug: 'shoes', description: 'Footwear' },
    { name: 'Accessories', slug: 'accessories', description: 'Belts, scarves, jewelry' },
  ];

  await Category.deleteMany({ slug: { $in: seeds.map(s => s.slug) } });
  await Category.insertMany(seeds);
  console.log('✅ Seeded categories');
  process.exit(0);
}

run().catch((e) => { console.error('❌ seedCategories failed:', e); process.exit(1); });
