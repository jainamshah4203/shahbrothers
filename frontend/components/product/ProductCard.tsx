"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { formatINR } from "@/lib/formatCurrency";
import { useTiltEffect } from "@/hooks/useTiltEffect";
import { useWishlistStore } from "@/store/wishlist";

interface ProductCardProps {
  product: Product & { [key: string]: any };
  onQuickView?: (product: Product) => void;
  onAddToWishlist?: (productId: string) => void;
  hideBestsellerBadge?: boolean;
}

const ProductCard = ({ 
  product, 
  onQuickView, 
  onAddToWishlist, 
  hideBestsellerBadge,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const tiltRef = useTiltEffect<HTMLDivElement>({ scale: 1.02 });
  const wishlist = useWishlistStore((s: any) => s);
  const isWishlisted = wishlist?.items?.some((id: string) => id === product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(product.id);
    } else if (wishlist) {
      if (isWishlisted) wishlist.removeItem(product.id);
      else wishlist.addItem(product.id);
    }
  };

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
    <div ref={tiltRef} className="h-full">
      <Card
        className="product-card group relative border-none shadow-none bg-transparent overflow-hidden h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative overflow-hidden bg-warm-gray-100 rounded-token-md mb-4">
          <Link href={`/products/${slug}`} className="relative block aspect-[3/4]">
            <Image
              src={product.images[currentImageIndex] || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
              className="object-cover transition-transform duration-700"
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
          isHovered || isWishlisted ? "opacity-100" : "opacity-0"
        }`}>
          <Button
            size="icon"
            variant="secondary"
            className={`h-10 w-10 rounded-full shadow-elevation-1 transition-colors ${isWishlisted ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-warm-white-50 text-soft-black-900 hover:bg-warm-gray-100"}`}
            onClick={toggleWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Quick View Button - appears on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 p-3">
          <Button
            variant="secondary"
            className="w-full bg-warm-white-50/90 backdrop-blur text-soft-black-900 hover:bg-soft-black-900 hover:text-warm-white-50 shadow-floating"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView?.(product);
            }}
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-1 mt-auto">
        <div className="flex items-center gap-2 text-ds-caption text-warm-gray-500">
          <span>{product.category}</span>
        </div>
        
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-ds-product text-soft-black-900 hover:text-wood-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          {product.salePrice ? (
            <>
              <span className="text-ds-price text-destructive">
                {formatINR(product.salePrice)}
              </span>
              <span className="text-ds-caption text-warm-gray-500 line-through">
                {formatINR(product.price)}
              </span>
            </>
          ) : (
            <span className="text-ds-price text-soft-black-900">
              {formatINR(product.price)}
            </span>
          )}
        </div>
      </div>
    </Card>
    </div>
  );
};

export default ProductCard;