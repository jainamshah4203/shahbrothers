"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { formatINR } from "@/lib/formatCurrency";
import { framerTransition } from "@/lib/animations";
import { useTiltEffect } from "@/hooks/useTiltEffect";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWishlistStore } from "@/store/wishlist";

interface ProductCardProps {
  product: Product & { [key: string]: any };
  onQuickView?: (product: Product) => void;
  onAddToWishlist?: (productId: string) => void;
  hideBestsellerBadge?: boolean;
}

const PAPER_GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** Resolve a minimalist stationery attribute badge (GSM or binding). */
function getStationeryTag(product: Product & { [key: string]: any }): string | null {
  if (product.paperWeight) return String(product.paperWeight);
  if (product.bindingStyle) return String(product.bindingStyle);

  const spec = String(product.specifications || "");
  const gsm = spec.match(/(\d+)\s*GSM/i);
  if (gsm) return `${gsm[1]} GSM`;

  const binding = spec.match(
    /(thread|stitch|perfect|saddle|case|spiral|wire|leather)\s*-?\s*bound/i
  );
  if (binding) {
    return binding[0]
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  if (/ruled|dotted|grid|plain/i.test(spec)) {
    const paper = spec.match(/(ruled|dotted|grid|plain)/i);
    if (paper) return paper[1].charAt(0).toUpperCase() + paper[1].slice(1).toLowerCase();
  }

  return null;
}

const ProductCard = ({
  product,
  onQuickView,
  onAddToWishlist,
  hideBestsellerBadge,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const prefersReduced = useReducedMotion();

  const tiltRef = useTiltEffect<HTMLDivElement>({
    scale: 1.02,
    maxAngle: 8,
  });
  const wishlist = useWishlistStore((s: any) => s);
  const isWishlisted = wishlist?.items?.some((id: string) => id === product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(product.id);
    } else if (wishlist) {
      if (isWishlisted) wishlist.removeItem(product.id);
      else wishlist.addItem(product.id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
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
  const stationeryTag = getStationeryTag(product);

  return (
    <div ref={tiltRef} className="h-full [transform-style:preserve-3d]">
      <Card
        className="product-card group relative flex h-full flex-col overflow-hidden border-none bg-cream shadow-deboss transition-[box-shadow,transform] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-paper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          boxShadow: isHovered
            ? "0 18px 40px -8px rgba(26, 26, 26, 0.12), 0 6px 14px -4px rgba(26, 26, 26, 0.06)"
            : undefined,
        }}
      >
        {/* Paper grain texture */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04] mix-blend-multiply"
          aria-hidden
          style={{ backgroundImage: PAPER_GRAIN_SVG }}
        />

        {/* Product Image */}
        <div className="relative mb-4 overflow-hidden rounded-token-md bg-linen">
          <Link href={`/products/${slug}`} className="relative block aspect-[3/4]">
            {/* Skeleton placeholder until image loads */}
            {!imageLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-cream"
                aria-hidden
              />
            )}
            <motion.div
              className="absolute inset-0"
              animate={
                prefersReduced
                  ? undefined
                  : { y: isHovered ? -6 : 0 }
              }
              transition={framerTransition("hover")}
            >
              <Image
                src={product.images[currentImageIndex] || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
                className={`object-cover transition-transform duration-700 ease-out ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                } ${prefersReduced ? "" : "group-hover:scale-[1.04]"}`}
                onMouseEnter={handleImageHover}
                onMouseLeave={handleImageLeave}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
                priority={false}
              />
            </motion.div>
          </Link>

          {/* Stationery attribute badge — GSM / binding */}
          {stationeryTag && (
            <span className="absolute left-3 top-3 z-[2] border border-charcoal-ink/15 bg-warm-off-white/90 px-2.5 py-1 font-sans text-[0.65rem] font-medium uppercase tracking-[0.14em] text-charcoal-ink backdrop-blur-sm">
              {stationeryTag}
            </span>
          )}

          {/* Status badges */}
          <div
            className={`absolute flex flex-col gap-2 z-[2] ${
              stationeryTag ? "left-3 top-11" : "left-3 top-3"
            }`}
          >
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
              <Badge variant="outline" className="bg-warm-off-white/90">
                LIMITED
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="outline" className="bg-warm-off-white/90">
                OUT OF STOCK
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className={`absolute top-3 right-3 z-[2] flex flex-col gap-2 transition-opacity duration-300 ${
              isHovered || isWishlisted ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              size="icon"
              variant="secondary"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`h-10 w-10 rounded-full shadow-elevation-1 transition-colors ${
                isWishlisted
                  ? "bg-terracotta/10 text-terracotta hover:bg-terracotta/20"
                  : "bg-warm-off-white text-charcoal-ink hover:bg-cream"
              }`}
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Quick View trigger */}
          <div className="absolute inset-x-0 bottom-0 z-[2] translate-y-4 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
            <Button
              variant="secondary"
              className="w-full rounded-full border border-charcoal-ink/20 bg-warm-off-white/90 font-sans text-sm tracking-tight text-charcoal-ink shadow-none backdrop-blur transition-colors hover:bg-charcoal-ink hover:text-warm-off-white"
              onClick={handleQuickView}
            >
              Quick View
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="relative z-[1] mt-auto space-y-1 px-1 pb-1">
          <div className="flex items-center gap-2 text-ds-caption text-warm-sepia">
            <span>{product.category}</span>
          </div>

          <Link href={`/products/${slug}`}>
            <h3 className="line-clamp-2 font-medium text-ds-product text-charcoal-ink transition-colors hover:text-fountain-navy">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="text-ds-price text-destructive">
                  {formatINR(product.salePrice)}
                </span>
                <span className="text-ds-caption text-warm-sepia line-through">
                  {formatINR(product.price)}
                </span>
              </>
            ) : (
              <span className="text-ds-price text-charcoal-ink">
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
