"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Motion, framerTransition } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
};

function normalizeImageUrl(src: string | undefined, size: "thumb" | "main" | "full" = "main"): string {
  if (!src) return "/placeholder.svg";
  try {
    let fixed = src.trim();
    fixed = fixed.replace(/unslpash/gi, "unsplash");
    fixed = fixed.replace(/(^|\.)image\.unsplash\.com/gi, "$1images.unsplash.com");
    if (fixed.startsWith("http://")) fixed = fixed.replace("http://", "https://");
    const url = new URL(fixed);
    if (url.hostname === "images.unsplash.com") {
      const dims = size === "thumb" ? [240, 320] : size === "full" ? [1600, 2133] : [800, 1066];
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(dims[0]));
      url.searchParams.set("h", String(dims[1]));
      url.searchParams.set("q", size === "full" ? "90" : "80");
      return url.toString();
    }
    return fixed;
  } catch {
    return "/placeholder.svg";
  }
}

export default function Gallery({ images, alt }: Props) {
  const prefersReduced = useReducedMotion();
  const prepared = useMemo(
    () => (images?.length ? images : ["/placeholder.svg"]).map((s) => normalizeImageUrl(s, "main")),
    [images]
  );
  const fullRes = useMemo(
    () => (images?.length ? images : ["/placeholder.svg"]).map((s) => normalizeImageUrl(s, "full")),
    [images]
  );
  const thumbs = useMemo(
    () => (images?.length ? images : ["/placeholder.svg"]).map((s) => normalizeImageUrl(s, "thumb")),
    [images]
  );

  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const handlePrev = useCallback(() => {
    setIdx((i) => (i - 1 + prepared.length) % prepared.length);
    setZoomed(false);
  }, [prepared.length]);

  const handleNext = useCallback(() => {
    setIdx((i) => (i + 1) % prepared.length);
    setZoomed(false);
  }, [prepared.length]);

  const handleOpenLightbox = () => {
    setZoomed(false);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, handlePrev, handleNext]);

  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Thumbnails */}
      <div className="col-span-1 hidden max-h-[640px] space-y-3 overflow-auto pr-1 custom-scrollbar sm:block">
        {thumbs.map((src, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            whileTap={prefersReduced ? undefined : Motion.Click.whileTap}
            transition={framerTransition("click")}
            className={cn(
              "relative aspect-[3/4] w-full overflow-hidden rounded-md border-2 bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-warm-off-white",
              idx === i
                ? "border-brass opacity-100 shadow-paper"
                : "border-transparent opacity-55 hover:opacity-100"
            )}
            aria-label={`View image ${i + 1}`}
            aria-current={idx === i}
          >
            <Image src={src} alt={`${alt} thumb ${i + 1}`} fill className="object-cover" unoptimized />
          </motion.button>
        ))}
      </div>

      {/* Main image */}
      <div className="group relative col-span-5 aspect-[3/4] overflow-hidden rounded-lg bg-cream paper-surface sm:col-span-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={prefersReduced ? false : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.98 }}
            transition={framerTransition("medium")}
          >
            <Image
              src={prepared[idx]}
              alt={alt}
              fill
              className="object-cover"
              unoptimized
              priority={idx === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle hover zoom affordance */}
        {!prefersReduced && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-ink/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}

        {prepared.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="glass"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="h-10 w-10 rounded-full"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="glass"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="h-10 w-10 rounded-full"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {prepared.length > 1 && (
            <div className="flex gap-1.5 rounded-full bg-charcoal-ink/40 px-2.5 py-1.5 backdrop-blur-sm">
              {prepared.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass",
                    i === idx ? "w-6 bg-warm-off-white" : "w-1.5 bg-warm-off-white/50"
                  )}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="glass"
            size="icon"
            onClick={handleOpenLightbox}
            className="h-9 w-9 rounded-full"
            aria-label="Open lightbox"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-h-[95vh] max-w-5xl border-charcoal-ink/10 bg-charcoal-ink p-0 text-warm-off-white sm:rounded-2xl">
          <DialogTitle className="sr-only">{alt} — full view</DialogTitle>
          <div className="relative flex min-h-[60vh] flex-col">
            <div
              className="relative flex flex-1 cursor-zoom-in items-center justify-center overflow-hidden p-4 pt-12 md:p-8 md:pt-12"
              onClick={() => setZoomed((z) => !z)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setZoomed((z) => !z);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
            >
              <motion.div
                className="relative h-[70vh] w-full max-w-3xl"
                animate={{ scale: zoomed ? 1.45 : 1 }}
                transition={framerTransition(zoomed ? "medium" : "fast")}
              >
                <Image
                  src={fullRes[idx]}
                  alt={alt}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </motion.div>
            </div>

            {prepared.length > 1 && (
              <div className="flex items-center justify-between gap-4 border-t border-warm-off-white/10 px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="rounded-full text-warm-off-white hover:bg-warm-off-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <p className="font-sans text-xs tracking-widest text-warm-off-white/70">
                  {idx + 1} / {prepared.length}
                  <span className="ml-3 opacity-60">Click image to zoom</span>
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-full text-warm-off-white hover:bg-warm-off-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
