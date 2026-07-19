import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BuyBox from "@/components/product/BuyBox";
import Gallery from "@/components/product/Gallery";
import Reviews from "@/components/product/Reviews";
import { apiGet } from "@/lib/api";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  stock: number;
  slug?: string;
  isNewProduct?: boolean;
  isBestseller?: boolean;
  limited?: boolean;
};

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const data: any = await apiGet(`/products/slug/${slug}`);
    return data?.product ?? null;
  } catch {
    return null;
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

    return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-10">
        {!product ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-semibold">Product not found</h1>
            <p className="text-muted-foreground mt-2">Please go back to Collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Gallery images={product.images ?? ["/placeholder.svg"]} alt={product.name} />
            <div>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <h1 className="text-3xl font-serif mt-1">{product.name}</h1>
              {/* Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {product.isNewProduct && (
                  <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground">NEW</span>
                )}
                {product.isBestseller && (
                  <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground">BEST SELLER</span>
                )}
                {product.limited && (
                  <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded border">LIMITED</span>
                )}
                {product.salePrice && product.salePrice < product.price && (
                  <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-destructive text-destructive-foreground">-
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl font-semibold">₹{product.salePrice.toLocaleString("en-IN")}</span>
                    <span className="text-muted-foreground line-through">₹{product.price.toLocaleString("en-IN")}</span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold">₹{product.price.toLocaleString("en-IN")}</span>
                )}
              </div>
              <p className="mt-4 text-muted-foreground leading-7">
                {(product.description && product.description.trim().length > 0)
                  ? product.description
                  : generateDeterministicDescription(product.name, product.category)}
              </p>

              <BuyBox product={{
                _id: product._id,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice,
                images: product.images,
                category: product.category,
                stock: product.stock,
                sizes: product.sizes,
                colors: product.colors,
              }} />
              <Reviews productId={product._id} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function hashSeed(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, salt: number): T {
  const idx = Math.abs(((seed ^ salt) >>> 0)) % arr.length;
  return arr[idx];
}

function generateDeterministicDescription(name: string, category: string): string {
  const adjectives = ["premium", "durable", "minimal", "innovative", "reliable", "elegant", "versatile", "everyday"];
  const materials = ["high-quality plastic", "metal", "eco-friendly materials", "premium paper", "stainless steel", "wood"];
  const styles = ["ergonomic comfort", "professional use", "creative expressions", "smooth performance"];
  const care = ["keep away from direct sunlight", "store in a cool place", "wipe with dry cloth", "handle with care"];
  const seed = hashSeed(`${name}|${category}`);
  const a = pick(adjectives, seed, 101);
  const m = pick(materials, seed, 202);
  const style = pick(styles, seed, 303);
  const c = pick(care, seed, 404);
  return `${name} is a ${a} ${category.toLowerCase()} crafted from ${m}. Designed for ${style} with attention to detail. Care: ${c}.`;
}
