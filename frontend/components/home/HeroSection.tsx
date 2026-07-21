"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const NOTEBOOK_IMG =
  "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80";
const PEN_IMG =
  "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=700&q=80";

/**
 * Asymmetrical editorial hero — left copy, right stationery flatlay.
 */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-warm-off-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(244,241,234,0.9),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(239,236,230,0.7),transparent_50%)]" />

      <div className="container relative mx-auto grid min-h-[min(92vh,860px)] grid-cols-1 items-center gap-12 px-4 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
        {/* Left — editorial copy */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-6 font-sans text-[0.7rem] font-medium uppercase tracking-[0.22em] text-warm-sepia">
            Shah Brothers
          </p>

          <h1 className="font-serif text-[clamp(3.25rem,7vw,5.75rem)] font-medium leading-[0.95] tracking-[-0.03em] text-charcoal-ink">
            Create
            <span className="mx-3 font-light text-warm-sepia/40" aria-hidden>
              /
            </span>
            <em className="italic font-normal text-charcoal-ink">Inspire</em>
          </h1>

          <p className="mt-7 max-w-md text-left font-sans text-base leading-[1.7] tracking-tight text-warm-sepia md:text-lg">
            Curated writing instruments, notebooks, and desk objects for
            considered work — stationery with presence.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center rounded-full border border-charcoal-ink bg-transparent px-7 py-2.5 font-sans text-sm tracking-tight text-charcoal-ink transition-colors duration-300 hover:bg-charcoal-ink hover:text-warm-off-white"
            >
              Shop Stationery
            </Link>
            <Link
              href="/collections?q=brands"
              className="inline-flex items-center justify-center rounded-full border border-charcoal-ink/40 bg-transparent px-7 py-2.5 font-sans text-sm tracking-tight text-charcoal-ink transition-colors duration-300 hover:border-charcoal-ink hover:bg-charcoal-ink hover:text-warm-off-white"
            >
              Explore Brands
            </Link>
          </div>
        </motion.div>

        {/* Right — overlapping flatlay composition */}
        <motion.div
          className="relative lg:col-span-7"
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative mx-auto aspect-[5/4] w-full max-w-xl lg:ml-auto lg:max-w-none">
            {/* Cream desktop surface */}
            <div className="absolute inset-[6%] rounded-[2px] bg-cream shadow-[inset_0_0_0_1px_rgba(26,26,26,0.04)]" />

            {/* Notebook — back layer */}
            <motion.div
              className="absolute left-[8%] top-[12%] z-10 w-[58%] overflow-hidden rounded-[2px] bg-warm-off-white p-2 shadow-[0_18px_50px_-12px_rgba(26,26,26,0.14)]"
              initial={{ opacity: 0, y: 20, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: -2.5 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-linen">
                <Image
                  src={NOTEBOOK_IMG}
                  alt="Leather-bound notebook"
                  fill
                  sizes="(max-width:1024px) 55vw, 30vw"
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Fountain pen — overlapping front layer */}
            <motion.div
              className="absolute bottom-[10%] right-[6%] z-20 w-[48%] overflow-hidden rounded-[2px] bg-warm-off-white p-2 shadow-[0_22px_55px_-14px_rgba(26,26,26,0.16)]"
              initial={{ opacity: 0, y: 24, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.8, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-linen">
                <Image
                  src={PEN_IMG}
                  alt="Fountain pen on desk"
                  fill
                  sizes="(max-width:1024px) 45vw, 24vw"
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Soft paper grain on the cream surface */}
            <div
              className="pointer-events-none absolute inset-[6%] opacity-[0.04] mix-blend-multiply"
              aria-hidden
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
