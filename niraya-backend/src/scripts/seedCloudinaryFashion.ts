import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Product } from '../models/Product';
import { v2 as cloudinary } from 'cloudinary';

/*
  This script seeds several women's apparel products with 4-5 images each.
  It uploads images to Cloudinary first (under folder: niraya/products/<slug>)
  and then saves the Cloudinary secure URLs into the Product.images field
  with heroIndex = 0.

  Usage:
  1) Ensure you have these in niraya-backend/.env
     CLOUDINARY_CLOUD_NAME=YOUR_CLOUD
     CLOUDINARY_API_KEY=YOUR_KEY
     CLOUDINARY_API_SECRET=YOUR_SECRET

  2) Install dependency (in niraya-backend):
     npm i cloudinary

  3) Run:
     npx ts-node src/scripts/seedCloudinaryFashion.ts
*/

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PRODUCTS: Array<{
  name: string;
  slug: string;
  description: string;
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Knitwear' | 'Shoes' | 'Accessories';
  price: number;
  salePrice?: number;
  stock: number;
  sizes: string[];
  colors: { name: string; hex?: string }[];
  brand?: string;
}> = [
  {
    name: 'A-Line Midi Dress',
    slug: 'a-line-midi-dress',
    description: 'Flowy midi dress with a flattering A-line cut and waist tie.',
    category: 'Dresses',
    price: 2799,
    salePrice: 2499,
    stock: 42,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Sage', hex: '#9CAF88' }, { name: 'Black', hex: '#000000' }],
    brand: 'Niraya Studio',
  },
  {
    name: 'High-Rise Wide Pants',
    slug: 'high-rise-wide-pants',
    description: 'Comfortable wide-leg pants with a flattering fit.',
    category: 'Bottoms',
    price: 2499,
    stock: 35,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Black', hex: '#000000' }],
    brand: 'Niraya Essentials',
  },
  {
    name: 'Classic Linen Shirt',
    slug: 'classic-linen-shirt',
    description: 'Breathable linen shirt perfect for summer days.',
    category: 'Tops',
    price: 1999,
    salePrice: 1799,
    stock: 50,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Beige', hex: '#F5F5DC' }, { name: 'White', hex: '#FFFFFF' }],
    brand: 'Niraya Studio',
  },
  {
    name: 'Cable Knit Sweater',
    slug: 'cable-knit-sweater',
    description: 'Chunky cable knit sweater for cozy evenings.',
    category: 'Knitwear',
    price: 2299,
    stock: 28,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Oatmeal', hex: '#E6D8C3' }],
    brand: 'Niraya Cozy',
  },
  {
    name: 'Tailored Blazer',
    slug: 'tailored-blazer',
    description: 'Single-breasted blazer with notch lapel and structured shoulders.',
    category: 'Outerwear',
    price: 4999,
    stock: 18,
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Charcoal', hex: '#36454F' }],
    brand: 'Niraya Atelier',
  },
];

// For demo, we generate 5 distinct images per product using picsum seeds.
// Later we can swap these with curated Unsplash/Pexels URLs.
function sourceUrlsFor(slug: string): string[] {
  const baseSeeds = ['front', 'back', 'side', 'detail', 'onmodel'];
  return baseSeeds.map((tag) => `https://picsum.photos/seed/${encodeURIComponent(slug + '-' + tag)}/800/1000`);
}

async function uploadImagesToCloudinary(slug: string, urls: string[]): Promise<string[]> {
  const folder = `niraya/products/${slug}`;
  const uploaded: string[] = [];
  for (const [idx, url] of urls.entries()) {
    const publicId = `${slug}-${idx + 1}`;
    const res = await cloudinary.uploader.upload(url, {
      folder,
      public_id: publicId,
      overwrite: true,
      transformation: [{ fetch_format: 'auto', quality: 'auto' }],
    });
    uploaded.push(res.secure_url || res.url);
    console.log(`✓ Uploaded ${slug} image ${idx + 1}: ${res.secure_url}`);
  }
  return uploaded;
}

async function run() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary env not set. See header comment.');
  }
  await connectDB();
  console.log('Connected. Seeding Cloudinary-backed products...');

  for (const p of PRODUCTS) {
    const urls = sourceUrlsFor(p.slug);
    const cloudUrls = await uploadImagesToCloudinary(p.slug, urls);

    const payload: any = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      category: p.category,
      sizes: p.sizes,
      colors: p.colors,
      stock: p.stock,
      brand: p.brand,
      images: cloudUrls.map((u) => ({ url: u })),
      heroIndex: 0,
      material: 'Cotton Blend',
      careInstructions: ['Machine wash cold', 'Do not bleach', 'Tumble dry low'],
      featured: false,
      isNewProduct: true,
      isBestseller: false,
      limited: false,
    };

    // Upsert by slug
    const existing = await Product.findOne({ slug: p.slug });
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: payload });
      console.log(`↺ Updated existing product: ${p.slug}`);
    } else {
      await Product.create(payload);
      console.log(`＋ Created product: ${p.slug}`);
    }
  }

  console.log('✅ Done. Products now reference Cloudinary image URLs.');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
