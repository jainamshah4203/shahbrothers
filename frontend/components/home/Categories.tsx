"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { framerTransition } from "@/lib/animations";
import { useScrollAnim } from "@/hooks/useScrollAnim";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CategoryTile {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  tall?: boolean;
}

const CATEGORIES: CategoryTile[] = [
  {
    id: "writing",
    title: "Writing Instruments",
    description: "Fountain pens, rollers & pencils",
    href: "/collections?category=Writing%20Instruments",
    image:
      "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=1200&q=80",
    tall: true,
  },
  {
    id: "journals",
    title: "Journal Notebooks",
    description: "Archival paper · thread-bound",
    href: "/collections?category=Notebooks",
    image:
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "desk",
    title: "Desk Accessories",
    description: "Brass clips, trays & seals",
    href: "/collections?category=Desk%20Accessories",
    image:
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80",
  },
];

function CategoryCard({
  category,
  className,
  staggerIndex,
}: {
  category: CategoryTile;
  className?: string;
  staggerIndex: number;
}) {
  const prefersReduced = useReducedMotion();
  const revealRef = useScrollAnim<HTMLDivElement>({
    mode: "reveal",
    preset: "fadeUp",
    token: "slow",
    delay: staggerIndex * 0.1,
  });

  return (
    <div ref={revealRef} className={`h-full min-h-0 ${className ?? ""}`}>
      <Link
        href={category.href}
        className="group relative block h-full min-h-0 overflow-hidden focus-ring"
      >
        <div className="relative h-full w-full overflow-hidden bg-cream p-3 md:p-4">
          <div
            className={`relative w-full overflow-hidden ${
              category.tall ? "min-h-[420px] h-full" : "min-h-[200px] h-full"
            }`}
          >
            <motion.div
              className="absolute inset-0"
              whileHover={prefersReduced ? undefined : { scale: 1.06 }}
              transition={framerTransition("hover")}
            >
              <Image
                src={category.image}
                alt={category.title}
                fill
                sizes={
                  category.tall
                    ? "(min-width:1024px) 40vw, 100vw"
                    : "(min-width:1024px) 30vw, 100vw"
                }
                className="object-cover"
              />
            </motion.div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-ink/65 via-charcoal-ink/20 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fountain-navy/10 via-transparent to-warm-sepia/10 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <h3 className="font-serif text-2xl font-medium tracking-tight text-warm-off-white md:text-3xl">
                {category.title}
              </h3>
              <p className="mt-1.5 font-sans text-sm tracking-tight text-warm-off-white/80">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/**
 * Magazine-spread masonry — tall writing instruments beside stacked journals & desk.
 */
export const Categories: React.FC = () => {
  const headerRef = useScrollAnim<HTMLDivElement>({
    mode: "reveal",
    preset: "fadeUp",
    token: "slow",
  });
  const tall = CATEGORIES.find((c) => c.tall)!;
  const stacked = CATEGORIES.filter((c) => !c.tall);

  return (
    <section
      className="section-spacing bg-warm-off-white"
      aria-labelledby="shop-by-category"
    >
      <div className="container mx-auto px-4">
        <div ref={headerRef} className="mb-10 max-w-xl md:mb-14">
          <p className="mb-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-sepia">
            Curated desks
          </p>
          <h2
            id="shop-by-category"
            className="font-serif text-ds-section text-charcoal-ink"
          >
            Shop by{" "}
            <em className="italic-accent text-fountain-navy">Category</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 md:items-stretch">
          <div className="md:col-span-5 lg:col-span-5">
            <CategoryCard category={tall} className="h-full" staggerIndex={0} />
          </div>
          <div className="flex flex-col gap-4 md:col-span-7 md:gap-5 lg:col-span-7">
            {stacked.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                className="flex-1"
                staggerIndex={i + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
