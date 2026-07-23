"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { framerTransition } from "@/lib/animations";
import { useScrollAnim } from "@/hooks/useScrollAnim";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const collections = [
  {
    id: 1,
    title: "Writing Instruments",
    description: "Premium pens and pencils for every style",
    image:
      "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=1000&q=80",
    href: "/collections?category=Writing%20Instruments",
    featured: true,
  },
  {
    id: 2,
    title: "Desk Accessories",
    description: "Staplers, punches, and organizers",
    image:
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=80",
    href: "/collections?category=Desk%20Accessories",
    isNew: true,
  },
  {
    id: 3,
    title: "Art Supplies",
    description: "Colors, markers, and sketchbooks",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2080&auto=format&fit=crop",
    href: "/collections?category=Art%20Supplies",
  },
];

type Collection = (typeof collections)[number];

function StyleTile({
  collection,
  className,
  sizes,
  staggerIndex,
}: {
  collection: Collection;
  className?: string;
  sizes: string;
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
        href={collection.href}
        className="group relative block h-full min-h-0 overflow-hidden focus-ring"
      >
        {/* Soft art-print frame via cream padding */}
        <div className="relative h-full w-full overflow-hidden bg-cream p-3 md:p-4">
          <div className="relative h-full min-h-[220px] w-full overflow-hidden">
            <motion.div
              className="absolute inset-0 h-full w-full"
              whileHover={prefersReduced ? undefined : { scale: 1.06 }}
              transition={framerTransition("hover")}
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                sizes={sizes}
                className="object-cover"
              />
            </motion.div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-ink/55 via-charcoal-ink/15 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fountain-navy/10 via-transparent to-warm-sepia/10 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

            {"isNew" in collection && collection.isNew && (
              <span className="absolute left-4 top-4 font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-warm-off-white/90">
                New
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <h3 className="font-serif text-2xl font-medium tracking-tight text-warm-off-white md:text-3xl">
                {collection.title}
              </h3>
              <p className="mt-1.5 max-w-xs font-sans text-sm leading-relaxed tracking-tight text-warm-off-white/75">
                {collection.description}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

const FeaturedCollections = () => {
  const headerRevealRef = useScrollAnim<HTMLDivElement>({
    mode: "reveal",
    preset: "fadeUp",
    token: "slow",
  });
  const [featured, second, third] = collections;

  return (
    <section className="bg-warm-off-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div ref={headerRevealRef} className="mb-12 max-w-xl md:mb-16">
          <h2 className="font-serif text-ds-section text-charcoal-ink">
            Shop by{" "}
            <em className="italic-accent text-fountain-navy">Style</em>
          </h2>
          <p className="mt-3 font-sans text-base leading-[1.65] tracking-tight text-warm-sepia">
            Curated edits arranged like a print gallery — start with the tools
            you write with.
          </p>
        </div>

        {/* Asymmetric: featured spans 2 rows; others stack beside it */}
        <div className="grid auto-rows-[minmax(240px,1fr)] grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12 lg:grid-rows-2 lg:gap-6 lg:auto-rows-[minmax(300px,1fr)]">
          <StyleTile
            collection={featured}
            className="min-h-[480px] lg:col-span-7 lg:row-span-2 lg:min-h-0"
            sizes="(min-width:1024px) 55vw, 100vw"
            staggerIndex={0}
          />
          <StyleTile
            collection={second}
            className="lg:col-span-5 lg:row-span-1"
            sizes="(min-width:1024px) 40vw, 100vw"
            staggerIndex={1}
          />
          <StyleTile
            collection={third}
            className="lg:col-span-5 lg:row-span-1"
            sizes="(min-width:1024px) 40vw, 100vw"
            staggerIndex={2}
          />
        </div>

        <div className="mt-12 flex justify-start md:mt-14">
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 border-b border-charcoal-ink/25 pb-1 font-sans text-sm tracking-tight text-charcoal-ink transition-colors hover:border-charcoal-ink"
          >
            View All Collections
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
