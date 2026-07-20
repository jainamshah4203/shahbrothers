import BuyBox from "@/components/product/BuyBox";
import Gallery from "@/components/product/Gallery";
import Reviews from "@/components/product/Reviews";
import { apiGet } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    const { mockProducts } = await import('@/data/products');
    const found = mockProducts.find(p => p.slug === slug || p.id === slug);
    if (found) {
      return { ...found, _id: found.id } as unknown as Product;
    }
    return null;
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 md:py-16">
        {!product ? (
          <div className="text-center py-32">
            <h1 className="text-3xl font-serif mb-4">Product not found</h1>
            <p className="text-muted-foreground">Please go back to Collections.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {/* Top section: Gallery & Buy Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              <div className="relative">
                <div className="sticky top-24">
                  <Gallery images={product.images ?? ["/placeholder.svg"]} alt={product.name} />
                </div>
              </div>

              <div className="relative">
                <div className="sticky top-24 space-y-8 animate-in slide-in-from-right-4 duration-700">
                  <div className="space-y-4 border-b border-border/50 pb-8">
                    <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">{product.brand || product.category}</p>
                    <h1 className="text-4xl lg:text-5xl font-serif text-foreground">{product.name}</h1>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {product.isNewProduct && <Badge>NEW ARRIVAL</Badge>}
                      {product.isBestseller && <Badge variant="secondary">BEST SELLER</Badge>}
                      {product.limited && <Badge variant="outline">LIMITED EDITION</Badge>}
                      {product.salePrice && product.salePrice < product.price && (
                        <Badge variant="destructive" className="animate-pulse">
                          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-3xl font-semibold">{formatINR(product.salePrice)}</span>
                          <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/40">{formatINR(product.price)}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-semibold">{formatINR(product.price)}</span>
                      )}
                    </div>
                  </div>

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

                  <div className="pt-8">
                    <Accordion type="single" collapsible className="w-full" defaultValue="features">
                      <AccordionItem value="features">
                        <AccordionTrigger>Product Features</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-2.5 text-muted-foreground">
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
                          <div className="space-y-2.5 text-muted-foreground">
                            <p>Free standard shipping on all orders over ₹10,000.</p>
                            <p>Express delivery available at checkout.</p>
                            <p>Easy 15-day return policy. Items must be in original condition with all tags attached.</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="care">
                        <AccordionTrigger>Care Instructions</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2.5 text-muted-foreground">
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

            {/* Bottom section: Tabs */}
            <div className="max-w-5xl mx-auto w-full pt-10 border-t border-border/50">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-14 mb-8 overflow-x-auto">
                  <TabsTrigger 
                    value="description" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent data-[state=active]:shadow-none px-8 py-3 text-base data-[state=active]:font-semibold transition-all"
                  >
                    Story & Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent data-[state=active]:shadow-none px-8 py-3 text-base data-[state=active]:font-semibold transition-all"
                  >
                    Customer Reviews
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="animate-in fade-in duration-500 pt-4">
                  <div className="prose prose-slate max-w-3xl text-muted-foreground leading-loose text-lg">
                    <p>
                      {(product.description && product.description.trim().length > 0)
                        ? product.description
                        : generateDeterministicDescription(product.name, product.category)}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="pt-4">
                  <Reviews productId={product._id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
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
