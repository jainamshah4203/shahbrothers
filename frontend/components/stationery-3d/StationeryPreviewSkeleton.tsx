"use client";

/**
 * Clean 2D HTML/CSS skeleton shown while a 3D Canvas chunk loads.
 * Mirrors the warm cream stationery surface without spinning a WebGL context.
 */
export default function StationeryPreviewSkeleton({
  label = "Preparing preview…",
}: {
  label?: string;
}) {
  return (
    <div
      className="relative flex h-full min-h-[320px] w-full items-end overflow-hidden bg-warm-off-white"
      aria-busy="true"
      aria-label={label}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(244,241,234,0.5),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(239,236,230,0.45),transparent_50%)]" />

      {/* Flatlay silhouettes */}
      <div className="absolute left-[18%] top-[22%] h-[48%] w-[34%] rotate-[-8deg] rounded-[2px] bg-linen shadow-[0_18px_40px_-16px_rgba(26,26,26,0.12)]" />
      <div className="absolute bottom-[18%] right-[16%] h-[22%] w-[42%] rotate-[6deg] rounded-full bg-warm-sepia/15 shadow-[0_12px_28px_-12px_rgba(26,26,26,0.1)]" />

      <div className="relative z-[1] w-full px-6 pb-6">
        <div className="h-2 w-28 animate-pulse rounded-full bg-charcoal-ink/10" />
        <p className="mt-3 font-sans text-xs tracking-tight text-warm-sepia">
          {label}
        </p>
      </div>
    </div>
  );
}
