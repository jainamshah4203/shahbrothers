import BuyBox from "@/components/product/BuyBox";
import Gallery from "@/components/product/Gallery";
import Product3DPreview from "@/components/product/Product3DPreview";
import { ProductDetailTabs } from "@/components/product/Reviews";
import { apiGet } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatINR } from "@/lib/formatCurrency";

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
  isNewProduct?: boolean;
  isBestseller?: boolean;
  limited?: boolean;
};

async function getProduct(id: string): Promise<Product | null> {
  try {
    const data: { product?: Product } = await apiGet(`/products/${id}`);
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
  const idx = Math.abs((seed ^ salt) >>> 0) % arr.length;
  return arr[idx];
}

function generateDeterministicDescription(name: string, category: string): string {
  const adjectives = [
    "premium",
    "handcrafted",
    "minimal",
    "heritage",
    "timeless",
    "elegant",
    "versatile",
    "everyday",
  ];
  const fabrics = ["cotton", "linen", "silk blend", "wool blend", "rayon", "modal"];
  const fits = ["regular fit", "relaxed fit", "tailored fit", "slim fit"];
  const care = [
    "machine wash cold",
    "hand wash only",
    "dry clean recommended",
    "line dry in shade",
  ];
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
    <div className="min-h-screen bg-warm-off-white">
      <main className="container mx-auto px-4 py-12 md:py-16">
        {!product ? (
          <div className="py-32 text-center">
            <h1 className="mb-4 font-serif text-3xl text-charcoal-ink">Product not found</h1>
            <p className="font-sans text-muted-sepia">Please go back to Collections.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="relative">
                <div className="sticky top-24">
                  <Gallery images={product.images ?? ["/placeholder.svg"]} alt={product.name} />
                  <Product3DPreview productName={product.name} />
                </div>
              </div>

              <div className="relative">
                <div className="sticky top-24 space-y-8">
                  <div className="space-y-4 border-b border-charcoal-ink/10 pb-8">
                    <p className="font-sans text-sm font-medium uppercase tracking-widest text-muted-sepia">
                      {product.brand || product.category}
                    </p>
                    <h1 className="font-serif text-4xl text-charcoal-ink lg:text-5xl">{product.name}</h1>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {product.isNewProduct && <Badge>NEW ARRIVAL</Badge>}
                      {product.isBestseller && <Badge variant="secondary">BEST SELLER</Badge>}
                      {product.limited && <Badge variant="outline">LIMITED EDITION</Badge>}
                      {product.salePrice && product.salePrice < product.price && (
                        <Badge variant="destructive">
                          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      {product.salePrice ? (
                        <>
                          <span className="font-sans text-3xl font-semibold text-charcoal-ink">
                            {formatINR(product.salePrice)}
                          </span>
                          <span className="font-sans text-xl text-muted-sepia line-through decoration-muted-sepia/40">
                            {formatINR(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="font-sans text-3xl font-semibold text-charcoal-ink">
                          {formatINR(product.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <BuyBox
                    product={{
                      _id: product._id,
                      name: product.name,
                      price: product.price,
                      salePrice: product.salePrice,
                      images: product.images,
                      category: product.category,
                      stock: product.stock,
                      sizes: product.sizes,
                      colors: product.colors,
                    }}
                  />

                  <div className="pt-4">
                    <Accordion type="single" collapsible className="w-full" defaultValue="features">
                      <AccordionItem value="features">
                        <AccordionTrigger>Product Features</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc space-y-2.5 pl-5 font-sans text-muted-sepia">
                            <li>Premium quality materials selected for longevity</li>
                            <li>Designed for everyday comfort and durability</li>
                            <li>Ethically sourced and responsibly produced</li>
                            <li>Signature minimalist aesthetic</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="shipping">
                        <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2.5 font-sans text-muted-sepia">
                            <p>Free standard shipping on all orders over ₹10,000.</p>
                            <p>Express delivery available at checkout.</p>
                            <p>
                              Easy 15-day return policy. Items must be in original condition with all
                              tags attached.
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="care">
                        <AccordionTrigger>Care Instructions</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2.5 font-sans text-muted-sepia">
                            <p>Handle with care to maintain the premium finish.</p>
                            <p>Store in a cool, dry place away from direct sunlight.</p>
                            <p>Clean with a soft, dry cloth only.</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-5xl border-t border-charcoal-ink/10 pt-10">
              <ProductDetailTabs
                productId={product._id}
                description={
                  <p>
                    {product.description && product.description.trim().length > 0
                      ? product.description
                      : generateDeterministicDescription(product.name, product.category)}
                  </p>
                }
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
