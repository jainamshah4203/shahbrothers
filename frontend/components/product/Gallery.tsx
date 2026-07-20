"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  alt: string;
};

function normalizeImageUrl(src: string | undefined): string {
  if (!src) return "/placeholder.svg";
  try {
    let fixed = src.trim();
    fixed = fixed.replace(/unslpash/gi, "unsplash");
    fixed = fixed.replace(/(^|\.)image\.unsplash\.com/gi, "$1images.unsplash.com");
    if (fixed.startsWith("http://")) fixed = fixed.replace("http://", "https://");
    const url = new URL(fixed);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", "800");
      url.searchParams.set("h", "1066"); // 3:4 ratio larger
      url.searchParams.set("q", "80");
      return url.toString();
    }
    return fixed;
  } catch {
    return "/placeholder.svg";
  }
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Gallery({ images, alt }: Props) {
  const prepared = useMemo(() => (images?.length ? images : ["/placeholder.svg"]).map((s) => normalizeImageUrl(s)), [images]);
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i - 1 + prepared.length) % prepared.length);
  const next = () => setIdx((i) => (i + 1) % prepared.length);

  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Thumbnails */}
      <div className="col-span-1 space-y-3 max-h-[600px] overflow-auto pr-1 hidden sm:block custom-scrollbar">
        {prepared.map((src, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`relative w-full aspect-[3/4] overflow-hidden rounded-md border-2 transition-all duration-300 ${idx === i ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]"}`}
          >
            <Image src={src} alt={`${alt} thumb ${i + 1}`} fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>

      {/* Main image with carousel controls */}
      <div className="col-span-5 sm:col-span-4 relative aspect-[3/4] overflow-hidden rounded-lg bg-muted group">
        <Image src={prepared[idx]} alt={alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110 cursor-zoom-in" unoptimized />
        {prepared.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="glass"
              size="icon"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="h-10 w-10 rounded-full"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="glass"
              size="icon"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="h-10 w-10 rounded-full"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
        {prepared.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {prepared.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
