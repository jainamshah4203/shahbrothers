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

export default function Gallery({ images, alt }: Props) {
  const prepared = useMemo(() => (images?.length ? images : ["/placeholder.svg"]).map((s) => normalizeImageUrl(s)), [images]);
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i - 1 + prepared.length) % prepared.length);
  const next = () => setIdx((i) => (i + 1) % prepared.length);

  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Thumbnails */}
      <div className="col-span-1 space-y-3 max-h-[540px] overflow-auto pr-1 hidden sm:block">
        {prepared.map((src, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`relative w-full aspect-[3/4] overflow-hidden rounded border ${idx === i ? "border-foreground" : "border-border"}`}
          >
            <Image src={src} alt={`${alt} thumb ${i + 1}`} fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>

      {/* Main image with carousel controls */}
      <div className="col-span-5 sm:col-span-4 relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted">
        <Image src={prepared[idx]} alt={alt} fill className="object-cover" unoptimized />
        {prepared.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white grid place-items-center"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white grid place-items-center"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {prepared.map((_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
