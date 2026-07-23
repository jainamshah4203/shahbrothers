"use client";

import React from "react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useScrollAnim } from "@/hooks/useScrollAnim";

interface ProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
  columns?: 2 | 3 | 4;
}

function GridItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const revealRef = useScrollAnim<HTMLDivElement>({
    mode: "reveal",
    preset: "fadeUp",
    token: "slow",
    delay: Math.min(index, 8) * 0.06,
  });

  return (
    <div ref={revealRef} role="listitem">
      {children}
    </div>
  );
}

/**
 * Tactile product grid — cream surfaces with consistent gutters.
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onQuickView,
  onAddToWishlist,
  className,
  columns = 4,
}) => {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div
      className={cn("grid grid-cols-1 gap-6 md:gap-8", colClass, className)}
      role="list"
    >
      {products.map((product, index) => (
        <GridItem key={product.id} index={index}>
          <ProductCard
            product={product}
            onQuickView={onQuickView}
            onAddToWishlist={onAddToWishlist}
          />
        </GridItem>
      ))}
    </div>
  );
};

export default ProductGrid;
