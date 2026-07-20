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
};

async function getProduct(id: string): Promise<Product | null> {
  try {
    const data: any = await apiGet(`/products/${id}`);
    return data?.product ?? null;
  } catch {
    return null;
  }
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
  const adjectives = ["premium", "handcrafted", "minimal", "heritage", "timeless", "elegant", "versatile", "everyday"];
  const fabrics = ["cotton", "linen", "silk blend", "wool blend", "rayon", "modal"];
  const fits = ["regular fit", "relaxed fit", "tailored fit", "slim fit"];
  const care = ["machine wash cold", "hand wash only", "dry clean recommended", "line dry in shade"];
  const seed = hashSeed(`${name}|${category}`);
  const a = pick(adjectives, seed, 101);
  const f = pick(fabrics, seed, 202);
  const fit = pick(fits, seed, 303);
  const c = pick(care, seed, 404);
  return `${name} is a ${a} ${category.toLowerCase()} crafted in soft ${f}. Designed for ${fit} comfort with attention to detail. Care: ${c}.`;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <div className="min-h-screen">
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
    </div>
  );
}
