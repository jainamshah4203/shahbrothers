"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { formatINR } from "@/lib/formatCurrency";

interface ProductCardProps {
  product: Product & { [key: string]: any };
  onQuickView?: (product: Product) => void;
  onAddToWishlist?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  hideBestsellerBadge?: boolean;
}

const ProductCard = ({ 
  product, 
  onQuickView, 
  onAddToWishlist, 
  onAddToCart,
  hideBestsellerBadge,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageHover = () => {
    if (product.images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleImageLeave = () => {
    setCurrentImageIndex(0);
  };

  const isNew = (product as any).isNewProduct ?? (product as any).isNew ?? false;
  const isBest = (product as any).isBestseller ?? (product as any).isBestSeller ?? false;
  const isLimited = (product as any).limited ?? false;
  const hasSale = !!product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasSale
    ? Math.round(((product.price - (product.salePrice as number)) / product.price) * 100)
    : 0;
  const slug = (product as any).slug || product.id;

  return (
    <Card
      className="group relative product-card border-none shadow-none bg-transparent overflow-hidden"
      className="product-card group border-none shadow-none bg-transparent overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-muted/30 rounded-lg mb-4">
        <Link href={`/products/${slug}`} className="relative block aspect-[3/4]">
          <Image
            src={product.images[currentImageIndex]}
            alt={product.name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onMouseEnter={handleImageHover}
            onMouseLeave={handleImageLeave}
            priority={false}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground">NEW</Badge>
          )}
          {isBest && !hideBestsellerBadge && (
            <Badge variant="secondary">BESTSELLER</Badge>
          )}
          {hasSale && (
            <Badge className="bg-destructive text-destructive-foreground">
              -{discountPercentage}%
            </Badge>
          )}
          {isLimited && (
            <Badge variant="outline" className="bg-background/90">LIMITED</Badge>
          )}
          {!product.inStock && (
            <Badge variant="outline" className="bg-background/90">
              OUT OF STOCK
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 bg-background/90 hover:bg-background"
            onClick={() => onAddToWishlist?.(product.id)}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick View Button - appears on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <div className="m-3 rounded bg-white/90 p-2 shadow-lg backdrop-blur">
            <button
              className="w-full rounded bg-black px-3 py-2 text-xs font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              aria-label={`Quick view ${product.name}`}
              onClick={() => onQuickView?.(product)}
            >
              Quick View
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{product.category}</span>
        </div>
        
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-sm font-semibold text-destructive">
                {formatINR(product.salePrice)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">
              {formatINR(product.price)}
            </span>
          )}
        </div>

        {/* Color Options removed as requested */}
      </div>
    </Card>
  );
};

export default ProductCard;